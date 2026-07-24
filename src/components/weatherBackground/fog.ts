import type { WeatherConfig, WeatherType } from './types';

/** 雾浓度：1 薄雾 · 2 中雾 · 3 浓雾（整体偏淡，避免铺满白屏） */
export type FogLevel = 1 | 2 | 3;

export const DEFAULT_FOG_LEVEL: FogLevel = 2;

export const FOG_LEVEL_LABELS = ['', '薄雾', '中雾', '浓雾'] as const;

export const clampFogLevel = (level: number): FogLevel => Math.min(3, Math.max(1, Math.round(level))) as FogLevel;

export const formatFogLevel = (level: number): string => {
  const lv = clampFogLevel(level);
  return `${lv} · ${FOG_LEVEL_LABELS[lv]}`;
};

export const supportsFogLevel = (weather: WeatherType) => weather === 'fog';

/**
 * 按浓度档调节雾团数量与霾层。
 * 相对旧版整体降一档：新浓雾≈旧中雾，新中雾≈旧薄雾，新薄雾再淡一档。
 */
export const intensifyFogConfig = (cfg: WeatherConfig, level: number): WeatherConfig => {
  const lv = clampFogLevel(level);
  if (lv === 1) {
    // 薄雾：能看清天空与太阳轮廓
    return {
      ...cfg,
      fogBanks: 3,
      haze: 0.06,
      cloudAlpha: Math.min(cfg.cloudAlpha, 0.28),
      sun: 'soft'
    };
  }
  if (lv === 3) {
    // 浓雾：比中雾明显更重，但仍保留太阳轮廓（dim）
    return {
      ...cfg,
      fogBanks: 12,
      haze: 0.3,
      cloudAlpha: 0.42,
      sun: 'dim'
    };
  }
  // 中雾：≈旧版薄雾
  return {
    ...cfg,
    fogBanks: 5,
    haze: 0.11,
    cloudAlpha: 0.32,
    sun: 'dim'
  };
};

/** 雾团单层透明度倍率（与浓度档配套，减轻叠层发白） */
export const fogBankAlphaScale = (level: number): number => {
  const lv = clampFogLevel(level);
  if (lv === 1) return 0.45;
  if (lv === 3) return 0.95;
  return 0.65;
};

/**
 * Open-Meteo WMO → 雾浓度。
 * 45 雾 → 中雾；48 雾凇雾 → 浓雾。
 */
export const fogLevelFromWmo = (code: number): FogLevel | null => {
  if (code === 45) return 2;
  if (code === 48) return 3;
  return null;
};

/**
 * 能见度（米）→ 雾浓度。
 * ≥5km 薄雾 · 1~5km 中雾 · <1km 浓雾
 */
export const fogLevelFromVisibility = (visibilityMeters: number | null | undefined): FogLevel | null => {
  if (visibilityMeters == null || !Number.isFinite(visibilityMeters)) return null;
  if (visibilityMeters >= 5000) return 1;
  if (visibilityMeters >= 1000) return 2;
  return 3;
};
