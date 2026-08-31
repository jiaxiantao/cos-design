export interface DandelionFieldProps {
  width?: number;
  height?: number;
  /** 为 true 时铺满父容器（父级需有明确高度） */
  fill?: boolean;
  /** 初始批次蒲公英株数（入场批次，之后随种子落地自由增减），默认 10 */
  plantCount?: number;
  /** 每株种子数，默认 32 */
  seedCount?: number;
  /** 运动速度倍率 0~3，默认 1 */
  speed?: number;
  /** 是否响应指针交互，默认 true */
  interactive?: boolean;
  /** 画布无障碍标签 */
  ariaLabel?: string;
}

export interface Seed {
  plantId: number;
  attached: boolean;
  /** 脱离母体后是否具备萌发可能 */
  canGerminate: boolean;
  /** 散种原点，用于在母株周围萌发 */
  originX?: number;
  originGround?: number;
  lx: number;
  ly: number;
  lz: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  spin: number;
  life: number;
  size: number;
  hairPhase: number;
  /** 自然散种预定时刻（秒，相对 beginReleasing） */
  scheduledRelease?: number;
  /** 是否已落到地面 */
  landed: boolean;
  /** 落地时刻（秒），未落地为 -1 */
  landedAt: number;
  /** 落地后等待萌发时长 1~2 秒 */
  germinateDelay: number;
  /** 是否已完成萌发判定 */
  germinateChecked: boolean;
  /** 着地缓冲 0=飞行 · 0~1=贴地缓冲 · 1=静止 */
  settleT: number;
  /** 落点地面 Y，未触地为 -1 */
  restGroundY: number;
  /** 飘飞侧摆相位 */
  swayPhase: number;
  /** 个体终端下落速度（px/s） */
  terminalVy: number;
  /** 个体侧向漂移偏置 */
  driftBias: number;
  /** 景深 0=远 1=近，决定落点地面高度 */
  depth: number;
  /** 垂直飘动频率（个体化） */
  fallFreqA: number;
  fallFreqB: number;
  /** 附着时随风相对花头的滞后偏移 */
  fluffOx: number;
  fluffOy: number;
}

export type PlantPhase = 'mature' | 'wither' | 'sprout' | 'flower' | 'puffing';

export interface Plant {
  id: number;
  x: number;
  ground: number;
  /** 完全长成的茎高 */
  stem: number;
  /** 当前可见茎长（萌芽时从 0 增长） */
  stemLen: number;
  sway: number;
  /** 垂直风摆（鼠标上下） */
  windLift: number;
  /** 水平/垂直风摆角速度（弹簧阻尼） */
  swayVel: number;
  liftVel: number;
  /** 个体风摆相位 */
  swayPhase: number;
  /** 个体风摆幅度 */
  swayAmp: number;
  /** 花头 / 绒球缩放 */
  grow: number;
  radius: number;
  lean: number;
  stemBendX: number;
  stemBendY: number;
  stemBend2X: number;
  stemBend2Y: number;
  depth: number;
  /** 个体整体缩放 */
  scale: number;
  /** 本株种子数量（随大小变化） */
  seedQuota: number;
  /** mature=绒球期 · wither=凋谢 · sprout=抽茎 · flower=黄花 · puffing=转白 */
  phase: PlantPhase;
  phaseTime: number;
  /** 茎干下垂 0~1 */
  wilt: number;
  /** 整体透明度 0~1 */
  fade: number;
  /** 绒球饱满度 0~1，控制种子渐显 */
  puffReveal: number;
  /** 基生叶展开 0~1 */
  leafScale: number;
  /** 茎色 0=绿 1=枯褐 */
  stemBrown: number;
  /** 绒球成熟后静止倒计时（秒），≤0 时开始自然散种；-1 表示未进入成熟期 */
  matureHoldLeft: number;
  /** 散种持续时长 3~5 秒 */
  releaseDuration: number;
  /** 散种已进行时间 */
  releaseElapsed: number;
  /** 开始散种时的种子总数 */
  releaseSeedTotal: number;
  /** 是否正在散种 */
  releasing: boolean;
  /** 人为干预加速散种 0~4 */
  releaseBoost: number;
}

export interface PlantLayout {
  x: number;
  ground: number;
  stem: number;
  radius: number;
  lean: number;
  stemBendX: number;
  stemBendY: number;
  stemBend2X: number;
  stemBend2Y: number;
  depth: number;
  scale: number;
  seedQuota: number;
}

export interface IntroSpawn {
  at: number;
  layout: PlantLayout;
  spawned: boolean;
}

export interface GrassTuftDef {
  x: number;
  y: number;
  size: number;
  alpha: number;
  depth: number;
  phase: number;
}

export interface GrassTuftWind {
  sway: number;
  swayVel: number;
  lift: number;
  liftVel: number;
}

export interface HeadLifecycle {
  /** 闭合花苞体量 0~1 */
  budSize: number;
  /** 苞片展开 0~1 */
  budOpen: number;
  /** 黄花绽开 0~1 */
  bloom: number;
  /** 黄花凋谢卷曲 0~1 */
  wilt: number;
  /** 转白前花托 0~1 */
  receptacle: number;
  /** 绒球展开 0~1 */
  puff: number;
  /** 盛开光晕 0~1 */
  glow: number;
}

export interface Point2 {
  x: number;
  y: number;
}

export interface StemCurve {
  base: Point2;
  cp1: Point2;
  cp2: Point2;
  head: Point2;
}

export interface WindState {
  x: number;
  y: number;
  speed: number;
}

export interface SeedMotion {
  reveal: number;
  expand: number;
  fluffLen: number;
}

export const MAX_DPR = 2;
