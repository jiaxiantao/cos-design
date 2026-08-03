import { BAND_POINTS } from './constants';

export interface ChainPoint {
  x: number;
  y: number;
  /** 上一步位置，verlet 用它表示速度 */
  px: number;
  py: number;
  /** 上一物理步开始时的位置，渲染时在它和当前位置之间插值 */
  sx: number;
  sy: number;
  /** 实际画出来的位置，中间质点会再跟随平滑一次 */
  rx: number;
  ry: number;
}

export interface HangerNode {
  /** 吊带质点，[0] 固定在主绳上，末尾那个是照片的悬挂点 */
  chain: ChainPoint[];
  /** 相纸平面内的摆角（deg） */
  rot: number;
  vRot: number;
  /** 绕 Y 轴的翻转角（deg） */
  spin: number;
  vSpin: number;
  /** 平滑后的横向速度，只用来驱动翻转 */
  swayVx: number;
  /** 被拖出来的额外吊带长度（px）：拉的时候立刻跟手，松手后平滑收回 */
  slack: number;
  /** 主绳在该夹点被拽下的量（px） */
  ropeY: number;
  ropeVy: number;
  /** 上一物理步开始时的姿态，供渲染插值 */
  sRot: number;
  sSpin: number;
  sRopeY: number;
}

/** 主绳采样点：基础高度 + 受哪几个夹点牵引 */
export interface RopeAnchor {
  x: number;
  baseY: number;
  pulls: Array<{ index: number; weight: number }>;
}

export interface Layout {
  railWidth: number;
  stageHeight: number;
  cardLefts: number[];
  cardTops: number[];
  pinOffsets: number[];
  /** 吊带固定端在 rail 坐标中的横向位置 */
  pinXs: number[];
  /** 吊带固定端的静止高度（不含动态下拽） */
  anchorYs: number[];
  baseRots: number[];
  centers: number[];
  anchors: RopeAnchor[];
}

export interface Physics {
  /** 吊带自然长度与分段长度 */
  bandLength: number;
  segLength: number;
  /** 重力加速度（px/s²） */
  gravityAccel: number;
  /** verlet 每步保留的速度比例 */
  chainKeep: number;
  swingDamp: number;
  spinDamp: number;
  /** 吊带绷紧后把主绳往下拽的强度 */
  bandK: number;
  /** 松手后多余吊带的收回速率（1/s） */
  bandRecover: number;
  springK: number;
  springC: number;
  neighborK: number;
  maxPull: number;
}

export interface DragState {
  pointerId: number;
  mode: 'photo' | 'pan';
  photoIndex: number;
  /** 抓取点与悬挂点的偏移，保证按下瞬间照片不跳位 */
  grabDx: number;
  grabDy: number;
  /** 指针在 rail 坐标中的位置 */
  pointerX: number;
  pointerY: number;
  /** 平滑后的跟手目标：指针事件的频率和物理步长对不齐，直接钉上去会抖 */
  smoothX: number;
  smoothY: number;
  /** 按下时量一次容器位置，避免每次 move 都触发同步布局 */
  rectLeft: number;
  rectTop: number;
  startX: number;
  startY: number;
  startOffset: number;
  lastX: number;
  lastY: number;
  lastTime: number;
  vx: number;
  vy: number;
  moved: number;
}

export interface Point2 {
  x: number;
  y: number;
}

export const restChainPoint = (
  layout: Layout | null,
  physics: Physics | null,
  index: number,
  point: number
): Point2 => ({
  x: layout?.pinXs[index] ?? 0,
  y: (layout?.anchorYs[index] ?? 0) + (physics?.segLength ?? 0) * point
});

export const createChain = (layout: Layout, physics: Physics, index: number): ChainPoint[] =>
  Array.from({ length: BAND_POINTS }, (_, point) => {
    const rest = restChainPoint(layout, physics, index, point);
    return {
      x: rest.x,
      y: rest.y,
      px: rest.x,
      py: rest.y,
      sx: rest.x,
      sy: rest.y,
      rx: rest.x,
      ry: rest.y
    };
  });

export const createHangerNode = (layout: Layout, physics: Physics, index: number): HangerNode => {
  const baseRot = layout.baseRots[index] ?? 0;
  return {
    chain: createChain(layout, physics, index),
    rot: baseRot,
    vRot: 0,
    spin: 0,
    vSpin: 0,
    swayVx: 0,
    slack: 0,
    ropeY: 0,
    ropeVy: 0,
    sRot: baseRot,
    sSpin: 0,
    sRopeY: 0
  };
};

export const resetHangerNode = (node: HangerNode, layout: Layout | null, physics: Physics | null, index: number) => {
  node.chain.forEach((point, order) => {
    const rest = restChainPoint(layout, physics, index, order);
    point.x = rest.x;
    point.y = rest.y;
    point.px = rest.x;
    point.py = rest.y;
    point.sx = rest.x;
    point.sy = rest.y;
    point.rx = rest.x;
    point.ry = rest.y;
  });
  node.rot = layout?.baseRots[index] ?? 0;
  node.vRot = 0;
  node.spin = 0;
  node.vSpin = 0;
  node.swayVx = 0;
  node.slack = 0;
  node.ropeY = 0;
  node.ropeVy = 0;
  node.sRot = node.rot;
  node.sSpin = 0;
  node.sRopeY = 0;
};
