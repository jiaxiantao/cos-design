import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './style/index.module.less';
import type { PhotoClotheslineProps } from './types';

/** 固定物理步长：与帧率解耦，掉帧时摆动节奏也一致 */
const PHYSICS_STEP_MS = 1000 / 120;
const PHYSICS_STEP_S = PHYSICS_STEP_MS / 1000;
const MAX_FRAME_MS = 64;
/** 夹子咬住吊带末端的位置在相纸上沿之上，照片以该点为轴摆动 */
const PIN_GRIP = 13;
/** 吊带质点数（含固定在主绳上的那一个） */
const BAND_POINTS = 6;
/** 每步的约束松弛次数，越多吊带越不可拉伸 */
const CONSTRAINT_PASSES = 8;
/** 小于此位移视为点击 */
const CLICK_SLOP_PX = 4;
/** 横向拖出边界后的阻尼 */
const OVERSCROLL_DAMP = 0.42;
const MAX_FLING_SPEED = 3800;
/** 松手后照片能带走的最大速度（px/s） */
const MAX_RELEASE_SPEED = 2600;
/** 吊带上的重力加速度（px/s²），决定摆动周期 */
const GRAVITY_ACCEL = 2900;
/** 相纸绕夹子回正的扭转刚度，制造甩动时的滞后与抖动 */
const SWING_K = 165;
/** 相纸最大摆角（deg），再狠的甩动也不会翻过绳子 */
const MAX_SWING = 76;
/** 绕 Y 轴翻转的回正刚度与最大角度 */
const SPIN_K = 60;
const MAX_SPIN = 34;
/** 横向速度换算成翻转角的比例（deg per px/s） */
const SPIN_DRIVE = 0.05;
/** 松手后多余吊带的收回速率（1/s），时间常数约 90ms */
const BAND_RECOVER_RATE = 11;

/** 相纸旋转的兜底上限（deg），只在极端甩动时才会碰到 */
const ROT_LIMIT = 108;
/** 吊带中段的渲染跟随速率（1/s），越大越贴合物理、越小越柔 */
const BAND_SMOOTH_RATE = 34;
/**
 * 跟手目标的平滑速率（1/s）：抹平指针事件与物理步长之间的错拍。
 * 时间常数约 9ms，快速拖动时照片落后指针也只有几个像素，不会有拖泥带水的手感。
 */
const DRAG_FOLLOW_RATE = 110;
/** 翻转角驱动速度的平滑速率（1/s），避免指针采样错拍让照片一帧一抖 */
const SPIN_INPUT_RATE = 18;
/** 判定静止用的阈值：每步位移、距静止位偏移 */
const REST_MOTION_PX = 0.02;
const REST_OFFSET_PX = 0.6;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** 由索引推出的稳定伪随机数，SSR 与客户端结果一致 */
const pseudoRandom = (seed: number) => {
  const value = Math.sin(seed * 127.1 + 31.7) * 43758.5453;
  return value - Math.floor(value);
};

const cssSize = (value: number | string) => (typeof value === 'number' ? `${value}px` : value);

/** 超出自然长度后越拉越吃力，等价于吊带被逐渐拉紧 */
const softPull = (raw: number, limit: number) => limit * Math.tanh(raw / limit);

interface ChainPoint {
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

interface HangerNode {
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
interface RopeAnchor {
  x: number;
  baseY: number;
  pulls: Array<{ index: number; weight: number }>;
}

interface Layout {
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

interface Physics {
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

interface DragState {
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

/** Catmull-Rom 采样点转三次贝塞尔，绳索过每个夹点且整体平滑 */
const buildRopeD = (points: Array<{ x: number; y: number }>, length = points.length) => {
  if (length < 2) return '';
  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 0; i < length - 1; i += 1) {
    const p1 = points[i];
    const p2 = points[i + 1];
    // 缓冲区可能比实际点数长，越界的槽位不能参与计算
    const p0 = i > 0 ? points[i - 1] : p1;
    const p3 = i + 2 < length ? points[i + 2] : p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
};

const PhotoClothesline: React.FC<PhotoClotheslineProps> = ({
  photos,
  width = '100%',
  height = 480,
  photoWidth = 150,
  photoHeight = 200,
  photoGap = 46,
  ropeTop = 66,
  ropeSag = 26,
  bandLength = 34,
  bandWidth = 5,
  maxPull = 110,
  stiffness = 1,
  damping = 0.16,
  tension = 0.35,
  tilt = 5,
  ropeColor = '#8d7a5c',
  bandColor,
  pinColor = '#d8a761',
  frameColor = '#fffdf7',
  background,
  objectFit = 'cover',
  showCaption = true,
  initialIndex = 0,
  onPhotoClick,
  ariaLabel = 'Photo clothesline',
  className,
  style
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const ropePathsRef = useRef<Array<SVGPathElement | null>>([]);
  const bandPathsRef = useRef<Array<SVGPathElement | null>>([]);
  const bandGlossRef = useRef<Array<SVGPathElement | null>>([]);
  const knotsRef = useRef<Array<SVGCircleElement | null>>([]);
  const cardsRef = useRef<Array<HTMLDivElement | null>>([]);

  const nodesRef = useRef<HangerNode[]>([]);
  const bufferRef = useRef<Array<{ x: number; y: number }>>([]);
  // 上一帧写进 DOM 的内容，没变就别再写，避免让整块 SVG 白白失效重绘
  const paintedBandsRef = useRef<string[]>([]);
  const paintedCardsRef = useRef<string[]>([]);
  const paintedRopeRef = useRef('');
  const paintedRailRef = useRef('');
  const layoutRef = useRef<Layout | null>(null);
  const physicsRef = useRef<Physics | null>(null);
  const offsetRef = useRef(0);
  const offsetVelocityRef = useRef(0);
  const snapTargetRef = useRef<number | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const impulseRef = useRef<{ index: number; vx: number; vy: number } | null>(null);
  const loopRef = useRef<((time: number) => void) | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const accRef = useRef(0);
  const readyRef = useRef(false);
  const requestedIndexRef = useRef(initialIndex);

  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  const count = photos.length;
  const hasCaption = showCaption && photos.some((photo) => photo.title || photo.description);

  const layout = useMemo<Layout>(() => {
    const contentWidth = count > 0 ? count * photoWidth + (count - 1) * photoGap : 0;
    const sidePadding = Math.round(photoWidth * 0.55);
    // 主绳始终铺满可视区，窄内容时照片居中，不会出现半截绳子
    const railWidth = Math.max(contentWidth + sidePadding * 2, viewport.width, photoWidth * 2);
    const padding = (railWidth - contentWidth) / 2;
    const step = photoWidth + photoGap;

    const pinXs: number[] = [];
    for (let index = 0; index < count; index += 1) {
      pinXs.push(padding + index * step + photoWidth * (0.4 + pseudoRandom(index * 5.13) * 0.2));
    }

    /** 主绳整体是一条均匀的抛物线弧，最深处等于 ropeSag */
    const baseRopeY = (x: number) => {
      const t = railWidth > 0 ? clamp(x / railWidth, 0, 1) : 0;
      return ropeTop + ropeSag * 4 * t * (1 - t);
    };

    /** 夹点之间的余绳，让绳子在两张照片中间再垂一点 */
    const spanSag = Math.min(20, photoGap * 0.24 + 5);

    const cardLefts: number[] = [];
    const cardTops: number[] = [];
    const pinOffsets: number[] = [];
    const anchorYs: number[] = [];
    const baseRots: number[] = [];
    const centers: number[] = [];

    for (let index = 0; index < count; index += 1) {
      const left = padding + index * step;
      const pinX = pinXs[index];
      const anchorY = baseRopeY(pinX);
      cardLefts.push(left);
      pinOffsets.push(pinX - left);
      anchorYs.push(anchorY);
      // 照片挂在吊带末端，夹子再往上探出一截咬住吊带
      cardTops.push(anchorY + bandLength + PIN_GRIP);
      baseRots.push((pseudoRandom(index * 3.71) * 2 - 1) * tilt);
      centers.push(left + photoWidth / 2);
    }

    const anchors: RopeAnchor[] = [{ x: 0, baseY: baseRopeY(0), pulls: [] }];
    for (let index = 0; index < count; index += 1) {
      const previousX = index === 0 ? 0 : pinXs[index - 1];
      const midX = (previousX + pinXs[index]) / 2;
      const isEdgeSpan = index === 0;
      anchors.push({
        x: midX,
        baseY: baseRopeY(midX) + spanSag * (isEdgeSpan ? 0.5 : 1),
        pulls: isEdgeSpan
          ? [{ index, weight: 0.3 }]
          : [
              { index: index - 1, weight: 0.45 },
              { index, weight: 0.45 }
            ]
      });
      anchors.push({ x: pinXs[index], baseY: baseRopeY(pinXs[index]), pulls: [{ index, weight: 1 }] });
    }
    if (count > 0) {
      const midX = (pinXs[count - 1] + railWidth) / 2;
      anchors.push({
        x: midX,
        baseY: baseRopeY(midX) + spanSag * 0.5,
        pulls: [{ index: count - 1, weight: 0.3 }]
      });
    }
    anchors.push({ x: railWidth, baseY: baseRopeY(railWidth), pulls: [] });

    return {
      railWidth,
      stageHeight: Math.max(
        viewport.height,
        Math.ceil(ropeTop + ropeSag + bandLength + PIN_GRIP + photoHeight + maxPull + 40)
      ),
      cardLefts,
      cardTops,
      pinOffsets,
      pinXs,
      anchorYs,
      baseRots,
      centers,
      anchors
    };
  }, [
    bandLength,
    count,
    maxPull,
    photoGap,
    photoHeight,
    photoWidth,
    ropeSag,
    ropeTop,
    tilt,
    viewport.height,
    viewport.width
  ]);

  const physics = useMemo<Physics>(() => {
    const springK = 420 * clamp(stiffness, 0.1, 3);
    const zeta = clamp(damping, 0.02, 1);
    return {
      bandLength: Math.max(8, bandLength),
      segLength: Math.max(8, bandLength) / (BAND_POINTS - 1),
      gravityAccel: GRAVITY_ACCEL,
      chainKeep: Math.exp(-(0.6 + zeta * 6) * PHYSICS_STEP_S),
      swingDamp: 2 * clamp(0.28 + zeta, 0.1, 1) * Math.sqrt(SWING_K),
      spinDamp: 2 * clamp(0.35 + zeta, 0.1, 1.2) * Math.sqrt(SPIN_K),
      bandK: springK * 0.9,
      bandRecover: BAND_RECOVER_RATE,
      springK,
      // 主绳阻尼比单独抬高：真实的绳子挂着重物不会像弹簧一样来回振好几下
      springC: 2 * clamp(0.45 + zeta, 0.1, 1.2) * Math.sqrt(springK),
      neighborK: springK * clamp(tension, 0, 1),
      maxPull: Math.max(16, maxPull)
    };
  }, [bandLength, damping, maxPull, stiffness, tension]);

  const canPan = Math.min(0, viewport.width - layout.railWidth) < -0.5;

  const offsetBounds = useCallback(() => {
    const view = viewportRef.current?.clientWidth ?? viewport.width;
    return { min: Math.min(0, view - (layoutRef.current?.railWidth ?? 0)), max: 0 };
  }, [viewport.width]);

  /** 吊带自然下垂时的质点位置，也是判定「静止」的基准 */
  const restChainPoint = useCallback((index: number, point: number) => {
    const currentLayout = layoutRef.current;
    const config = physicsRef.current;
    return {
      x: currentLayout?.pinXs[index] ?? 0,
      y: (currentLayout?.anchorYs[index] ?? 0) + (config?.segLength ?? 0) * point
    };
  }, []);

  const seedChain = useCallback(
    (index: number): ChainPoint[] =>
      Array.from({ length: BAND_POINTS }, (_, point) => {
        const rest = restChainPoint(index, point);
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
      }),
    [restChainPoint]
  );

  /** 复用同一个采样缓冲，避免每帧给曲线新建几十个对象 */
  const takeBuffer = useCallback((size: number) => {
    const buffer = bufferRef.current;
    while (buffer.length < size) buffer.push({ x: 0, y: 0 });
    return buffer;
  }, []);

  /**
   * 物理是定步长跑的，屏幕刷新率跟它对不齐；直接画最新状态会出现「有的帧走两步、有的帧一步都没走」的顿挫。
   * 这里按 alpha 在上一步与当前步之间插值，等价于 rapier 默认开启的插值渲染。
   */
  const paint = useCallback(
    (alpha: number, dt: number) => {
      const currentLayout = layoutRef.current;
      const config = physicsRef.current;
      if (!currentLayout || !config) return;

      const railTransform = `translate3d(${offsetRef.current.toFixed(2)}px, 0, 0)`;
      if (railRef.current && railTransform !== paintedRailRef.current) {
        railRef.current.style.transform = railTransform;
        paintedRailRef.current = railTransform;
      }

      // 中间质点再跟一次平滑，吊带看起来更柔（Lanyard 里对中间两个关节做 lerp 是同样的用意）
      const follow = dt > 0 ? 1 - Math.exp(-dt * BAND_SMOOTH_RATE) : 1;
      const nodes = nodesRef.current;
      for (let index = 0; index < nodes.length; index += 1) {
        const node = nodes[index];
        if (!node) continue;
        const chain = node.chain;
        const last = chain.length - 1;
        const buffer = takeBuffer(chain.length);

        for (let point = 0; point <= last; point += 1) {
          const p = chain[point];
          const ix = p.sx + (p.x - p.sx) * alpha;
          const iy = p.sy + (p.y - p.sy) * alpha;
          if (point === 0 || point === last) {
            // 两端要精确对上绳结与夹子，只有中间可以偷懒
            p.rx = ix;
            p.ry = iy;
          } else {
            p.rx += (ix - p.rx) * follow;
            p.ry += (iy - p.ry) * follow;
          }
          buffer[point].x = p.rx;
          buffer[point].y = p.ry;
        }

        const card = cardsRef.current[index];
        if (card) {
          const end = chain[last];
          const restX = currentLayout.pinXs[index] ?? 0;
          const restY = (currentLayout.anchorYs[index] ?? 0) + config.bandLength;
          const rot = node.sRot + (node.rot - node.sRot) * alpha;
          const spin = node.sSpin + (node.spin - node.sSpin) * alpha;
          const transform =
            `translate3d(${(end.rx - restX).toFixed(2)}px, ${(end.ry - restY).toFixed(2)}px, 0) ` +
            `rotate(${rot.toFixed(2)}deg) rotateY(${spin.toFixed(2)}deg)`;
          if (transform !== paintedCardsRef.current[index]) {
            card.style.transform = transform;
            paintedCardsRef.current[index] = transform;
          }
        }

        const bandD = buildRopeD(buffer, chain.length);
        if (bandD !== paintedBandsRef.current[index]) {
          paintedBandsRef.current[index] = bandD;
          bandPathsRef.current[index]?.setAttribute('d', bandD);
          bandGlossRef.current[index]?.setAttribute('d', bandD);
          const knot = knotsRef.current[index];
          if (knot) {
            knot.setAttribute('cx', chain[0].rx.toFixed(2));
            knot.setAttribute('cy', chain[0].ry.toFixed(2));
          }
        }
      }

      const anchors = currentLayout.anchors;
      const points = takeBuffer(anchors.length);
      for (let i = 0; i < anchors.length; i += 1) {
        const anchor = anchors[i];
        let y = anchor.baseY;
        for (const pull of anchor.pulls) {
          const node = nodes[pull.index];
          if (node) y += (node.sRopeY + (node.ropeY - node.sRopeY) * alpha) * pull.weight;
        }
        points[i].x = anchor.x;
        points[i].y = y;
      }
      const ropeD = buildRopeD(points, anchors.length);
      if (ropeD !== paintedRopeRef.current) {
        paintedRopeRef.current = ropeD;
        for (const path of ropePathsRef.current) {
          path?.setAttribute('d', ropeD);
        }
      }
    },
    [takeBuffer]
  );

  const stepPhysics = useCallback(
    (h: number) => {
      const config = physicsRef.current;
      const currentLayout = layoutRef.current;
      if (!config || !currentLayout) return;

      const nodes = nodesRef.current;
      const drag = dragRef.current;
      const draggingIndex = drag?.mode === 'photo' ? drag.photoIndex : -1;
      const impulse = impulseRef.current;
      impulseRef.current = null;

      if (drag) {
        // 手停下来速度就衰减，按住不动后松手不会再甩出去
        const keep = Math.exp(-h * 6);
        drag.vx *= keep;
        drag.vy *= keep;
        // 指针事件是 60~120Hz 且抖动不均，直接拿原始坐标当约束会让吊带和翻转角一帧一抖
        const follow = 1 - Math.exp(-h * DRAG_FOLLOW_RATE);
        drag.smoothX += (drag.pointerX - drag.smoothX) * follow;
        drag.smoothY += (drag.pointerY - drag.smoothY) * follow;
      }

      for (let index = 0; index < nodes.length; index += 1) {
        const node = nodes[index];
        const chain = node.chain;
        const last = chain.length - 1;

        // 记录这一步的起点，渲染时在起点与终点之间插值
        for (let point = 0; point <= last; point += 1) {
          chain[point].sx = chain[point].x;
          chain[point].sy = chain[point].y;
        }
        node.sRot = node.rot;
        node.sSpin = node.spin;
        node.sRopeY = node.ropeY;
        const pinX = currentLayout.pinXs[index] ?? 0;
        const anchorY = (currentLayout.anchorYs[index] ?? 0) + node.ropeY;
        const pullLimit = config.maxPull;
        const dragging = index === draggingIndex && drag ? drag : null;

        // 手往外拉多少就放出多少吊带，松手后按指数收回。
        // 这样约束在任何一帧都是满足的，不会出现「松手瞬间被求解器一步拽回原长」的位置突跳。
        let wantSlack = 0;
        let wantX = 0;
        let wantY = 0;
        if (dragging) {
          wantX = dragging.smoothX - dragging.grabDx;
          wantY = dragging.smoothY - dragging.grabDy;
          const dist = Math.hypot(wantX - pinX, wantY - anchorY);
          wantSlack = Math.max(0, softPull(dist - config.bandLength, pullLimit));
        }
        node.slack =
          wantSlack >= node.slack
            ? wantSlack
            : node.slack + (wantSlack - node.slack) * (1 - Math.exp(-h * config.bandRecover));
        if (node.slack < 0.02) node.slack = 0;

        const reach = config.bandLength + node.slack;
        const segLength = reach / (BAND_POINTS - 1);

        if (impulse && impulse.index === index) {
          // 松手甩出 / 键盘拨动：直接写成 verlet 的位置差，就是给悬挂点一个初速度
          chain[last].px = chain[last].x - impulse.vx * h;
          chain[last].py = chain[last].y - impulse.vy * h;
        }

        // 1) verlet 积分：位置差即速度，重力只作用在自由质点上
        const fall = config.gravityAccel * h * h;
        for (let point = 1; point <= last; point += 1) {
          const p = chain[point];
          const vx = (p.x - p.px) * config.chainKeep;
          const vy = (p.y - p.py) * config.chainKeep;
          p.px = p.x;
          p.py = p.y;
          p.x += vx;
          p.y += vy + fall;
        }

        // 2) 拖拽目标：抓着照片任意方向走，最远只到当前放出来的吊带长度
        let target: { x: number; y: number } | null = null;
        if (dragging) {
          const dx = wantX - pinX;
          const dy = wantY - anchorY;
          const dist = Math.hypot(dx, dy);
          target =
            dist > reach && dist > 0.001
              ? { x: pinX + (dx / dist) * reach, y: anchorY + (dy / dist) * reach }
              : { x: wantX, y: wantY };
        }

        // 3) 松弛约束：固定端钉在主绳上，被拖的末端钉在指针上，中间保持段长
        for (let pass = 0; pass < CONSTRAINT_PASSES; pass += 1) {
          chain[0].x = pinX;
          chain[0].y = anchorY;
          if (target) {
            chain[last].x = target.x;
            chain[last].y = target.y;
          }
          for (let point = 0; point < last; point += 1) {
            const a = chain[point];
            const b = chain[point + 1];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dist = Math.hypot(dx, dy) || 0.0001;
            // 吊带只拉不撑：把照片举起来时它会松垂打弯，而不是像硬杆一样顶回去
            if (dist <= segLength) continue;
            const shift = (dist - segLength) / dist;
            const aFixed = point === 0;
            const bFixed = point + 1 === last && target !== null;
            const wa = aFixed ? 0 : bFixed ? 1 : 0.5;
            const wb = bFixed ? 0 : aFixed ? 1 : 0.5;
            a.x += dx * shift * wa;
            a.y += dy * shift * wa;
            b.x -= dx * shift * wb;
            b.y -= dy * shift * wb;
          }
        }

        // 4) 相纸顺着整条吊带的走向悬挂。取首尾连线而不是最后一小段：
        //    单段只有几个像素长，方向对求解残差极其敏感，拿它定角度会抖。
        const end = chain[last];
        const rawAngle = -(Math.atan2(end.x - chain[0].x, end.y - chain[0].y) * 180) / Math.PI;
        const segAngle = MAX_SWING * Math.tanh(rawAngle / MAX_SWING);
        const targetRot = (currentLayout.baseRots[index] ?? 0) + segAngle;
        node.vRot += ((targetRot - node.rot) * SWING_K - node.vRot * config.swingDamp) * h;
        // 只兜底防止相纸整个翻过去；正常摆动被 tanh 限在 ±MAX_SWING 内，够不到这个界，不会卡住
        node.rot = clamp(node.rot + node.vRot * h, -ROT_LIMIT, ROT_LIMIT);

        // 5) 横向甩动带出绕 Y 轴的翻转，停下后自动转回正面
        const cardVx = (end.x - end.px) / h;
        node.swayVx += (cardVx - node.swayVx) * (1 - Math.exp(-h * SPIN_INPUT_RATE));
        const targetSpin = clamp(-node.swayVx * SPIN_DRIVE, -MAX_SPIN, MAX_SPIN);
        node.vSpin += ((targetSpin - node.spin) * SPIN_K - node.vSpin * config.spinDamp) * h;
        node.spin += node.vSpin * h;

        // 6) 放出来的吊带越多，主绳被拽得越低；slack 是平滑收回的，所以松手时主绳不会被一脚踹回去
        let force = -config.springK * node.ropeY - config.springC * node.ropeVy;
        if (node.slack > 0) {
          const spanY = end.y - anchorY;
          const spanLength = Math.hypot(end.x - pinX, spanY) || 1;
          force += config.bandK * node.slack * Math.max(spanY / spanLength, 0);
        }
        const left = nodes[index - 1];
        const right = nodes[index + 1];
        if (left) force += config.neighborK * (left.ropeY - node.ropeY);
        if (right) force += config.neighborK * (right.ropeY - node.ropeY);
        node.ropeVy += force * h;
        node.ropeY = clamp(node.ropeY + node.ropeVy * h, -config.maxPull, config.maxPull * 1.2);
      }

      if (drag?.mode === 'pan') return;

      const { min, max } = offsetBounds();
      const snapTarget = snapTargetRef.current;
      if (snapTarget !== null) {
        const remaining = snapTarget - offsetRef.current;
        offsetRef.current += remaining * (1 - Math.exp(-h * 12));
        offsetVelocityRef.current = 0;
        if (Math.abs(remaining) < 0.4) {
          offsetRef.current = snapTarget;
          snapTargetRef.current = null;
        }
        return;
      }
      if (drag) return;

      const offset = offsetRef.current;
      if (offset > max || offset < min) {
        // 拖过头后像橡皮筋一样被拽回边界
        const bound = offset > max ? max : min;
        offsetVelocityRef.current += ((bound - offset) * 220 - offsetVelocityRef.current * 15) * h;
        offsetRef.current += offsetVelocityRef.current * h;
        if (Math.abs(bound - offsetRef.current) < 0.4 && Math.abs(offsetVelocityRef.current) < 24) {
          offsetRef.current = bound;
          offsetVelocityRef.current = 0;
        }
        return;
      }
      if (offsetVelocityRef.current !== 0) {
        offsetRef.current += offsetVelocityRef.current * h;
        offsetVelocityRef.current *= Math.exp(-h * 2.8);
        if (Math.abs(offsetVelocityRef.current) < 12) offsetVelocityRef.current = 0;
        offsetRef.current = clamp(offsetRef.current, min, max);
      }
    },
    [offsetBounds]
  );

  /**
   * 静止判定看「每步位移」而不是绝对位置：绳索约束会让吊带静态多伸长零点几个像素，
   * 再叠加「距静止位足够近」这一条，摆到最高点那一帧速度为零也不会被误判成停下。
   */
  const isSettled = useCallback(() => {
    if (dragRef.current || snapTargetRef.current !== null || impulseRef.current) return false;
    if (Math.abs(offsetVelocityRef.current) > 0.5) return false;
    const { min, max } = offsetBounds();
    if (offsetRef.current > max + 0.4 || offsetRef.current < min - 0.4) return false;
    const currentLayout = layoutRef.current;
    return nodesRef.current.every((node, index) => {
      const base = currentLayout?.baseRots[index] ?? 0;
      if (
        node.slack > 0 ||
        Math.abs(node.rot - base) > 1 ||
        Math.abs(node.vRot) > 4 ||
        Math.abs(node.spin) > 0.6 ||
        Math.abs(node.vSpin) > 4 ||
        Math.abs(node.ropeY) > 0.3 ||
        Math.abs(node.ropeVy) > 3
      ) {
        return false;
      }
      return node.chain.every((point, order) => {
        const rest = restChainPoint(index, order);
        return (
          Math.hypot(point.x - rest.x, point.y - rest.y) < REST_OFFSET_PX &&
          Math.abs(point.x - point.px) < REST_MOTION_PX &&
          Math.abs(point.y - point.py) < REST_MOTION_PX
        );
      });
    });
  }, [offsetBounds, restChainPoint]);

  const settle = useCallback(() => {
    const currentLayout = layoutRef.current;
    nodesRef.current.forEach((node, index) => {
      node.chain.forEach((point, order) => {
        const rest = restChainPoint(index, order);
        point.x = rest.x;
        point.y = rest.y;
        point.px = rest.x;
        point.py = rest.y;
        point.sx = rest.x;
        point.sy = rest.y;
        point.rx = rest.x;
        point.ry = rest.y;
      });
      node.rot = currentLayout?.baseRots[index] ?? 0;
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
    });
    offsetVelocityRef.current = 0;
  }, [restChainPoint]);

  // 帧循环装在 ref 里，指针事件与键盘都能随时把它唤起
  useEffect(() => {
    const loop = (time: number) => {
      frameRef.current = null;
      const previous = lastTimeRef.current || time;
      lastTimeRef.current = time;
      const frameMs = Math.min(time - previous, MAX_FRAME_MS);
      accRef.current += frameMs;

      let guard = 0;
      while (accRef.current >= PHYSICS_STEP_MS && guard < 12) {
        stepPhysics(PHYSICS_STEP_S);
        accRef.current -= PHYSICS_STEP_MS;
        guard += 1;
      }
      if (guard >= 12) accRef.current = 0;

      if (isSettled()) {
        settle();
        paint(1, 0);
        lastTimeRef.current = 0;
        accRef.current = 0;
        return;
      }

      paint(accRef.current / PHYSICS_STEP_MS, frameMs / 1000);
      frameRef.current = window.requestAnimationFrame(loop);
    };
    loopRef.current = loop;
    return () => {
      loopRef.current = null;
    };
  }, [isSettled, paint, settle, stepPhysics]);

  const startLoop = useCallback(() => {
    if (frameRef.current !== null || typeof window === 'undefined') return;
    const loop = loopRef.current;
    if (!loop) return;
    lastTimeRef.current = 0;
    accRef.current = 0;
    frameRef.current = window.requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    layoutRef.current = layout;
    physicsRef.current = physics;
  }, [layout, physics]);

  // 尺寸或照片数变化后重新挂绳，避免质点留在旧的夹点下面
  useEffect(() => {
    nodesRef.current = Array.from({ length: count }, (_, index) => ({
      chain: seedChain(index),
      rot: layout.baseRots[index] ?? 0,
      vRot: 0,
      spin: 0,
      vSpin: 0,
      swayVx: 0,
      slack: 0,
      ropeY: 0,
      ropeVy: 0,
      sRot: layout.baseRots[index] ?? 0,
      sSpin: 0,
      sRopeY: 0
    }));
    cardsRef.current.length = count;
    paintedRopeRef.current = '';
    paintedRailRef.current = '';
  }, [count, layout, physics, seedChain]);

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const measure = (nextWidth: number, nextHeight: number) =>
      setViewport((prev) =>
        prev.width === nextWidth && prev.height === nextHeight ? prev : { width: nextWidth, height: nextHeight }
      );
    measure(element.clientWidth, element.clientHeight);
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) measure(Math.round(entry.contentRect.width), Math.round(entry.contentRect.height));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  /** 让某张照片停在可视区中央（首次渲染直接就位，之后平滑滑过去） */
  const offsetForIndex = useCallback(
    (index: number) => {
      const view = viewportRef.current?.clientWidth ?? viewport.width;
      const center = layoutRef.current?.centers[clamp(index, 0, Math.max(0, count - 1))];
      if (center === undefined) return 0;
      const { min, max } = offsetBounds();
      return clamp(view / 2 - center, min, max);
    },
    [count, offsetBounds, viewport.width]
  );

  useEffect(() => {
    if (viewport.width <= 0) return;
    if (!readyRef.current) {
      readyRef.current = true;
      requestedIndexRef.current = initialIndex;
      offsetRef.current = offsetForIndex(initialIndex);
      paint(1, 0);
      return;
    }
    if (requestedIndexRef.current !== initialIndex) {
      requestedIndexRef.current = initialIndex;
      snapTargetRef.current = offsetForIndex(initialIndex);
      startLoop();
      return;
    }
    const { min, max } = offsetBounds();
    offsetRef.current = clamp(offsetRef.current, min, max);
    paint(1, 0);
  }, [count, initialIndex, layout, offsetBounds, offsetForIndex, paint, startLoop, viewport.width]);

  useEffect(
    () => () => {
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    },
    []
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0 && event.pointerType === 'mouse') return;
      const target = event.target as HTMLElement | null;
      const hanger = target?.closest?.('[data-photo-index]') as HTMLElement | null;
      const rawIndex = hanger ? Number(hanger.dataset.photoIndex) : -1;
      const photoIndex = Number.isFinite(rawIndex) ? rawIndex : -1;

      const rect = viewportRef.current?.getBoundingClientRect();
      const rectLeft = rect?.left ?? 0;
      const rectTop = rect?.top ?? 0;
      const pointerX = event.clientX - rectLeft - offsetRef.current;
      const pointerY = event.clientY - rectTop;
      const node = photoIndex >= 0 ? nodesRef.current[photoIndex] : undefined;
      const end = node?.chain[node.chain.length - 1];

      snapTargetRef.current = null;
      offsetVelocityRef.current = 0;
      dragRef.current = {
        pointerId: event.pointerId,
        // 抓住照片就是抓住吊牌，任意方向甩；空白处拖拽才是横向浏览
        mode: end ? 'photo' : 'pan',
        photoIndex,
        grabDx: end ? pointerX - end.x : 0,
        grabDy: end ? pointerY - end.y : 0,
        pointerX,
        pointerY,
        smoothX: pointerX,
        smoothY: pointerY,
        rectLeft,
        rectTop,
        startX: event.clientX,
        startY: event.clientY,
        startOffset: offsetRef.current,
        lastX: event.clientX,
        lastY: event.clientY,
        lastTime: event.timeStamp,
        vx: 0,
        vy: 0,
        moved: 0
      };
      event.currentTarget.setPointerCapture(event.pointerId);
      startLoop();
    },
    [startLoop]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;

      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      drag.moved = Math.max(drag.moved, Math.hypot(dx, dy));

      const elapsed = Math.max(event.timeStamp - drag.lastTime, 1) / 1000;
      drag.vx = 0.7 * ((event.clientX - drag.lastX) / elapsed) + 0.3 * drag.vx;
      drag.vy = 0.7 * ((event.clientY - drag.lastY) / elapsed) + 0.3 * drag.vy;
      drag.lastX = event.clientX;
      drag.lastY = event.clientY;
      drag.lastTime = event.timeStamp;

      if (drag.mode === 'pan') {
        const { min, max } = offsetBounds();
        const next = drag.startOffset + dx;
        const overshoot = next > max ? next - max : next < min ? next - min : 0;
        offsetRef.current = next - overshoot * (1 - OVERSCROLL_DAMP);
        startLoop();
        return;
      }

      drag.pointerX = event.clientX - drag.rectLeft - offsetRef.current;
      drag.pointerY = event.clientY - drag.rectTop;
      startLoop();
    },
    [offsetBounds, startLoop]
  );

  const finishDrag = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      dragRef.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      if (drag.mode === 'pan') {
        offsetVelocityRef.current = clamp(drag.vx, -MAX_FLING_SPEED, MAX_FLING_SPEED);
      } else if (drag.moved <= CLICK_SLOP_PX && drag.photoIndex >= 0) {
        const photo = photos[drag.photoIndex];
        if (photo) onPhotoClick?.(drag.photoIndex, photo);
      } else if (drag.photoIndex >= 0) {
        // 用整段手势测出来的速度甩出去，不然刚好落在两次 pointermove 之间松手就会没有惯性
        impulseRef.current = {
          index: drag.photoIndex,
          vx: clamp(drag.vx, -MAX_RELEASE_SPEED, MAX_RELEASE_SPEED),
          vy: clamp(drag.vy, -MAX_RELEASE_SPEED, MAX_RELEASE_SPEED)
        };
      }
      startLoop();
    },
    [onPhotoClick, photos, startLoop]
  );

  const handlePointerCancel = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      dragRef.current = null;
      startLoop();
    },
    [startLoop]
  );

  // 触控板横向滚动 / Shift + 滚轮平移；非被动监听才能阻止页面横滚
  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.shiftKey ? event.deltaY : 0;
      if (delta === 0) return;
      const { min, max } = offsetBounds();
      if (min >= max) return;
      event.preventDefault();
      snapTargetRef.current = null;
      offsetVelocityRef.current = 0;
      offsetRef.current = clamp(offsetRef.current - delta, min, max);
      startLoop();
    };
    element.addEventListener('wheel', onWheel, { passive: false });
    return () => element.removeEventListener('wheel', onWheel);
  }, [offsetBounds, startLoop]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const hanger = (event.target as HTMLElement | null)?.closest?.('[data-photo-index]') as HTMLElement | null;
      const index = hanger ? Number(hanger.dataset.photoIndex) : -1;

      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        const { min, max } = offsetBounds();
        if (min >= max) return;
        event.preventDefault();
        const step = photoWidth + photoGap;
        const from = snapTargetRef.current ?? offsetRef.current;
        snapTargetRef.current = clamp(from + (event.key === 'ArrowLeft' ? step : -step), min, max);
        startLoop();
        return;
      }
      if (index < 0) return;
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        impulseRef.current = { index, vx: 0, vy: event.key === 'ArrowDown' ? 1500 : -1000 };
        startLoop();
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        const photo = photos[index];
        if (!photo || !onPhotoClick) return;
        event.preventDefault();
        onPhotoClick(index, photo);
      }
    },
    [offsetBounds, onPhotoClick, photoGap, photoWidth, photos, startLoop]
  );

  const hangerStyle = (index: number) =>
    ({
      left: layout.cardLefts[index],
      top: layout.cardTops[index],
      width: photoWidth,
      height: photoHeight,
      transform: `translate3d(0, 0, 0) rotate(${layout.baseRots[index]}deg)`,
      '--pin-x': `${layout.pinOffsets[index]}px`,
      '--pin-grip': `${-PIN_GRIP}px`
    }) as React.CSSProperties;

  const rootStyle = {
    ...style,
    width: cssSize(width),
    height: cssSize(height),
    '--rope-color': ropeColor,
    '--band-color': bandColor ?? ropeColor,
    '--band-width': `${Math.max(1, bandWidth)}px`,
    '--pin-color': pinColor,
    '--frame-color': frameColor,
    ...(background ? { '--clothesline-bg': background } : null)
  } as React.CSSProperties;

  return (
    <div className={`${styles.clothesline} ${className ?? ''}`} style={rootStyle} role="region" aria-label={ariaLabel}>
      <div
        ref={viewportRef}
        className={`${styles.viewport} ${canPan ? styles.pannable : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={handlePointerCancel}
        onKeyDown={handleKeyDown}
      >
        <div ref={railRef} className={styles.rail} style={{ width: layout.railWidth }}>
          <svg
            className={styles.strings}
            width={layout.railWidth}
            height={layout.stageHeight}
            viewBox={`0 0 ${layout.railWidth} ${layout.stageHeight}`}
            aria-hidden="true"
          >
            <path
              ref={(element) => {
                ropePathsRef.current[0] = element;
              }}
              className={styles.ropeShadow}
            />
            <path
              ref={(element) => {
                ropePathsRef.current[1] = element;
              }}
              className={styles.ropeShadowCore}
            />
            <path
              ref={(element) => {
                ropePathsRef.current[2] = element;
              }}
              className={styles.ropeBody}
            />
            <path
              ref={(element) => {
                ropePathsRef.current[3] = element;
              }}
              className={styles.ropeTwist}
            />
            {photos.map((photo, index) => (
              <g key={`band-${photo.src}-${index}`}>
                <path
                  ref={(element) => {
                    bandPathsRef.current[index] = element;
                    // 元素换新的了，缓存里的 d 作废，否则相同字符串会被跳过、吊带画不出来
                    paintedBandsRef.current[index] = '';
                  }}
                  className={styles.bandBody}
                />
                <path
                  ref={(element) => {
                    bandGlossRef.current[index] = element;
                  }}
                  className={styles.bandGloss}
                />
                <circle
                  ref={(element) => {
                    knotsRef.current[index] = element;
                  }}
                  className={styles.bandKnot}
                  r={4.2}
                />
              </g>
            ))}
          </svg>

          {photos.map((photo, index) => (
            <div
              key={`${photo.src}-${index}`}
              ref={(element) => {
                cardsRef.current[index] = element;
                paintedCardsRef.current[index] = '';
              }}
              className={styles.hanger}
              data-photo-index={index}
              style={hangerStyle(index)}
              tabIndex={0}
              role={onPhotoClick ? 'button' : 'group'}
              aria-label={photo.title ?? photo.alt ?? undefined}
            >
              <span className={styles.pin} aria-hidden="true">
                <span className={styles.pinSpring} />
              </span>
              <figure className={styles.frame}>
                <span className={styles.photo}>
                  <img src={photo.src} alt={photo.alt ?? photo.title ?? ''} draggable={false} style={{ objectFit }} />
                </span>
                {hasCaption && (
                  <figcaption className={styles.caption}>
                    {photo.title && <strong>{photo.title}</strong>}
                    {photo.description && <span>{photo.description}</span>}
                  </figcaption>
                )}
              </figure>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export type { PhotoClotheslineItem, PhotoClotheslineProps } from './types';
export default PhotoClothesline;
