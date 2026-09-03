import {
  BAND_POINTS,
  BAND_SMOOTH_RATE,
  CONSTRAINT_PASSES,
  DRAG_FOLLOW_RATE,
  MAX_SPIN,
  MAX_SWING,
  REST_MOTION_PX,
  REST_OFFSET_PX,
  ROT_LIMIT,
  SPIN_DRIVE,
  SPIN_INPUT_RATE,
  SPIN_K,
  SWING_K,
} from './constants';
import { clamp, softPull } from './math';
import {
  resetHangerNode,
  restChainPoint,
  type DragState,
  type HangerNode,
  type Layout,
  type Physics,
  type Point2,
} from './model';
import { buildRopeD } from './ropePath';

export interface SimPaintTargets {
  rail: HTMLDivElement | null;
  ropePaths: Array<SVGPathElement | null>;
  bandPaths: Array<SVGPathElement | null>;
  bandGloss: Array<SVGPathElement | null>;
  knots: Array<SVGCircleElement | null>;
  cards: Array<HTMLDivElement | null>;
}

export interface SimPaintCache {
  bands: string[];
  cards: string[];
  rope: string;
  rail: string;
}

export interface SimState {
  nodes: HangerNode[];
  layout: Layout | null;
  physics: Physics | null;
  offset: number;
  offsetVelocity: number;
  snapTarget: number | null;
  drag: DragState | null;
  impulse: { index: number; vx: number; vy: number } | null;
  buffer: Point2[];
}

const takeBuffer = (buffer: Point2[], size: number) => {
  while (buffer.length < size) buffer.push({ x: 0, y: 0 });
  return buffer;
};

export const getOffsetBounds = (viewWidth: number, railWidth: number) => ({
  min: Math.min(0, viewWidth - railWidth),
  max: 0,
});

/**
 * 物理是定步长跑的，屏幕刷新率跟它对不齐；直接画最新状态会出现「有的帧走两步、有的帧一步都没走」的顿挫。
 * 这里按 alpha 在上一步与当前步之间插值，等价于 rapier 默认开启的插值渲染。
 */
export const paintSimulation = (
  state: SimState,
  targets: SimPaintTargets,
  cache: SimPaintCache,
  alpha: number,
  dt: number,
) => {
  const { layout, physics, nodes } = state;
  if (!layout || !physics) return;

  const railTransform = `translate3d(${state.offset.toFixed(2)}px, 0, 0)`;
  if (targets.rail && railTransform !== cache.rail) {
    targets.rail.style.transform = railTransform;
    cache.rail = railTransform;
  }

  // 中间质点再跟一次平滑，吊带看起来更柔（Lanyard 里对中间两个关节做 lerp 是同样的用意）
  const follow = dt > 0 ? 1 - Math.exp(-dt * BAND_SMOOTH_RATE) : 1;
  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    if (!node) continue;
    const chain = node.chain;
    const last = chain.length - 1;
    const buffer = takeBuffer(state.buffer, chain.length);

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

    const card = targets.cards[index];
    if (card) {
      const end = chain[last];
      const restX = layout.pinXs[index] ?? 0;
      const restY = (layout.anchorYs[index] ?? 0) + physics.bandLength;
      const rot = node.sRot + (node.rot - node.sRot) * alpha;
      const spin = node.sSpin + (node.spin - node.sSpin) * alpha;
      const transform =
        `translate3d(${(end.rx - restX).toFixed(2)}px, ${(end.ry - restY).toFixed(2)}px, 0) ` +
        `rotate(${rot.toFixed(2)}deg) rotateY(${spin.toFixed(2)}deg)`;
      if (transform !== cache.cards[index]) {
        card.style.transform = transform;
        cache.cards[index] = transform;
      }
    }

    const bandD = buildRopeD(buffer, chain.length);
    if (bandD !== cache.bands[index]) {
      cache.bands[index] = bandD;
      targets.bandPaths[index]?.setAttribute('d', bandD);
      targets.bandGloss[index]?.setAttribute('d', bandD);
      const knot = targets.knots[index];
      if (knot) {
        knot.setAttribute('cx', chain[0].rx.toFixed(2));
        knot.setAttribute('cy', chain[0].ry.toFixed(2));
      }
    }
  }

  const anchors = layout.anchors;
  const points = takeBuffer(state.buffer, anchors.length);
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
  if (ropeD !== cache.rope) {
    cache.rope = ropeD;
    for (const path of targets.ropePaths) {
      path?.setAttribute('d', ropeD);
    }
  }
};

export const stepPhysics = (state: SimState, viewWidth: number, h: number) => {
  const { physics: config, layout: currentLayout, nodes } = state;
  if (!config || !currentLayout) return;

  const drag = state.drag;
  const draggingIndex = drag?.mode === 'photo' ? drag.photoIndex : -1;
  const impulse = state.impulse;
  state.impulse = null;

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

  const { min, max } = getOffsetBounds(viewWidth, currentLayout.railWidth);
  const snapTarget = state.snapTarget;
  if (snapTarget !== null) {
    const remaining = snapTarget - state.offset;
    state.offset += remaining * (1 - Math.exp(-h * 12));
    state.offsetVelocity = 0;
    if (Math.abs(remaining) < 0.4) {
      state.offset = snapTarget;
      state.snapTarget = null;
    }
    return;
  }
  if (drag) return;

  const offset = state.offset;
  if (offset > max || offset < min) {
    // 拖过头后像橡皮筋一样被拽回边界
    const bound = offset > max ? max : min;
    state.offsetVelocity += ((bound - offset) * 220 - state.offsetVelocity * 15) * h;
    state.offset += state.offsetVelocity * h;
    if (Math.abs(bound - state.offset) < 0.4 && Math.abs(state.offsetVelocity) < 24) {
      state.offset = bound;
      state.offsetVelocity = 0;
    }
    return;
  }
  if (state.offsetVelocity !== 0) {
    state.offset += state.offsetVelocity * h;
    state.offsetVelocity *= Math.exp(-h * 2.8);
    if (Math.abs(state.offsetVelocity) < 12) state.offsetVelocity = 0;
    state.offset = clamp(state.offset, min, max);
  }
};

/**
 * 静止判定看「每步位移」而不是绝对位置：绳索约束会让吊带静态多伸长零点几个像素，
 * 再叠加「距静止位足够近」这一条，摆到最高点那一帧速度为零也不会被误判成停下。
 */
export const isSimulationSettled = (state: SimState, viewWidth: number) => {
  if (state.drag || state.snapTarget !== null || state.impulse) return false;
  if (Math.abs(state.offsetVelocity) > 0.5) return false;
  const layout = state.layout;
  if (!layout) return false;
  const { min, max } = getOffsetBounds(viewWidth, layout.railWidth);
  if (state.offset > max + 0.4 || state.offset < min - 0.4) return false;
  return state.nodes.every((node, index) => {
    const base = layout.baseRots[index] ?? 0;
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
      const rest = restChainPoint(layout, state.physics, index, order);
      return (
        Math.hypot(point.x - rest.x, point.y - rest.y) < REST_OFFSET_PX &&
        Math.abs(point.x - point.px) < REST_MOTION_PX &&
        Math.abs(point.y - point.py) < REST_MOTION_PX
      );
    });
  });
};

export const settleSimulation = (state: SimState) => {
  state.nodes.forEach((node, index) => {
    resetHangerNode(node, state.layout, state.physics, index);
  });
  state.offsetVelocity = 0;
};
