/** SoapBubbles 融合：对齐 BubbleField 的接近→吸收姿态与 metaball 外形 */

const TWO_PI = Math.PI * 2;
const META_SEGMENTS = 56;

export interface MergePose {
  ax: number;
  ay: number;
  ar: number;
  bx: number;
  by: number;
  br: number;
  approach: number;
  absorb: number;
}

export interface ActiveMerge {
  primaryId: number;
  secondaryId: number;
  progress: number;
  /** 融合触发时两泡心实际间距，避免起步瞬间被拉开 */
  initialSep: number;
  targetRadius: number;
  startPrimaryRadius: number;
  startSecondaryRadius: number;
  startPrimaryX: number;
  startPrimaryY: number;
  startSecondaryX: number;
  startSecondaryY: number;
  sharedVx: number;
  sharedVy: number;
  depth: number;
  seed: number;
  pose?: MergePose;
}

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

export const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

/** 场景主光：右上角（与 BubbleField 一致） */
export const SCENE_LIGHT_X = 0.82;
export const SCENE_LIGHT_Y = 0.08;

export const sceneLightPos = (width: number, height: number) => ({
  x: width * SCENE_LIGHT_X,
  y: height * SCENE_LIGHT_Y
});

export const mergeBusyIds = (merges: ActiveMerge[]) => {
  const ids = new Set<number>();
  for (const m of merges) {
    ids.add(m.primaryId);
    ids.add(m.secondaryId);
  }
  return ids;
};

export const resolveMergePose = (merge: ActiveMerge): MergePose => {
  const t = merge.progress;
  // 与 BubbleField 一致的接近 / 吸收时序
  const approach = easeInOut(smoothstep(0, 0.72, t));
  const absorb = easeOutCubic(smoothstep(0.28, 1, t));

  const dx0 = merge.startSecondaryX - merge.startPrimaryX;
  const dy0 = merge.startSecondaryY - merge.startPrimaryY;
  const dist0 = Math.hypot(dx0, dy0) || 1;
  const nx = dx0 / dist0;
  const ny = dy0 / dist0;

  const r1 = merge.startPrimaryRadius;
  const r2 = merge.startSecondaryRadius;
  const startSep = merge.initialSep;
  const sep = startSep * (1 - approach);

  const ax = merge.startPrimaryX + nx * (startSep - sep) * (r2 / (r1 + r2));
  const ay = merge.startPrimaryY + ny * (startSep - sep) * (r2 / (r1 + r2));
  const bx0 = ax + nx * sep;
  const by0 = ay + ny * sep;

  const ar = r1 + (merge.targetRadius - r1) * easeOutCubic(smoothstep(0.38, 1, absorb));
  // 副泡向主泡收拢 + 半径衰减，避免末期「大圈套小圈」
  const pull = easeOutCubic(smoothstep(0.4, 0.98, absorb));
  const bx = bx0 + (ax - bx0) * pull;
  const by = by0 + (ay - by0) * pull;
  const br = absorb >= 0.995 ? 0 : r2 * (1 - absorb) ** 1.6 * (1 - pull * 0.35);

  return { ax, ay, ar, bx, by, br, approach, absorb };
};

const metaballField = (
  x: number,
  y: number,
  ax: number,
  ay: number,
  ar: number,
  bx: number,
  by: number,
  br: number
) => {
  const d1 = (x - ax) * (x - ax) + (y - ay) * (y - ay) + 0.35;
  const d2 = (x - bx) * (x - bx) + (y - by) * (y - by) + 0.35;
  return (ar * ar) / d1 + (br * br) / d2;
};

const sampleMetaballPoint = (
  angle: number,
  ax: number,
  ay: number,
  ar: number,
  bx: number,
  by: number,
  br: number,
  cx: number,
  cy: number
) => {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const maxR = Math.hypot(ax - cx, ay - cy) + Math.hypot(bx - cx, by - cy) + ar + br + 8;
  let lo = 0;
  let hi = maxR;

  for (let k = 0; k < 14; k++) {
    const mid = (lo + hi) * 0.5;
    const px = cx + cos * mid;
    const py = cy + sin * mid;
    if (metaballField(px, py, ax, ay, ar, bx, by, br) >= 1) lo = mid;
    else hi = mid;
  }

  const r = (lo + hi) * 0.5;
  return { x: cx + cos * r, y: cy + sin * r };
};

export const buildMergePath = (ax: number, ay: number, ar: number, bx: number, by: number, br: number) => {
  const mass = ar + br || 1;
  const cx = (ax * ar + bx * br) / mass;
  const cy = (ay * ar + by * br) / mass;

  // 副泡已吸收：用质量中心单圆，避免轮廓中心跳变产生楔形
  if (br < 0.5 || Math.hypot(bx - ax, by - ay) < 1.5) {
    const path = new Path2D();
    path.arc(cx, cy, ar, 0, TWO_PI);
    return { path, cx, cy, radius: ar };
  }

  const path = new Path2D();

  for (let i = 0; i <= META_SEGMENTS; i++) {
    const angle = (TWO_PI * i) / META_SEGMENTS;
    const p = sampleMetaballPoint(angle, ax, ay, ar, bx, by, br, cx, cy);
    if (i === 0) path.moveTo(p.x, p.y);
    else path.lineTo(p.x, p.y);
  }

  path.closePath();
  const radius = Math.hypot(ax - cx, ay - cy) + Math.hypot(bx - cx, by - cy) + Math.max(ar, br);
  return { path, cx, cy, radius };
};

/** 融合起步：单泡渐隐 (1→0) */
export const mergeStartFade = (progress: number) => 1 - smoothstep(0, 0.18, progress);

/** 融合收尾：单泡渐显 (0→1) */
export const mergeEndFade = (absorb: number) => smoothstep(0.76, 0.96, absorb);
