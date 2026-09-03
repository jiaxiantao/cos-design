import { CONFIGS, NIGHT_CONFIGS, toNightCloudColor } from '../configs';
import {
  buildSkyGradient,
  celestialScreenPosition,
  computeDayCycle,
  resolveSkyByDayCycle,
  type DayCycleState,
  type DayCycleTimes,
} from '../day-cycle';
import {
  DEFAULT_RAIN_LEVEL,
  DEFAULT_SNOW_LEVEL,
  intensifyRainConfig,
  intensifySnowCount,
  supportsRainLevel,
  supportsSnowLevel,
} from '../precipitation';
import { DEFAULT_FOG_LEVEL, fogBankAlphaScale, intensifyFogConfig, supportsFogLevel } from '../fog';
import { DEFAULT_HAIL_LEVEL, hailSpec as resolveHailSpec, supportsHailLevel } from '../hail-level';
import type { HailIntensitySpec } from '../hail-level';
import {
  DEFAULT_SMOG_LEVEL,
  intensifySmogConfig,
  smogBankAlphaScale,
  supportsSmogLevel,
} from '../smog';
import { windStreakSpec } from '../wind';
import { makeCloud, makeFogSprite } from '../sprites/cloud';
import { makeMoonSprite, makeSunSprite } from '../sprites/celestial';
import { createHailSpritePool, makeHailstone } from '../sprites/hail';
import { createFlakeSpritePool, makeFlake } from '../sprites/snow';
import type {
  CelestialSprite,
  Cloud,
  Drop,
  Flake,
  FogBank,
  FogSprite,
  Hailstone,
  MoonCrater,
  SceneState,
  Splash,
  Star,
  WeatherConfig,
  WeatherSceneParams,
  WindStreak,
} from '../types';

export interface WeatherSceneLayout {
  sky: [string, string];
  cloudRgb: [number, number, number];
  cfg: WeatherConfig;
  sunX: number;
  sunY: number;
  sunR: number;
  skyGradient: CanvasGradient;
  celestial: CelestialSprite | null;
  sunSprite: CelestialSprite | null;
  moonSprite: CelestialSprite | null;
  fogSprite: FogSprite | null;
  dayCycleTimes: DayCycleTimes | null;
  dayCycle: DayCycleState | null;
  sceneTimeMs: number;
  liveClock: boolean;
  hailSpec: HailIntensitySpec | null;
}

/** 雾团贴图颜色（与 draw-atmosphere 的 drawFog 保持一致） */
const fogColor = (weather: string, night: boolean): string => {
  if (night) return weather === 'smog' ? '96, 88, 66' : '138, 150, 168';
  return weather === 'smog' ? '168, 155, 126' : '226, 232, 238';
};

export function createSceneState(
  params: WeatherSceneParams,
): WeatherSceneLayout & { state: SceneState } {
  const {
    ctx,
    width,
    height,
    activeWeather,
    dayCycleTimes = null,
    sceneTimeMs,
    liveClock = false,
    windMotion,
    rainLevel = DEFAULT_RAIN_LEVEL,
    snowLevel = DEFAULT_SNOW_LEVEL,
    hailLevel = DEFAULT_HAIL_LEVEL,
    fogLevel = DEFAULT_FOG_LEVEL,
    smogLevel = DEFAULT_SMOG_LEVEL,
  } = params;
  const baseCfg = CONFIGS[activeWeather];
  const cfg: WeatherConfig = (() => {
    let next = baseCfg;
    if (supportsRainLevel(activeWeather) && next.rain) {
      next = { ...next, rain: intensifyRainConfig(next.rain, rainLevel) };
    }
    if (supportsSnowLevel(activeWeather)) {
      next = {
        ...next,
        snowCount: intensifySnowCount(snowLevel),
        fogBanks: snowLevel >= 7 ? Math.max(next.fogBanks, 3) : next.fogBanks,
        haze: snowLevel >= 7 ? Math.max(next.haze, 0.12) : next.haze,
      };
    }
    if (supportsFogLevel(activeWeather)) {
      next = intensifyFogConfig(next, fogLevel);
    }
    if (supportsSmogLevel(activeWeather)) {
      next = intensifySmogConfig(next, smogLevel);
    }
    return next;
  })();
  const nightCfg = NIGHT_CONFIGS[activeWeather];

  const times = dayCycleTimes ?? null;
  const atMs = liveClock ? Date.now() : sceneTimeMs;
  const cycle = times ? computeDayCycle(atMs, times) : null;
  const night = cycle ? !cycle.isDay : false;

  const sky = cycle
    ? resolveSkyByDayCycle(cfg.sky, nightCfg.sky, cycle)
    : night
      ? nightCfg.sky
      : cfg.sky;
  const cloudRgb = night ? toNightCloudColor(cfg.cloudColor) : cfg.cloudColor;

  const sunR = Math.min(width, height) * 0.09;
  let sunX = width * 0.72;
  let sunY = height * 0.26;
  if (cycle) {
    const pos = celestialScreenPosition(width, height, cycle.arcProgress);
    sunX = pos.x;
    sunY = pos.y;
  }

  const skyGradient = buildSkyGradient(ctx, height, sky);

  // 日弧模式预烘焙日+月，便于昼夜切换；固定模式只烘焙当前天体
  const moonCraters: MoonCrater[] = [
    { dx: -0.32, dy: 0.08, r: 0.17 },
    { dx: 0.24, dy: -0.22, r: 0.12 },
    { dx: 0.04, dy: 0.34, r: 0.1 },
    { dx: 0.36, dy: 0.24, r: 0.07 },
  ];

  const sunSprite = makeSunSprite(cfg, sunR);
  const moonSprite = makeMoonSprite(cfg, sunR, moonCraters);
  const celestial = night ? moonSprite : sunSprite;

  // 星星：日弧模式下始终生成，绘制时按夜间淡入；固定夜间模式同前
  const needStars = night || times != null;
  const stars: Star[] = needStars
    ? Array.from({ length: nightCfg.stars }, () => ({
        x: Math.random() * width,
        y: Math.random() * height * 0.72,
        r: 0.4 + Math.random() * 1.1,
        phase: Math.random() * Math.PI * 2,
        speed: 0.015 + Math.random() * 0.035,
      }))
    : [];

  const clouds: Cloud[] = Array.from({ length: cfg.cloudCount }, () =>
    makeCloud(width, height, cfg.cloudSpread, cloudRgb, cfg.cloudAlpha),
  );

  const drops: Drop[] = cfg.rain
    ? Array.from({ length: cfg.rain.count }, () => ({
        x: Math.random() * (width + 160) - 80,
        y: Math.random() * height,
        len: 8 + Math.random() * 10,
        speed: cfg.rain!.speed * (0.75 + Math.random() * 0.5),
      }))
    : [];

  const splashes: Splash[] = [];

  const fogBanks: FogBank[] = Array.from({ length: cfg.fogBanks }, (_, i) => ({
    x: Math.random() * width,
    y: (i / Math.max(cfg.fogBanks - 1, 1)) * height * 0.9 + height * 0.05,
    rw: width * (0.25 + Math.random() * 0.3),
    rh: height * (0.08 + Math.random() * 0.08),
    speed: (0.1 + Math.random() * 0.25) * (i % 2 === 0 ? 1 : -1),
    alpha:
      (0.1 + Math.random() * 0.1) *
      (supportsFogLevel(activeWeather)
        ? fogBankAlphaScale(fogLevel)
        : supportsSmogLevel(activeWeather)
          ? smogBankAlphaScale(smogLevel)
          : 1),
  }));

  const fogSprite = cfg.fogBanks > 0 ? makeFogSprite(fogColor(activeWeather, night)) : null;

  const flakePool = cfg.snowCount > 0 ? createFlakeSpritePool() : null;
  const flakes: Flake[] =
    flakePool != null
      ? Array.from({ length: cfg.snowCount }, () => makeFlake(width, height, flakePool))
      : [];

  const hailIntensity = supportsHailLevel(activeWeather) ? resolveHailSpec(hailLevel) : null;
  const hailPool = hailIntensity != null ? createHailSpritePool() : null;
  const hailstones: Hailstone[] =
    hailPool != null && hailIntensity != null
      ? Array.from({ length: hailIntensity.count }, () =>
          makeHailstone(
            width,
            height,
            hailPool,
            { min: hailIntensity.sizeMin, max: hailIntensity.sizeMax },
            hailIntensity.speedMul,
          ),
        )
      : [];

  const windStreaks: WindStreak[] = (() => {
    const { count } = windStreakSpec(windMotion.visualLevel);
    if (count <= 0) return [];
    return Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      length: 35 + Math.random() * 120,
      speed: 6 + Math.random() * 10,
      wave: Math.random() * Math.PI * 2,
      alpha: 0.1 + Math.random() * 0.28,
      width: 0.5 + Math.random() * 1.1,
      phase: Math.random() * Math.PI * 2,
    }));
  })();

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
    skyGradient,
    celestial,
    sunSprite,
    moonSprite,
    fogSprite,
    dayCycleTimes: times,
    dayCycle: cycle,
    sceneTimeMs,
    liveClock,
    hailSpec: hailIntensity,
    state: {
      stars,
      moonCraters,
      clouds,
      drops,
      splashes,
      fogBanks,
      flakes,
      hailstones,
      hailPool: hailPool ?? [],
      windStreaks,
      t,
      flashAlpha,
      boltLife,
      boltPoints,
      nextStrike,
    },
  };
}

/** 按时刻刷新日弧位置、天空与日/月切换 */
export function applyDayCycleToScene(
  scene: {
    ctx: CanvasRenderingContext2D;
    width: number;
    height: number;
    activeNight: boolean;
    sky: [string, string];
    skyGradient: CanvasGradient;
    sunX: number;
    sunY: number;
    celestial: CelestialSprite | null;
    sunSprite: CelestialSprite | null;
    moonSprite: CelestialSprite | null;
    dayCycleTimes: DayCycleTimes | null;
    dayCycle: DayCycleState | null;
    sceneTimeMs: number;
    liveClock: boolean;
    cfg: WeatherConfig;
    activeWeather: import('../types').WeatherType;
  },
  nowMs?: number,
) {
  if (!scene.dayCycleTimes) return;

  const atMs = scene.liveClock ? (nowMs ?? Date.now()) : scene.sceneTimeMs;
  const cycle = computeDayCycle(atMs, scene.dayCycleTimes);
  const nightCfg = NIGHT_CONFIGS[scene.activeWeather];
  const sky = resolveSkyByDayCycle(scene.cfg.sky, nightCfg.sky, cycle);
  const pos = celestialScreenPosition(scene.width, scene.height, cycle.arcProgress);

  scene.dayCycle = cycle;
  scene.activeNight = !cycle.isDay;
  scene.sky = sky;
  scene.skyGradient = buildSkyGradient(scene.ctx, scene.height, sky);
  scene.sunX = pos.x;
  scene.sunY = pos.y;
  scene.celestial = cycle.isDay ? scene.sunSprite : scene.moonSprite;
}
