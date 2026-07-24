import type { WeatherConfig, WeatherType } from './types';

/** 雨量/雪量档位：1~10，5~6 为中雨/中雪 */
export type PrecipLevel = number;

export const MIN_PRECIP_LEVEL = 1;
export const MAX_PRECIP_LEVEL = 10;
export const DEFAULT_RAIN_LEVEL = 5;
export const DEFAULT_SNOW_LEVEL = 5;

export const clampPrecipLevel = (level: number): number =>
  Math.min(MAX_PRECIP_LEVEL, Math.max(MIN_PRECIP_LEVEL, Math.round(level)));

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * 五档强度：
 * 1~2 毛毛 · 3~4 小 · 5~6 中 · 7~8 暴 · 9~10 特大暴
 */
export const precipBand = (level: number): 1 | 2 | 3 | 4 | 5 => {
  const lv = clampPrecipLevel(level);
  if (lv <= 2) return 1;
  if (lv <= 4) return 2;
  if (lv <= 6) return 3;
  if (lv <= 8) return 4;
  return 5;
};

const RAIN_BAND_LABELS = ['毛毛雨', '小雨', '中雨', '暴雨', '特大暴雨'] as const;
const SNOW_BAND_LABELS = ['毛毛雪', '小雪', '中雪', '暴雪', '特大暴雪'] as const;

export const precipLabel = (level: number, kind: 'rain' | 'snow'): string => {
  const band = precipBand(level);
  return (kind === 'rain' ? RAIN_BAND_LABELS : SNOW_BAND_LABELS)[band - 1];
};

/** 滑块文案，如 `5 · 中雨` */
export const formatPrecipLevel = (level: number, kind: 'rain' | 'snow'): string =>
  `${clampPrecipLevel(level)} · ${precipLabel(level, kind)}`;

/** @deprecated 请用 precipLabel / formatPrecipLevel */
export const RAIN_LEVEL_LABELS = ['', ...RAIN_BAND_LABELS] as const;
/** @deprecated 请用 precipLabel / formatPrecipLevel */
export const SNOW_LEVEL_LABELS = ['', ...SNOW_BAND_LABELS] as const;

/** 对外展示用天气（小/中/大雨雪 → 雨天/雪天） */
export const normalizeWeatherType = (weather: WeatherType): WeatherType => {
  if (weather === 'lightRain' || weather === 'moderateRain' || weather === 'heavyRain') return 'rain';
  if (weather === 'lightSnow' || weather === 'moderateSnow' || weather === 'heavySnow') return 'snow';
  return weather;
};

export const isRainWeather = (weather: WeatherType) =>
  weather === 'rain' || weather === 'lightRain' || weather === 'moderateRain' || weather === 'heavyRain';

export const isSnowWeather = (weather: WeatherType) =>
  weather === 'snow' || weather === 'lightSnow' || weather === 'moderateSnow' || weather === 'heavySnow';

/** 可调节雨量：雨天 + 雷阵雨 + 雨夹雪 */
export const supportsRainLevel = (weather: WeatherType) =>
  isRainWeather(weather) || weather === 'thunderstorm' || weather === 'sleet';

/** 可调节雪量：雪天 + 雨夹雪 */
export const supportsSnowLevel = (weather: WeatherType) => isSnowWeather(weather) || weather === 'sleet';

/** 从旧版细分天气类型推断雨量档（映射到 1~10） */
export const rainLevelFromWeather = (weather: WeatherType, fallback: number = DEFAULT_RAIN_LEVEL): number => {
  if (weather === 'lightRain') return 3;
  if (weather === 'moderateRain') return 5;
  if (weather === 'heavyRain') return 8;
  return clampPrecipLevel(fallback);
};

/** 从旧版细分天气类型推断雪量档（映射到 1~10） */
export const snowLevelFromWeather = (weather: WeatherType, fallback: number = DEFAULT_SNOW_LEVEL): number => {
  if (weather === 'lightSnow') return 3;
  if (weather === 'moderateSnow') return 5;
  if (weather === 'heavySnow') return 8;
  return clampPrecipLevel(fallback);
};

/** 五档 → 内部 CONFIGS 天空键（毛毛/小 → light，中 → moderate，暴/特大暴 → heavy） */
const sceneKeyFromBand = (band: 1 | 2 | 3 | 4 | 5, kind: 'rain' | 'snow'): WeatherType => {
  if (kind === 'rain') {
    if (band <= 2) return 'lightRain';
    if (band === 3) return 'moderateRain';
    return 'heavyRain';
  }
  if (band <= 2) return 'lightSnow';
  if (band === 3) return 'moderateSnow';
  return 'heavySnow';
};

/**
 * 将对外 weather + 雨/雪量解析为内部 CONFIGS 键（天空/云层）。
 * 粒子密度另由 intensifyRainConfig / intensifySnowCount 按 1~10 连续插值。
 */
export const resolveSceneWeather = (
  weather: WeatherType,
  rainLevel: number = DEFAULT_RAIN_LEVEL,
  snowLevel: number = DEFAULT_SNOW_LEVEL
): WeatherType => {
  if (weather === 'rain') return sceneKeyFromBand(precipBand(rainLevel), 'rain');
  if (weather === 'lightRain' || weather === 'moderateRain' || weather === 'heavyRain') {
    return sceneKeyFromBand(precipBand(rainLevelFromWeather(weather)), 'rain');
  }
  if (weather === 'snow') return sceneKeyFromBand(precipBand(snowLevel), 'snow');
  if (weather === 'lightSnow' || weather === 'moderateSnow' || weather === 'heavySnow') {
    return sceneKeyFromBand(precipBand(snowLevelFromWeather(weather)), 'snow');
  }
  return weather;
};

/** 按 1~10 档连续插值雨丝参数（毛毛雨极淡 → 特大暴雨极密） */
export const intensifyRainConfig = (
  rain: NonNullable<WeatherConfig['rain']>,
  level: number
): NonNullable<WeatherConfig['rain']> => {
  const t = (clampPrecipLevel(level) - 1) / (MAX_PRECIP_LEVEL - 1);
  return {
    count: Math.round(lerp(35, 340, t)),
    speed: lerp(5.5, 16, t),
    wind: lerp(-0.4, -3.2, t),
    alpha: lerp(0.28, 0.62, t),
    splash: clampPrecipLevel(level) >= 5
  };
};

/** 按 1~10 档连续插值雪花数量 */
export const intensifySnowCount = (level: number): number => {
  const t = (clampPrecipLevel(level) - 1) / (MAX_PRECIP_LEVEL - 1);
  return Math.round(lerp(30, 360, t));
};

/**
 * Open-Meteo WMO 码 → 雨量档 1~10；非雨返回 null。
 * 毛毛雨→2，小雨→3，中雨→5，暴雨→8，特大→10
 */
export const rainLevelFromWmo = (code: number): number | null => {
  // 毛毛雨
  if ([51, 56].includes(code)) return 2;
  // 小雨 / 小阵雨
  if ([61, 66, 80].includes(code)) return 3;
  // 中雨 / 密毛毛雨 / 中阵雨
  if ([53, 55, 57, 63, 81].includes(code)) return 5;
  // 大雨 / 大阵雨 → 暴雨档
  if ([65, 67].includes(code)) return 8;
  if ([82].includes(code)) return 10;
  // 雷暴：默认暴雨量级
  if ([95].includes(code)) return 7;
  return null;
};

/**
 * Open-Meteo WMO 码 → 雪量档 1~10；非雪返回 null。
 * 毛毛雪→2，小雪→3，中雪→5，暴雪→8，特大→10
 */
export const snowLevelFromWmo = (code: number): number | null => {
  if ([77].includes(code)) return 2;
  if ([71, 85].includes(code)) return 3;
  if ([73].includes(code)) return 5;
  if ([75].includes(code)) return 8;
  if ([86].includes(code)) return 10;
  return null;
};
