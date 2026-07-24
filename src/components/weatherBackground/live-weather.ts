import { useEffect, useState } from 'react';
import type { DayCycleTimes } from './day-cycle';
import type { WeatherType } from './index';
import { fogLevelFromVisibility, fogLevelFromWmo, type FogLevel } from './fog';
import { hailLevelFromWmo, type HailLevel } from './hail-level';
import { normalizeWeatherType, rainLevelFromWmo, snowLevelFromWmo, type PrecipLevel } from './precipitation';
import { smogLevelFromVisibility, type SmogLevel } from './smog';

export interface OpenMeteoCurrent {
  /** Open-Meteo 精简天气码（WMO WW 子集，非完整 4677） */
  weatherCode: number;
  /** 10 米风速（km/h） */
  windSpeed: number;
  /** 是否白天 */
  isDay: boolean;
  latitude: number;
  longitude: number;
  /** 当地时区（IANA，如 Asia/Shanghai），来自 Open-Meteo timezone=auto */
  timezone: string | null;
  /** 观测时刻（当地墙钟 HH:mm） */
  localTime: string | null;
  /** 能见度（米）；可能缺失 */
  visibility: number | null;
  /** 实况雨量档 1~10；非雨为 null */
  rainLevel: PrecipLevel | null;
  /** 实况雪量档 1~10；非雪为 null */
  snowLevel: PrecipLevel | null;
  /** 实况雾浓度 1~3；非雾为 null */
  fogLevel: FogLevel | null;
  /** 实况冰雹强度 1~3；非冰雹为 null */
  hailLevel: HailLevel | null;
  /** 实况霾强度 1~3；非霾为 null */
  smogLevel: SmogLevel | null;
  /** 当日日出（ms），来自 Open-Meteo daily */
  sunrise: number | null;
  /** 当日日落（ms），来自 Open-Meteo daily */
  sunset: number | null;
}

export type LiveWeatherStatus = 'idle' | 'locating' | 'fetching' | 'success' | 'error';

export interface LiveWeatherState {
  /** 映射后的组件天气类型，成功前为 null */
  weather: WeatherType | null;
  /** 实况雨量档；非雨天为 null */
  rainLevel: PrecipLevel | null;
  /** 实况雪量档；非雪天为 null */
  snowLevel: PrecipLevel | null;
  /** 实况雾浓度；非雾天为 null */
  fogLevel: FogLevel | null;
  /** 实况冰雹强度；非冰雹为 null */
  hailLevel: HailLevel | null;
  /** 实况霾强度；非霾天为 null */
  smogLevel: SmogLevel | null;
  status: LiveWeatherStatus;
  error: string | null;
  /** Open-Meteo 原始实况数据 */
  current: OpenMeteoCurrent | null;
}

/** Open-Meteo 精简天气码 → WeatherType（雨/雪已合并为 rain / snow） */
const WMO_MAP: Record<number, WeatherType> = {
  0: 'sunny',
  // 1 = mainly clear（晴、少云）
  1: 'sunny',
  2: 'partlyCloudy',
  3: 'overcast',
  45: 'fog',
  48: 'fog',
  // 毛毛雨 / 雨 / 阵雨 → 雨天
  51: 'rain',
  53: 'rain',
  55: 'rain',
  56: 'rain',
  57: 'rain',
  61: 'rain',
  63: 'rain',
  65: 'rain',
  66: 'rain',
  67: 'rain',
  80: 'rain',
  81: 'rain',
  82: 'rain',
  // 雪 / 阵雪 → 雪天
  71: 'snow',
  73: 'snow',
  75: 'snow',
  77: 'snow',
  85: 'snow',
  86: 'snow',
  95: 'thunderstorm',
  // 雷暴伴冰雹：突出冰雹视觉（组件暂无「雷暴+雹」合成场景）
  96: 'hail',
  99: 'hail'
};

/** Open-Meteo / WMO 精简天气码 → WeatherType */
export const mapWmoCodeToWeatherType = (code: number): WeatherType => {
  return normalizeWeatherType(WMO_MAP[code] ?? 'overcast');
};

const IDLE_STATE: LiveWeatherState = {
  weather: null,
  rainLevel: null,
  snowLevel: null,
  fogLevel: null,
  hailLevel: null,
  smogLevel: null,
  status: 'idle',
  error: null,
  current: null
};
const LOCATING_STATE: LiveWeatherState = {
  weather: null,
  rainLevel: null,
  snowLevel: null,
  fogLevel: null,
  hailLevel: null,
  smogLevel: null,
  status: 'locating',
  error: null,
  current: null
};
const FETCHING_STATE: LiveWeatherState = {
  weather: null,
  rainLevel: null,
  snowLevel: null,
  fogLevel: null,
  hailLevel: null,
  smogLevel: null,
  status: 'fetching',
  error: null,
  current: null
};

export interface LiveWeatherCoords {
  latitude: number;
  longitude: number;
}

const isValidCoords = (coords?: LiveWeatherCoords): coords is LiveWeatherCoords =>
  coords != null && Number.isFinite(coords.latitude) && Number.isFinite(coords.longitude);

const parseIsoMs = (value: unknown): number | null => {
  if (typeof value !== 'string' || !value) return null;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : null;
};

/** 从 Open-Meteo current.time（当地墙钟）解析 HH:mm */
const parseLocalHm = (value: unknown): string | null => {
  if (typeof value !== 'string' || !value) return null;
  const m = value.match(/T(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : null;
};

/**
 * 按 IANA 时区取当前当地 HH:mm（用于实况滑块随时钟走动）。
 * 时区无效时回退到 observationLocalTime。
 */
export const formatLocalHm = (timeZone: string | null | undefined, fallbackHm?: string | null): string | null => {
  if (timeZone) {
    try {
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).formatToParts(new Date());
      const hour = parts.find((p) => p.type === 'hour')?.value;
      const minute = parts.find((p) => p.type === 'minute')?.value;
      if (hour != null && minute != null) return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
    } catch {
      // invalid timeZone
    }
  }
  return fallbackHm ?? null;
};

/** 从实况结果取出日弧用的日出日落；缺省时返回 null */
export const getDayCycleTimesFromLive = (current: OpenMeteoCurrent | null): DayCycleTimes | null => {
  if (!current?.sunrise || !current?.sunset) return null;
  return { sunrise: current.sunrise, sunset: current.sunset };
};

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
          current: 'weather_code,wind_speed_10m,is_day,visibility',
          daily: 'sunrise,sunset',
          timezone: 'auto',
          forecast_days: '1'
        });
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
          signal: controller.signal
        });
        if (!res.ok) throw new Error(`Open-Meteo 请求失败（HTTP ${res.status}）`);

        const data = await res.json();
        const code = Number(data?.current?.weather_code);
        if (Number.isNaN(code)) throw new Error('Open-Meteo 返回数据缺少 weather_code');

        const windSpeed = Number(data?.current?.wind_speed_10m ?? 0);
        const sunrise = parseIsoMs(data?.daily?.sunrise?.[0]);
        const sunset = parseIsoMs(data?.daily?.sunset?.[0]);
        const timezone = typeof data?.timezone === 'string' ? data.timezone : null;
        const localTime = parseLocalHm(data?.current?.time) ?? formatLocalHm(timezone);
        const weather = mapWmoCodeToWeatherType(code);
        const rainLevel = rainLevelFromWmo(code);
        const snowLevel = snowLevelFromWmo(code);
        const visibilityRaw = data?.current?.visibility;
        const visibility =
          visibilityRaw != null && Number.isFinite(Number(visibilityRaw)) ? Number(visibilityRaw) : null;
        const fogLevel = weather === 'fog' ? (fogLevelFromVisibility(visibility) ?? fogLevelFromWmo(code) ?? 2) : null;
        const hailLevel = weather === 'hail' ? (hailLevelFromWmo(code) ?? 2) : null;
        const smogLevel = weather === 'smog' ? (smogLevelFromVisibility(visibility) ?? 2) : null;
        if (cancelled) return;
        setState({
          weather,
          rainLevel,
          snowLevel,
          fogLevel,
          hailLevel,
          smogLevel,
          status: 'success',
          error: null,
          current: {
            weatherCode: code,
            windSpeed,
            isDay: data?.current?.is_day === 1,
            latitude: lat,
            longitude: lon,
            timezone,
            localTime,
            visibility,
            rainLevel,
            snowLevel,
            fogLevel,
            hailLevel,
            smogLevel,
            sunrise,
            sunset
          }
        });
      } catch (err) {
        if (cancelled || (err instanceof DOMException && err.name === 'AbortError')) return;
        setState({
          weather: null,
          rainLevel: null,
          snowLevel: null,
          fogLevel: null,
          hailLevel: null,
          smogLevel: null,
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
          setState({
            weather: null,
            rainLevel: null,
            snowLevel: null,
            fogLevel: null,
            hailLevel: null,
            smogLevel: null,
            status: 'error',
            error: '当前环境不支持定位',
            current: null
          });
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
        setState({
          weather: null,
          rainLevel: null,
          snowLevel: null,
          fogLevel: null,
          hailLevel: null,
          smogLevel: null,
          status: 'error',
          error: geoErr.message || '定位失败',
          current: null
        });
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

/** 拉取指定经纬度当日日出日落（Open-Meteo daily） */
export const fetchSunTimes = async (lat: number, lon: number, signal?: AbortSignal): Promise<DayCycleTimes | null> => {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    daily: 'sunrise,sunset',
    timezone: 'auto',
    forecast_days: '1'
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal });
  if (!res.ok) return null;
  const data = await res.json();
  const sunrise = parseIsoMs(data?.daily?.sunrise?.[0]);
  const sunset = parseIsoMs(data?.daily?.sunset?.[0]);
  if (sunrise == null || sunset == null) return null;
  return { sunrise, sunset };
};

/**
 * 按经纬度获取当地日出日落，用于 `time` 参数判断昼夜。
 * 未传 coords 或请求失败时不更新（调用方回退 approximateDayCycleTimes）。
 */
export const useSunTimes = (coords?: LiveWeatherCoords): DayCycleTimes | null => {
  const hasCoords = isValidCoords(coords);
  const latitude = hasCoords ? coords.latitude : null;
  const longitude = hasCoords ? coords.longitude : null;
  const requestKey = `${latitude},${longitude}`;

  const [times, setTimes] = useState<DayCycleTimes | null>(null);
  const [prevKey, setPrevKey] = useState(requestKey);

  if (prevKey !== requestKey) {
    setPrevKey(requestKey);
    setTimes(null);
  }

  useEffect(() => {
    if (latitude == null || longitude == null) return;

    let cancelled = false;
    const controller = new AbortController();

    void fetchSunTimes(latitude, longitude, controller.signal)
      .then((result) => {
        if (!cancelled) setTimes(result);
      })
      .catch(() => {
        if (!cancelled) setTimes(null);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [latitude, longitude]);

  if (!hasCoords) return null;
  return times;
};
