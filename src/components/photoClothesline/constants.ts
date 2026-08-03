/** 固定物理步长：与帧率解耦，掉帧时摆动节奏也一致 */
export const PHYSICS_STEP_MS = 1000 / 120;
export const PHYSICS_STEP_S = PHYSICS_STEP_MS / 1000;
export const MAX_FRAME_MS = 64;
/** 夹子咬住吊带末端的位置在相纸上沿之上，照片以该点为轴摆动 */
export const PIN_GRIP = 13;
/** 吊带质点数（含固定在主绳上的那一个） */
export const BAND_POINTS = 6;
/** 每步的约束松弛次数，越多吊带越不可拉伸 */
export const CONSTRAINT_PASSES = 8;
/** 小于此位移视为点击 */
export const CLICK_SLOP_PX = 4;
/** 横向拖出边界后的阻尼 */
export const OVERSCROLL_DAMP = 0.42;
export const MAX_FLING_SPEED = 3800;
/** 松手后照片能带走的最大速度（px/s） */
export const MAX_RELEASE_SPEED = 2600;
/** 吊带上的重力加速度（px/s²），决定摆动周期 */
export const GRAVITY_ACCEL = 2900;
/** 相纸绕夹子回正的扭转刚度，制造甩动时的滞后与抖动 */
export const SWING_K = 165;
/** 相纸最大摆角（deg），再狠的甩动也不会翻过绳子 */
export const MAX_SWING = 76;
/** 绕 Y 轴翻转的回正刚度与最大角度 */
export const SPIN_K = 60;
export const MAX_SPIN = 34;
/** 横向速度换算成翻转角的比例（deg per px/s） */
export const SPIN_DRIVE = 0.05;
/** 松手后多余吊带的收回速率（1/s），时间常数约 90ms */
export const BAND_RECOVER_RATE = 11;
/** 相纸旋转的兜底上限（deg），只在极端甩动时才会碰到 */
export const ROT_LIMIT = 108;
/** 吊带中段的渲染跟随速率（1/s），越大越贴合物理、越小越柔 */
export const BAND_SMOOTH_RATE = 34;
/**
 * 跟手目标的平滑速率（1/s）：抹平指针事件与物理步长之间的错拍。
 * 时间常数约 9ms，快速拖动时照片落后指针也只有几个像素，不会有拖泥带水的手感。
 */
export const DRAG_FOLLOW_RATE = 110;
/** 翻转角驱动速度的平滑速率（1/s），避免指针采样错拍让照片一帧一抖 */
export const SPIN_INPUT_RATE = 18;
/** 判定静止用的阈值：每步位移、距静止位偏移 */
export const REST_MOTION_PX = 0.02;
export const REST_OFFSET_PX = 0.6;
