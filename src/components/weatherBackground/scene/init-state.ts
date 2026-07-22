import { CONFIGS, NIGHT_CONFIGS, toNightCloudColor } from '../configs';
import { makeHailstone } from '../sprites/hail';
import { makeFlake } from '../sprites/snow';
import type {
  Cloud,
  Drop,
  Flake,
  FogBank,
  Hailstone,
  SceneState,
  Splash,
  Star,
  WeatherConfig,
  WeatherSceneParams,
  WindStreak
} from '../types';

export interface WeatherSceneLayout {
  sky: [string, string];
  cloudRgb: [number, number, number];
  cfg: WeatherConfig;
  sunX: number;
  sunY: number;
  sunR: number;
}

export function createSceneState(params: WeatherSceneParams): WeatherSceneLayout & { state: SceneState } {
  const { width, height, activeWeather, activeNight } = params;
  const cfg = CONFIGS[activeWeather];
  const nightCfg = NIGHT_CONFIGS[activeWeather];
  const sky = activeNight ? nightCfg.sky : cfg.sky;
  const cloudRgb = activeNight ? toNightCloudColor(cfg.cloudColor) : cfg.cloudColor;
  const sunX = width * 0.72;
  const sunY = height * 0.26;
  const sunR = Math.min(width, height) * 0.09;

  const stars: Star[] = activeNight
    ? Array.from({ length: nightCfg.stars }, () => ({
        x: Math.random() * width,
        y: Math.random() * height * 0.72,
        r: 0.4 + Math.random() * 1.1,
        phase: Math.random() * Math.PI * 2,
        speed: 0.015 + Math.random() * 0.035
      }))
    : [];

  const moonCraters = [
    { dx: -0.32, dy: 0.08, r: 0.17 },
    { dx: 0.24, dy: -0.22, r: 0.12 },
    { dx: 0.04, dy: 0.34, r: 0.1 },
    { dx: 0.36, dy: 0.24, r: 0.07 }
  ];

  const clouds: Cloud[] = Array.from({ length: cfg.cloudCount }, () => {
    const scale = 0.7 + Math.random() * 0.9;
    const puffCount = 4 + Math.floor(Math.random() * 3);
    return {
      x: Math.random() * (width + 240) - 120,
      y: height * 0.06 + Math.random() * height * cfg.cloudSpread,
      scale,
      speed: 0.12 + Math.random() * 0.22,
      puffs: Array.from({ length: puffCount }, (_, i) => ({
        dx: (i - puffCount / 2) * 26 + (Math.random() - 0.5) * 14,
        dy: (Math.random() - 0.5) * 14,
        r: 22 + Math.random() * 20
      }))
    };
  });

  const drops: Drop[] = cfg.rain
    ? Array.from({ length: cfg.rain.count }, () => ({
        x: Math.random() * (width + 160) - 80,
        y: Math.random() * height,
        len: 8 + Math.random() * 10,
        speed: cfg.rain!.speed * (0.75 + Math.random() * 0.5)
      }))
    : [];

  const splashes: Splash[] = [];

  const fogBanks: FogBank[] = Array.from({ length: cfg.fogBanks }, (_, i) => ({
    x: Math.random() * width,
    y: (i / Math.max(cfg.fogBanks - 1, 1)) * height * 0.9 + height * 0.05,
    rw: width * (0.25 + Math.random() * 0.3),
    rh: height * (0.08 + Math.random() * 0.08),
    speed: (0.1 + Math.random() * 0.25) * (i % 2 === 0 ? 1 : -1),
    alpha: 0.16 + Math.random() * 0.14
  }));

  const flakes: Flake[] = Array.from({ length: cfg.snowCount }, () => makeFlake(width, height));

  const hailstones: Hailstone[] =
    activeWeather === 'hail' ? Array.from({ length: 145 }, () => makeHailstone(width, height)) : [];

  const windStreaks: WindStreak[] =
    activeWeather === 'gale'
      ? Array.from({ length: 46 }, () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          length: 45 + Math.random() * 130,
          speed: 8 + Math.random() * 10,
          wave: Math.random() * Math.PI * 2,
          alpha: 0.12 + Math.random() * 0.3,
          width: 0.6 + Math.random() * 1.2
        }))
      : [];

  const t = 0;
  const flashAlpha = 0;
  const boltLife = 0;
  const boltPoints: [number, number][] = [];
  const nextStrike = 120 + Math.random() * 240;

  return {
    sky,
    cloudRgb,
    cfg,
    sunX,
    sunY,
    sunR,
    state: {
      stars,
      moonCraters,
      clouds,
      drops,
      splashes,
      fogBanks,
      flakes,
      hailstones,
      windStreaks,
      t,
      flashAlpha,
      boltLife,
      boltPoints,
      nextStrike
    }
  };
}
