import type { DayCycleTimes } from './day-cycle';
import type { WeatherType } from './types';
import { fogLevelFromVisibility, fogLevelFromWmo, type FogLevel } from './fog';
import { hailLevelFromWmo, type HailLevel } from './hail-level';
import {
  normalizeWeatherType,
  rainLevelFromWmo,
  snowLevelFromWmo,
  type PrecipLevel,
} from './precipitation';
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
  1: 'sunny',
  2: 'partlyCloudy',
  3: 'overcast',
  45: 'fog',
  48: 'fog',
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
  71: 'snow',
  73: 'snow',
  75: 'snow',
  77: 'snow',
  85: 'snow',
  86: 'snow',
  95: 'thunderstorm',
  96: 'hail',
  99: 'hail',
};

/** Open-Meteo / WMO 精简天气码 → WeatherType */
export const mapWmoCodeToWeatherType = (code: number): WeatherType => {
  return normalizeWeatherType(WMO_MAP[code] ?? 'overcast');
};

export const IDLE_LIVE_WEATHER: LiveWeatherState = {
  weather: null,
  rainLevel: null,
  snowLevel: null,
  fogLevel: null,
  hailLevel: null,
  smogLevel: null,
  status: 'idle',
  error: null,
  current: null,
};

const LOCATING_STATE: LiveWeatherState = { ...IDLE_LIVE_WEATHER, status: 'locating' };
const FETCHING_STATE: LiveWeatherState = { ...IDLE_LIVE_WEATHER, status: 'fetching' };

export interface LiveWeatherCoords {
  latitude: number;
  longitude: number;
}

export const isValidCoords = (coords?: LiveWeatherCoords): coords is LiveWeatherCoords =>
  coords != null && Number.isFinite(coords.latitude) && Number.isFinite(coords.longitude);

const parseIsoMs = (value: unknown): number | null => {
  if (typeof value !== 'string' || !value) return null;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : null;
};

const parseLocalHm = (value: unknown): string | null => {
  if (typeof value !== 'string' || !value) return null;
  const m = value.match(/T(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : null;
};

/**
 * 按 IANA 时区取当前当地 HH:mm（用于实况滑块随时钟走动）。
 * 时区无效时回退到 observationLocalTime。
 */
export const formatLocalHm = (
  timeZone: string | null | undefined,
  fallbackHm?: string | null,
): string | null => {
  if (timeZone) {
    try {
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).formatToParts(new Date());
      const hour = parts.find((p) => p.type === 'hour')?.value;
      const minute = parts.find((p) => p.type === 'minute')?.value;
      if (hour != null && minute != null)
        return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
    } catch {
      // invalid timeZone
    }
  }
  return fallbackHm ?? null;
};

/** 从实况结果取出日弧用的日出日落；缺省时返回 null */
export const getDayCycleTimesFromLive = (
  current: OpenMeteoCurrent | null,
): DayCycleTimes | null => {
  if (!current?.sunrise || !current?.sunset) return null;
  return { sunrise: current.sunrise, sunset: current.sunset };
};

const errorState = (error: string): LiveWeatherState => ({
  ...IDLE_LIVE_WEATHER,
  status: 'error',
  error,
});

export const fetchLiveWeather = async (
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<LiveWeatherState> => {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: 'weather_code,wind_speed_10m,is_day,visibility',
    daily: 'sunrise,sunset',
    timezone: 'auto',
    forecast_days: '1',
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal });
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
  const fogLevel =
    weather === 'fog' ? (fogLevelFromVisibility(visibility) ?? fogLevelFromWmo(code) ?? 2) : null;
  const hailLevel = weather === 'hail' ? (hailLevelFromWmo(code) ?? 2) : null;
  const smogLevel = weather === 'smog' ? (smogLevelFromVisibility(visibility) ?? 2) : null;

  return {
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
      sunset,
    },
  };
};

/**
 * 非 Hook 实况订阅：定位 + Open-Meteo。
 * 返回取消函数；失败时 status 为 error。
 */
export const subscribeLiveWeather = (
  enabled: boolean,
  coords: LiveWeatherCoords | undefined,
  onState: (state: LiveWeatherState) => void,
): (() => void) => {
  if (!enabled) {
    onState(IDLE_LIVE_WEATHER);
    return () => {};
  }

  let cancelled = false;
  const controller = new AbortController();
  const hasCoords = isValidCoords(coords);
  onState(hasCoords ? FETCHING_STATE : LOCATING_STATE);

  const run = async (lat: number, lon: number) => {
    try {
      const next = await fetchLiveWeather(lat, lon, controller.signal);
      if (!cancelled) onState(next);
    } catch (err) {
      if (cancelled || (err instanceof DOMException && err.name === 'AbortError')) return;
      onState(errorState(err instanceof Error ? err.message : '天气获取失败'));
    }
  };

  if (hasCoords) {
    void run(coords.latitude, coords.longitude);
    return () => {
      cancelled = true;
      controller.abort();
    };
  }

  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    Promise.resolve().then(() => {
      if (!cancelled) onState(errorState('当前环境不支持定位'));
    });
    return () => {
      cancelled = true;
    };
  }

  navigator.geolocation.getCurrentPosition(
    ({ coords: position }) => {
      if (cancelled) return;
      onState(FETCHING_STATE);
      void run(position.latitude, position.longitude);
    },
    (geoErr) => {
      if (cancelled) return;
      onState(errorState(geoErr.message || '定位失败'));
    },
    { timeout: 10000, maximumAge: 10 * 60 * 1000 },
  );

  return () => {
    cancelled = true;
    controller.abort();
  };
};

/** 拉取指定经纬度当日日出日落（Open-Meteo daily） */
export const fetchSunTimes = async (
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<DayCycleTimes | null> => {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    daily: 'sunrise,sunset',
    timezone: 'auto',
    forecast_days: '1',
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal });
  if (!res.ok) return null;
  const data = await res.json();
  const sunrise = parseIsoMs(data?.daily?.sunrise?.[0]);
  const sunset = parseIsoMs(data?.daily?.sunset?.[0]);
  if (sunrise == null || sunset == null) return null;
  return { sunrise, sunset };
};

export const subscribeSunTimes = (
  coords: LiveWeatherCoords | undefined,
  onTimes: (times: DayCycleTimes | null) => void,
): (() => void) => {
  if (!isValidCoords(coords)) {
    onTimes(null);
    return () => {};
  }
  let cancelled = false;
  const controller = new AbortController();
  void fetchSunTimes(coords.latitude, coords.longitude, controller.signal)
    .then((result) => {
      if (!cancelled) onTimes(result);
    })
    .catch(() => {
      if (!cancelled) onTimes(null);
    });
  return () => {
    cancelled = true;
    controller.abort();
  };
};
