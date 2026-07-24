/** 冰雹强度：1 细雹 · 2 密雹 · 3 巨雹 */
export type HailLevel = 1 | 2 | 3;

export const DEFAULT_HAIL_LEVEL: HailLevel = 2;

export const HAIL_LEVEL_LABELS = ['', '细雹', '密雹', '巨雹'] as const;

export const clampHailLevel = (level: number): HailLevel => Math.min(3, Math.max(1, Math.round(level))) as HailLevel;

export const formatHailLevel = (level: number): string => {
  const lv = clampHailLevel(level);
  return `${lv} · ${HAIL_LEVEL_LABELS[lv]}`;
};

export const supportsHailLevel = (weather: string) => weather === 'hail';

export interface HailIntensitySpec {
  /** 冰雹粒子数量 */
  count: number;
  /** 半径下限 */
  sizeMin: number;
  /** 半径上限 */
  sizeMax: number;
  /** 下落速度倍率 */
  speedMul: number;
}

/** 三档冰雹视觉参数 */
export const hailSpec = (level: number): HailIntensitySpec => {
  const lv = clampHailLevel(level);
  if (lv === 1) {
    // 细雹：小而疏
    return { count: 75, sizeMin: 0.85, sizeMax: 2.1, speedMul: 0.88 };
  }
  if (lv === 3) {
    // 巨雹：大而密
    return { count: 210, sizeMin: 2.4, sizeMax: 5.6, speedMul: 1.22 };
  }
  // 密雹（默认）
  return { count: 145, sizeMin: 1.4, sizeMax: 3.8, speedMul: 1 };
};

/**
 * Open-Meteo WMO → 冰雹强度。
 * 96 雷暴伴冰雹 → 密雹；99 强雷暴伴冰雹 → 巨雹。
 */
export const hailLevelFromWmo = (code: number): HailLevel | null => {
  if (code === 96) return 2;
  if (code === 99) return 3;
  return null;
};
