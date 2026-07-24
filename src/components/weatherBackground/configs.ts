import type { WeatherConfig, WeatherType } from './types';

export const CONFIGS: Record<WeatherType, WeatherConfig> = {
  sunny: {
    sky: ['#4a9fe0', '#c8e8fb'],
    sun: 'full',
    cloudCount: 1,
    cloudColor: [255, 255, 255],
    cloudAlpha: 0.5,
    cloudSpread: 0.12,
    rain: null,
    fogBanks: 0,
    haze: 0,
    snowCount: 0,
    lightning: false
  },
  partlyCloudy: {
    sky: ['#5b9bd0', '#cfe6f3'],
    sun: 'soft',
    cloudCount: 5,
    cloudColor: [255, 255, 255],
    cloudAlpha: 0.85,
    cloudSpread: 0.22,
    rain: null,
    fogBanks: 0,
    haze: 0,
    snowCount: 0,
    lightning: false
  },
  overcast: {
    sky: ['#8a97a8', '#c3cbd6'],
    sun: 'none',
    cloudCount: 9,
    cloudColor: [100, 116, 139],
    cloudAlpha: 0.55,
    cloudSpread: 0.3,
    rain: null,
    fogBanks: 0,
    haze: 0.06,
    snowCount: 0,
    lightning: false
  },
  /** 雨天默认中雨；实际由 rainLevel 1~10 连续插值；天空按毛毛/小、中、暴三档 CONFIGS */
  rain: {
    sky: ['#55637a', '#7e8ba0'],
    sun: 'none',
    cloudCount: 8,
    cloudColor: [51, 65, 85],
    cloudAlpha: 0.65,
    cloudSpread: 0.26,
    rain: { count: 150, speed: 10, wind: -1.5, alpha: 0.5, splash: true },
    fogBanks: 0,
    haze: 0.06,
    snowCount: 0,
    lightning: false
  },
  /** @deprecated 请使用 rain + rainLevel={2} */
  lightRain: {
    sky: ['#6b7a8f', '#9aa7b8'],
    sun: 'none',
    cloudCount: 7,
    cloudColor: [71, 85, 105],
    cloudAlpha: 0.6,
    cloudSpread: 0.24,
    rain: { count: 70, speed: 7, wind: -0.8, alpha: 0.4, splash: false },
    fogBanks: 0,
    haze: 0.04,
    snowCount: 0,
    lightning: false
  },
  moderateRain: {
    sky: ['#55637a', '#7e8ba0'],
    sun: 'none',
    cloudCount: 8,
    cloudColor: [51, 65, 85],
    cloudAlpha: 0.65,
    cloudSpread: 0.26,
    rain: { count: 150, speed: 10, wind: -1.5, alpha: 0.5, splash: true },
    fogBanks: 0,
    haze: 0.06,
    snowCount: 0,
    lightning: false
  },
  heavyRain: {
    sky: ['#3d4a5f', '#5d6a80'],
    sun: 'none',
    cloudCount: 9,
    cloudColor: [30, 41, 59],
    cloudAlpha: 0.7,
    cloudSpread: 0.3,
    rain: { count: 280, speed: 14, wind: -2.8, alpha: 0.55, splash: true },
    fogBanks: 0,
    haze: 0.1,
    snowCount: 0,
    lightning: false
  },
  thunderstorm: {
    sky: ['#252f42', '#43506a'],
    sun: 'none',
    cloudCount: 10,
    cloudColor: [15, 23, 42],
    cloudAlpha: 0.75,
    cloudSpread: 0.32,
    rain: { count: 240, speed: 13, wind: -2.2, alpha: 0.55, splash: true },
    fogBanks: 0,
    haze: 0.08,
    snowCount: 0,
    lightning: true
  },
  fog: {
    sky: ['#aab4bf', '#d5dbe1'],
    sun: 'dim',
    cloudCount: 3,
    cloudColor: [203, 213, 225],
    cloudAlpha: 0.4,
    cloudSpread: 0.2,
    rain: null,
    fogBanks: 10,
    haze: 0.28,
    snowCount: 0,
    lightning: false
  },
  lightSnow: {
    sky: ['#aab8c8', '#e2e8ef'],
    sun: 'none',
    cloudCount: 5,
    cloudColor: [166, 180, 196],
    cloudAlpha: 0.45,
    cloudSpread: 0.22,
    rain: null,
    fogBanks: 0,
    haze: 0.05,
    snowCount: 70,
    lightning: false
  },
  moderateSnow: {
    sky: ['#9fb0c4', '#dde5ee'],
    sun: 'none',
    cloudCount: 6,
    cloudColor: [148, 163, 184],
    cloudAlpha: 0.5,
    cloudSpread: 0.24,
    rain: null,
    fogBanks: 0,
    haze: 0.08,
    snowCount: 160,
    lightning: false
  },
  heavySnow: {
    sky: ['#8495aa', '#c7d1dc'],
    sun: 'none',
    cloudCount: 9,
    cloudColor: [100, 116, 139],
    cloudAlpha: 0.62,
    cloudSpread: 0.3,
    rain: null,
    fogBanks: 3,
    haze: 0.14,
    snowCount: 300,
    lightning: false
  },
  sleet: {
    sky: ['#78899e', '#b8c5d2'],
    sun: 'none',
    cloudCount: 8,
    cloudColor: [71, 85, 105],
    cloudAlpha: 0.6,
    cloudSpread: 0.28,
    rain: { count: 100, speed: 9, wind: -1.4, alpha: 0.42, splash: true },
    fogBanks: 0,
    haze: 0.09,
    snowCount: 100,
    lightning: false
  },
  hail: {
    sky: ['#46566c', '#77889d'],
    sun: 'none',
    cloudCount: 9,
    cloudColor: [30, 41, 59],
    cloudAlpha: 0.68,
    cloudSpread: 0.3,
    rain: { count: 80, speed: 11, wind: -2.5, alpha: 0.38, splash: true },
    fogBanks: 0,
    haze: 0.1,
    snowCount: 0,
    lightning: false
  },
  smog: {
    sky: ['#8f8b7e', '#c5bca8'],
    sun: 'dim',
    cloudCount: 3,
    cloudColor: [142, 136, 119],
    cloudAlpha: 0.35,
    cloudSpread: 0.2,
    rain: null,
    fogBanks: 12,
    haze: 0.34,
    snowCount: 0,
    lightning: false
  },
  gale: {
    sky: ['#587087', '#a6b5c2'],
    sun: 'soft',
    cloudCount: 8,
    cloudColor: [203, 213, 225],
    cloudAlpha: 0.72,
    cloudSpread: 0.3,
    rain: null,
    fogBanks: 0,
    haze: 0.04,
    snowCount: 0,
    lightning: false
  },
  /** 雪天默认中雪；实际渲染由 resolveSceneWeather + snowLevel 选 light/moderate/heavy */
  snow: {
    sky: ['#9fb0c4', '#dde5ee'],
    sun: 'none',
    cloudCount: 6,
    cloudColor: [148, 163, 184],
    cloudAlpha: 0.5,
    cloudSpread: 0.24,
    rain: null,
    fogBanks: 0,
    haze: 0.08,
    snowCount: 160,
    lightning: false
  }
};

/** 夜间天空渐变与可见星星数量（云越多星越少） */
export const NIGHT_CONFIGS: Record<WeatherType, { sky: [string, string]; stars: number }> = {
  sunny: { sky: ['#0b1a33', '#27476e'], stars: 110 },
  partlyCloudy: { sky: ['#0f1f38', '#2c4666'], stars: 60 },
  overcast: { sky: ['#181f2a', '#333e4e'], stars: 0 },
  rain: { sky: ['#11161f', '#242c3a'], stars: 0 },
  lightRain: { sky: ['#151b26', '#2b3442'], stars: 0 },
  moderateRain: { sky: ['#11161f', '#242c3a'], stars: 0 },
  heavyRain: { sky: ['#0c1017', '#1c232e'], stars: 0 },
  thunderstorm: { sky: ['#0a0e18', '#192132'], stars: 0 },
  fog: { sky: ['#1c222b', '#3a434e'], stars: 0 },
  snow: { sky: ['#131a26', '#333f4f'], stars: 8 },
  lightSnow: { sky: ['#161e2b', '#3a4656'], stars: 20 },
  moderateSnow: { sky: ['#131a26', '#333f4f'], stars: 8 },
  heavySnow: { sky: ['#101623', '#2a3545'], stars: 0 },
  sleet: { sky: ['#121924', '#2c3745'], stars: 0 },
  hail: { sky: ['#0e141d', '#26303e'], stars: 0 },
  smog: { sky: ['#1a1812', '#38321f'], stars: 0 },
  gale: { sky: ['#101a26', '#2e3d4d'], stars: 30 }
};

/** 夜间云色：整体压暗并偏冷蓝 */
export const toNightCloudColor = ([r, g, b]: [number, number, number]): [number, number, number] => [
  Math.round(r * 0.3 + 18),
  Math.round(g * 0.3 + 24),
  Math.round(b * 0.3 + 42)
];
