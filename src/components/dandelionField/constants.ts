export const PHASE = {
  WITHER: 3.8,
  SPROUT: 2.6,
  FLOWER: 4.8,
  PUFFING: 5.5,
} as const;

/** 黄花/绒球花头视觉缩放 */
export const FLOWER_HEAD_GROW = 1.05;

/** 花头生命周期关键帧（归一化 0~1，区间可重叠以实现交叉渐变） */
export const HEAD_BLOOM_IN = 0.05;
export const HEAD_BLOOM_OUT = 0.46;
export const HEAD_WILT_IN = 0.54;
export const HEAD_WILT_OUT = 0.82;

/** 花托随凋谢渐显，与花心交叉渐变（非额外黑球） */
export const HEAD_RECEPTACLE_IN = 0.56;
export const HEAD_RECEPTACLE_OUT = 0.9;

/** 黄花视觉退场 ↔ 中心种子立刻起步（同一 wilt 阈值） */
export const FLOWER_WILT_YELLOW_END = 0.7;
export const PUFF_HEAD_START = 0.2;

export const MAX_PLANTS = 22;
export const MIN_PLANT_GAP = 0.06;
export const GERMINATION_CHANCE = 0.14;
export const GERMINATION_NEAR_CHANCE = 0.32;
export const NEAR_PARENT_RADIUS = 0.2;

/** 绒球成熟后静止时长（秒） */
export const MATURE_HOLD_MIN = 1;
export const MATURE_HOLD_MAX = 5;

/** 自然散种持续 3~5 秒 */
export const RELEASE_DURATION_MIN = 3;
export const RELEASE_DURATION_MAX = 5;

/** 干预_boost 最大倍率 */
export const RELEASE_BOOST_MULT = 14;
export const INTRO_DURATION = 3;

/** 落地后等待 1~2 秒再萌发 */
export const GERMINATION_DELAY_MIN = 1;
export const GERMINATION_DELAY_MAX = 2;

/** 未萌发种子在地面渐隐时长（秒量级，life 从 1 到 0） */
export const SEED_GROUND_FADE_RATE = 0.38;

/** 自然飘落时长 4~9 秒（按实际落地距离换算 px/s） */
export const SEED_FALL_DURATION_MIN = 4;
export const SEED_FALL_DURATION_MAX = 9;

/** 水平漂移倍率 */
export const SEED_DRIFT_SCALE = 54;

/** 垂直速度追随变化目标的惯性（越小越“自由”） */
export const SEED_VY_TRACK = 0.034;

/** 触地后缓冲贴地时长（ settleT 0→1 ） */
export const SEED_SETTLE_SPEED = 2.4;

/** 茎干风摆弹簧刚度 / 阻尼 */
export const STEM_WIND_STIFF = 10.5;
export const STEM_WIND_DAMP = 4.6;
export const STEM_LIFT_STIFF = 6.5;

/** 绒球绒毛随风拖拽强度 */
export const FLUFF_WIND_DRAG = 0.38;
export const FLUFF_WIND_DRAG_Y = 0.46;

export const GRASS_WIND_STIFF = 13.5;
export const GRASS_WIND_DAMP = 5.4;
export const GRASS_LIFT_STIFF = 7.8;
export const GRASS_IDLE_AMP = 0.038;

/** 草地风摆视觉幅度倍率 */
export const GRASS_WIND_AMP = 0.32;

export const GOLDEN = Math.PI * (3 - Math.sqrt(5));

/** 茎底竖直段占全长比例（草图：先竖直再弯） */
export const STEM_BASE_VERTICAL = 0.4;

/** 茎尖最大倾角（草图：顶部轻弯，不大角度） */
export const STEM_TIP_MAX_TILT = (22 * Math.PI) / 180;

/** 茎干受风弯曲强度（0~1，越小越 stiff） */
export const STEM_WIND_BEND = 0.42;

/** 茎干垂直风摆强度（独立控制，通常远小于水平） */
export const STEM_WIND_LIFT = 0.18;

/** 吹落绒球种子：最低移速（px/帧）与对应 gust，低于此仅视觉风效、不触发散种 */
export const WIND_BLOW_SPEED_MIN = 9;
export const WIND_BLOW_GUST_MIN = 0.58;
