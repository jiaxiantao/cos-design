import type { WeatherConfig, WeatherType } from './types';

/** 霾强度：1 轻霾 · 2 中霾 · 3 重霾 */
export type SmogLevel = 1 | 2 | 3;

export const DEFAULT_SMOG_LEVEL: SmogLevel = 2;

export const SMOG_LEVEL_LABELS = ['', '轻霾', '中霾', '重霾'] as const;

export const clampSmogLevel = (level: number): SmogLevel => Math.min(3, Math.max(1, Math.round(level))) as SmogLevel;

export const formatSmogLevel = (level: number): string => {
  const lv = clampSmogLevel(level);
  return `${lv} · ${SMOG_LEVEL_LABELS[lv]}`;
};

export const supportsSmogLevel = (weather: WeatherType) => weather === 'smog';

/** 按强度档调节霾层、雾团与天空通透度 */
export const intensifySmogConfig = (cfg: WeatherConfig, level: number): WeatherConfig => {
  const lv = clampSmogLevel(level);
  if (lv === 1) {
    // 轻霾：偏黄灰，仍可见太阳轮廓
    return {
      ...cfg,
      fogBanks: 5,
      haze: 0.16,
      cloudAlpha: Math.min(cfg.cloudAlpha, 0.28),
      sun: 'soft'
    };
  }
  if (lv === 3) {
    // 重霾：浓黄褐罩层，太阳仅剩轮廓
    return {
      ...cfg,
      fogBanks: 16,
      haze: 0.48,
      cloudAlpha: 0.42,
      sun: 'dim'
    };
  }
  // 中霾（默认 ≈ 旧版 smog）
  return {
    ...cfg,
    fogBanks: 12,
    haze: 0.34,
    cloudAlpha: 0.35,
    sun: 'dim'
  };
};

/** 霾雾团透明度倍率 */
export const smogBankAlphaScale = (level: number): number => {
  const lv = clampSmogLevel(level);
  if (lv === 1) return 0.55;
  if (lv === 3) return 1.05;
  return 0.85;
};

/**
 * 能见度（米）→ 霾强度。
 * ≥5km 轻霾 · 1~5km 中霾 · <1km 重霾
 */
export const smogLevelFromVisibility = (visibilityMeters: number | null | undefined): SmogLevel | null => {
  if (visibilityMeters == null || !Number.isFinite(visibilityMeters)) return null;
  if (visibilityMeters >= 5000) return 1;
  if (visibilityMeters >= 1000) return 2;
  return 3;
};
