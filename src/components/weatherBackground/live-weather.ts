import { useEffect, useState } from 'react';
import type { WeatherType } from './index';

export interface OpenMeteoCurrent {
  /** WMO 天气码 */
  weatherCode: number;
  /** 10 米风速（km/h） */
  windSpeed: number;
  /** 是否白天 */
  isDay: boolean;
  latitude: number;
  longitude: number;
}

export type LiveWeatherStatus = 'idle' | 'locating' | 'fetching' | 'success' | 'error';

export interface LiveWeatherState {
  /** 映射后的组件天气类型，成功前为 null */
  weather: WeatherType | null;
  status: LiveWeatherStatus;
  error: string | null;
  /** Open-Meteo 原始实况数据 */
  current: OpenMeteoCurrent | null;
}

/** 蒲福 6 级（强风）起按大风场景渲染 */
const GALE_WIND_KMH = 39;

const WMO_MAP: Record<number, WeatherType> = {
  0: 'sunny',
  // 1 = mainly clear（晴、少云），更接近晴天而非多云
  1: 'sunny',
  2: 'partlyCloudy',
  3: 'overcast',
  45: 'fog',
  48: 'fog',
  51: 'lightRain',
  53: 'lightRain',
  55: 'moderateRain',
  56: 'sleet',
  57: 'sleet',
  61: 'lightRain',
  63: 'moderateRain',
  65: 'heavyRain',
  66: 'sleet',
  67: 'sleet',
  71: 'lightSnow',
  73: 'moderateSnow',
  75: 'heavySnow',
  77: 'lightSnow',
  80: 'lightRain',
  81: 'moderateRain',
  82: 'heavyRain',
  85: 'lightSnow',
  86: 'heavySnow',
  95: 'thunderstorm',
  // 96 / 99 为雷暴伴轻微 / 强冰雹，主导现象是雷暴，按雷阵雨渲染（hail 场景无闪电）
  96: 'thunderstorm',
  99: 'thunderstorm'
};

/** WMO 天气码 → WeatherType；无降水且风速达强风时映射为大风 */
export const mapWmoCodeToWeatherType = (code: number, windSpeedKmh = 0): WeatherType => {
  const base = WMO_MAP[code] ?? 'overcast';
  const calmScene = base === 'sunny' || base === 'partlyCloudy' || base === 'overcast';
  if (calmScene && windSpeedKmh >= GALE_WIND_KMH) return 'gale';
  return base;
};

const IDLE_STATE: LiveWeatherState = { weather: null, status: 'idle', error: null, current: null };
const LOCATING_STATE: LiveWeatherState = { weather: null, status: 'locating', error: null, current: null };
const FETCHING_STATE: LiveWeatherState = { weather: null, status: 'fetching', error: null, current: null };

export interface LiveWeatherCoords {
  latitude: number;
  longitude: number;
}

const isValidCoords = (coords?: LiveWeatherCoords): coords is LiveWeatherCoords =>
  coords != null && Number.isFinite(coords.latitude) && Number.isFinite(coords.longitude);

/**
 * Open-Meteo 实况天气。
 * 传入 coords 时直接按该经纬度查询；未传时使用浏览器定位（需 HTTPS 与用户授权）。
 * 失败时 status 为 error，调用方自行回退。
 */
export const useLiveWeather = (enabled = true, coords?: LiveWeatherCoords): LiveWeatherState => {
  const hasCoords = isValidCoords(coords);
  const latitude = hasCoords ? coords.latitude : null;
  const longitude = hasCoords ? coords.longitude : null;

  const initialState = !enabled ? IDLE_STATE : hasCoords ? FETCHING_STATE : LOCATING_STATE;
  const requestKey = `${enabled}:${latitude},${longitude}`;

  const [state, setState] = useState<LiveWeatherState>(initialState);
  const [prevKey, setPrevKey] = useState(requestKey);

  if (prevKey !== requestKey) {
    setPrevKey(requestKey);
    // 切换坐标重新请求时保留上一次结果，调用方可继续渲染旧天气并叠加 loading
    setState((prev) =>
      enabled && prev.weather ? { ...initialState, weather: prev.weather, current: prev.current } : initialState
    );
  }

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    const controller = new AbortController();

    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const params = new URLSearchParams({
          latitude: String(lat),
          longitude: String(lon),
          current: 'weather_code,wind_speed_10m,is_day'
        });
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
          signal: controller.signal
        });
        if (!res.ok) throw new Error(`Open-Meteo 请求失败（HTTP ${res.status}）`);

        const data = await res.json();
        const code = Number(data?.current?.weather_code);
        if (Number.isNaN(code)) throw new Error('Open-Meteo 返回数据缺少 weather_code');

        const windSpeed = Number(data?.current?.wind_speed_10m ?? 0);
        if (cancelled) return;
        setState({
          weather: mapWmoCodeToWeatherType(code, windSpeed),
          status: 'success',
          error: null,
          current: {
            weatherCode: code,
            windSpeed,
            isDay: data?.current?.is_day === 1,
            latitude: lat,
            longitude: lon
          }
        });
      } catch (err) {
        if (cancelled || (err instanceof DOMException && err.name === 'AbortError')) return;
        setState({
          weather: null,
          status: 'error',
          error: err instanceof Error ? err.message : '天气获取失败',
          current: null
        });
      }
    };

    if (latitude != null && longitude != null) {
      void fetchWeather(latitude, longitude);
      return () => {
        cancelled = true;
        controller.abort();
      };
    }

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      Promise.resolve().then(() => {
        if (!cancelled) {
          setState({ weather: null, status: 'error', error: '当前环境不支持定位', current: null });
        }
      });
      return () => {
        cancelled = true;
      };
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords: position }) => {
        if (cancelled) return;
        setState((prev) => ({ ...prev, status: 'fetching' }));
        void fetchWeather(position.latitude, position.longitude);
      },
      (geoErr) => {
        if (cancelled) return;
        setState({ weather: null, status: 'error', error: geoErr.message || '定位失败', current: null });
      },
      { timeout: 10000, maximumAge: 10 * 60 * 1000 }
    );

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [enabled, latitude, longitude]);

  return state;
};
