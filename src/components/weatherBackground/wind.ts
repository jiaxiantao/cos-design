export const REFERENCE_WIND_KMH = 16;

export const DEFAULT_WIND_LEVEL = 3;

export const clampWindLevel = (level: number) => Math.min(12, Math.max(0, Math.round(level)));

/** 展示风级 → 视觉风级（整体降两档：3 级≈原 1 级，5 级≈原 3 级） */
export const visualWindLevel = (level: number) => Math.max(0, clampWindLevel(level) - 2);

/** 风场时间缩放：阵风/风向摆动更慢 */
const WIND_FIELD_TIME_SCALE = 0.55;

/** 蒲福风级 → 典型风速（km/h，取各档区间中值） */
const LEVEL_TO_KMH: readonly number[] = [0, 3, 8, 16, 24, 33, 44, 55, 68, 81, 95, 110, 125];

/** 各风级上限（km/h），用于 km/h 反查风级 */
const LEVEL_MAX_KMH: readonly number[] = [1, 5, 11, 19, 28, 38, 49, 61, 74, 88, 102, 117, Infinity];

export interface WindMotion {
  /** 等效风速 km/h */
  speedKmh: number;
  /** 蒲福风级 0~12（展示/实况） */
  level: number;
  /** 用于渲染的视觉风级（比 level 低两档） */
  visualLevel: number;
  /** 相对三级风的强度比 */
  scale: number;
  /** 云层漂移倍率 */
  cloud: number;
  /** 雨/毛毛雨水平风分量倍率（作用于 cfg.rain.wind） */
  rain: number;
  /** 雪花水平飘移 px/帧（负值=向左，与雨丝一致） */
  snowDrift: number;
  /** 冰雹侧向 gust 倍率 */
  hail: number;
  /** 雾团漂移倍率 */
  fog: number;
  /** 风条速度倍率 */
  streak: number;
  /** 风条可见度 0~1（风级越高越明显） */
  streakVisibility: number;
  /** 阵风起伏幅度 0~1（风级越高越剧烈） */
  gustiness: number;
  /** 风向扰动幅度（弧度） */
  wander: number;
}

/** 瞬时风场：阵风强度 + 方向扰动 */
export interface WindFieldSample {
  /** 相对基准的瞬时强度，约 0.15~2.2 */
  intensity: number;
  /** 相对水平的偏角（弧度），正=偏下 */
  angle: number;
  /** 单位方向 x（主风向约定为向右 +1 附近） */
  ux: number;
  /** 单位方向 y */
  uy: number;
}

/**
 * 采样自然风场：多层正弦叠加阵风/静歇，并带空间相位差。
 * `t` 为场景帧计数；`x/y` 用于让画面不同位置不同步。
 */
export const sampleWindField = (
  t: number,
  motion: Pick<WindMotion, 'gustiness' | 'wander'>,
  x = 0,
  y = 0,
): WindFieldSample => {
  const g = motion.gustiness;
  const w = motion.wander;
  const spatial = x * 0.0017 + y * 0.0024;
  const tt = t * WIND_FIELD_TIME_SCALE;

  // 慢涌、中阵、快颤 —— 叠成时快时慢
  const slow = Math.sin(tt * 0.007 + spatial);
  const mid = Math.sin(tt * 0.021 + 1.37 + spatial * 1.4);
  const flutter = Math.sin(tt * 0.055 + 2.8 + spatial * 0.6);
  const raw = 0.5 * slow + 0.35 * mid + 0.15 * flutter;

  // 基准 ~1，阵风感越强起伏越大；偶发尖峰
  let intensity = 1 + raw * (0.25 + g * 0.75);
  const spike = Math.sin(tt * 0.012 + spatial * 0.8);
  if (spike > 0.72) intensity += (spike - 0.72) * (0.8 + g * 2.4);
  // 短暂静歇：把谷底压得更低
  const lull = Math.sin(tt * 0.0095 + 0.6 + spatial);
  if (lull < -0.55) intensity *= 0.45 + g * 0.2;
  intensity = Math.max(0.12, Math.min(2.25, intensity));

  // 风向在水平附近随机游荡，不走死直线
  const angle =
    w *
    (0.55 * Math.sin(tt * 0.0088 + spatial) +
      0.3 * Math.sin(tt * 0.026 + 1.9 + spatial * 1.1) +
      0.15 * Math.sin(tt * 0.063 + 0.4));

  return {
    intensity,
    angle,
    ux: Math.cos(angle),
    uy: Math.sin(angle),
  };
};

/** 按风级生成风条数量与透明度（全天气场景通用） */
export const windStreakSpec = (level: number): { count: number; alphaMul: number } => {
  const lv = clampWindLevel(level);
  if (lv <= 0) return { count: 0, alphaMul: 0 };
  // 1 级起有极淡风感，7 级起接近原先「大风」场景
  const t = Math.min(1, Math.pow(lv / 9, 1.15));
  return {
    count: Math.floor(3 + t * t * 50),
    alphaMul: 0.1 + t * 0.9,
  };
};

/** 风级 → 典型 km/h */
export const windLevelToKmh = (level: number): number =>
  LEVEL_TO_KMH[clampWindLevel(level)] ?? REFERENCE_WIND_KMH;

/** km/h → 蒲福风级 */
export const kmhToWindLevel = (kmh: number): number => {
  const v = Math.max(0, kmh);
  for (let i = 0; i < LEVEL_MAX_KMH.length; i++) {
    if (v <= LEVEL_MAX_KMH[i]) return i;
  }
  return 12;
};

/**
 * 根据风速构建运动参数。
 * 展示风级比视觉风级高两档；三级风视觉上接近原先一级风感。
 */
export const buildWindMotion = (speedKmh: number): WindMotion => {
  const level = kmhToWindLevel(speedKmh);
  const visualLevel = visualWindLevel(level);
  const visualKmh = windLevelToKmh(visualLevel);
  const ref = REFERENCE_WIND_KMH;
  const scale = Math.max(0.04, Math.min(visualKmh / ref, 4.2));
  const { alphaMul } = windStreakSpec(visualLevel);

  // 风越大，水平分量越显著；微风中以竖直下落/飘落为主
  const horizontal = Math.pow(scale, 0.82);
  const gustiness = Math.min(1, Math.pow(visualLevel / 8, 1.1));
  const wander = (0.04 + gustiness * 0.32) * Math.PI;

  return {
    speedKmh,
    level,
    visualLevel,
    scale,
    cloud: 0.28 + scale * 0.72,
    rain: horizontal,
    snowDrift: -(0.04 + horizontal * 0.28),
    hail: 0.4 + horizontal * 0.85,
    fog: 0.32 + horizontal * 0.58,
    streak: 0.55 + horizontal * 0.95,
    streakVisibility: alphaMul,
    gustiness,
    wander,
  };
};

export const resolveWindKmh = (options: {
  live: boolean;
  windLevel: number;
  liveWindKmh?: number | null;
}): number => {
  if (options.live && options.liveWindKmh != null && Number.isFinite(options.liveWindKmh)) {
    return Math.max(0, options.liveWindKmh);
  }
  return windLevelToKmh(options.windLevel);
};
