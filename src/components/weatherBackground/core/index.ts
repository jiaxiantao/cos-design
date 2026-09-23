export { createWeatherBackground } from './engine';
export type {
  WeatherBackgroundController,
  WeatherBackgroundOptions,
  WeatherBackgroundProps,
  WeatherType,
} from './types';

export {
  fetchLiveWeather,
  fetchSunTimes,
  formatLocalHm,
  getDayCycleTimesFromLive,
  IDLE_LIVE_WEATHER,
  isValidCoords,
  mapWmoCodeToWeatherType,
  subscribeLiveWeather,
  subscribeSunTimes,
} from '../live-weather-core';
export type {
  LiveWeatherCoords,
  LiveWeatherState,
  LiveWeatherStatus,
  OpenMeteoCurrent,
} from '../live-weather-core';

export {
  DEFAULT_FOG_LEVEL,
  FOG_LEVEL_LABELS,
  clampFogLevel,
  fogBankAlphaScale,
  fogLevelFromVisibility,
  fogLevelFromWmo,
  formatFogLevel,
  intensifyFogConfig,
  supportsFogLevel,
} from '../fog';
export type { FogLevel } from '../fog';

export {
  DEFAULT_HAIL_LEVEL,
  HAIL_LEVEL_LABELS,
  clampHailLevel,
  formatHailLevel,
  hailLevelFromWmo,
  hailSpec,
  supportsHailLevel,
} from '../hail-level';
export type { HailIntensitySpec, HailLevel } from '../hail-level';

export {
  DEFAULT_SMOG_LEVEL,
  SMOG_LEVEL_LABELS,
  clampSmogLevel,
  formatSmogLevel,
  intensifySmogConfig,
  smogBankAlphaScale,
  smogLevelFromVisibility,
  supportsSmogLevel,
} from '../smog';
export type { SmogLevel } from '../smog';

export {
  DEFAULT_RAIN_LEVEL,
  DEFAULT_SNOW_LEVEL,
  MAX_PRECIP_LEVEL,
  MIN_PRECIP_LEVEL,
  RAIN_LEVEL_LABELS,
  SNOW_LEVEL_LABELS,
  clampPrecipLevel,
  formatPrecipLevel,
  intensifyRainConfig,
  intensifySnowCount,
  isRainWeather,
  isSnowWeather,
  normalizeWeatherType,
  precipBand,
  precipLabel,
  rainLevelFromWeather,
  rainLevelFromWmo,
  resolveSceneWeather,
  snowLevelFromWeather,
  snowLevelFromWmo,
  supportsRainLevel,
  supportsSnowLevel,
} from '../precipitation';
export type { PrecipLevel } from '../precipitation';

export {
  DEFAULT_WIND_LEVEL,
  buildWindMotion,
  kmhToWindLevel,
  sampleWindField,
  visualWindLevel,
  windLevelToKmh,
  windStreakSpec,
} from '../wind';
export type { WindFieldSample, WindMotion } from '../wind';
