import { MAX_RADIUS, MERGE_CELL_SIZE } from './constants';
import { easeInOut, easeOutCubic, smoothstep, terminalRiseForRadius } from './utils';
import type { ActiveMerge, Bubble, MergePose } from './types';

const findBubble = (bubbles: Bubble[], id: number) => bubbles.find((b) => b.id === id);

export const resolveMergePose = (merge: ActiveMerge): MergePose => {
  const t = merge.progress;
  const approach = easeInOut(smoothstep(0, 0.72, t));
  const absorb = easeOutCubic(smoothstep(0.28, 1, t));

  const dx0 = merge.startSecondaryX - merge.startPrimaryX;
  const dy0 = merge.startSecondaryY - merge.startPrimaryY;
  const dist0 = Math.hypot(dx0, dy0) || 1;
  const nx = dx0 / dist0;
  const ny = dy0 / dist0;

  const r1 = merge.startPrimaryRadius;
  const r2 = merge.startSecondaryRadius;
  const startSep = r1 + r2;
  const sep = startSep * (1 - approach);

  const ax = merge.startPrimaryX + nx * (startSep - sep) * (r2 / (r1 + r2));
  const ay = merge.startPrimaryY + ny * (startSep - sep) * (r2 / (r1 + r2));
  const bx = ax + nx * sep;
  const by = ay + ny * sep;

  const ar = r1 + (merge.targetRadius - r1) * absorb;
  const br = Math.max(0.8, r2 * (1 - absorb * 0.97));

  return { ax, ay, ar, bx, by, br, approach, absorb };
};

const forEachNearbyPair = (bubbles: Bubble[], callback: (a: Bubble, b: Bubble) => void) => {
  const grid = new Map<string, Bubble[]>();
  for (const bubble of bubbles) {
    const cellX = Math.floor(bubble.x / MERGE_CELL_SIZE);
    const cellY = Math.floor(bubble.y / MERGE_CELL_SIZE);
    const key = `${cellX},${cellY}`;
    const list = grid.get(key);
    if (list) list.push(bubble);
    else grid.set(key, [bubble]);
  }

  for (const bubble of bubbles) {
    const cellX = Math.floor(bubble.x / MERGE_CELL_SIZE);
    const cellY = Math.floor(bubble.y / MERGE_CELL_SIZE);
    for (let ox = -1; ox <= 1; ox++) {
      for (let oy = -1; oy <= 1; oy++) {
        const neighbors = grid.get(`${cellX + ox},${cellY + oy}`);
        if (!neighbors) continue;
        for (const other of neighbors) {
          if (other.id <= bubble.id) continue;
          callback(bubble, other);
        }
      }
    }
  }
};

export const applyMergeAttraction = (bubbles: Bubble[]) => {
  forEachNearbyPair(bubbles, (a, b) => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.hypot(dx, dy) || 1;
    const gap = dist - (a.radius + b.radius);
    const attractRange = Math.min(8, (a.radius + b.radius) * 0.14);
    if (gap > attractRange || gap < 0) return;

    const strength = (1 - gap / attractRange) * 0.01;
    const nx = dx / dist;
    const ny = dy / dist;
    a.vx += nx * strength;
    a.vy += ny * strength * 0.55;
    b.vx -= nx * strength;
    b.vy -= ny * strength * 0.55;
  });
};

export const startNearbyMerges = (
  bubbles: Bubble[],
  merges: ActiveMerge[],
  busyIds: Set<number>,
) => {
  forEachNearbyPair(bubbles, (a, b) => {
    if (busyIds.has(a.id) || busyIds.has(b.id)) return;

    const dist = Math.hypot(a.x - b.x, a.y - b.y);
    const touchDist = a.radius + b.radius - Math.min(a.radius, b.radius) * 0.12;
    if (dist > touchDist) return;

    const primary = a.radius >= b.radius ? a : b;
    const secondary = a.radius >= b.radius ? b : a;
    const targetRadius = Math.min(
      MAX_RADIUS,
      Math.cbrt(primary.radius ** 3 + secondary.radius ** 3),
    );
    merges.push({
      primaryId: primary.id,
      secondaryId: secondary.id,
      progress: 0,
      targetRadius,
      startPrimaryRadius: primary.radius,
      startSecondaryRadius: secondary.radius,
      startPrimaryX: primary.x,
      startPrimaryY: primary.y,
      startSecondaryX: secondary.x,
      startSecondaryY: secondary.y,
    });
    busyIds.add(primary.id);
    busyIds.add(secondary.id);
  });
};

export const updateMerges = (
  bubbles: Bubble[],
  merges: ActiveMerge[],
  speedScale: number,
  frameScale: number,
) => {
  const completed: number[] = [];

  for (let i = 0; i < merges.length; i++) {
    const merge = merges[i];
    const primary = findBubble(bubbles, merge.primaryId);
    const secondary = findBubble(bubbles, merge.secondaryId);
    if (!primary || !secondary) {
      completed.push(i);
      continue;
    }

    merge.progress = Math.min(1, merge.progress + 0.018 * frameScale);

    const sharedVy = (primary.vy + secondary.vy) * 0.5 - 0.12;
    const sharedVx = (primary.vx + secondary.vx) * 0.5;
    merge.startPrimaryX += sharedVx * frameScale;
    merge.startPrimaryY += sharedVy * frameScale;
    merge.startSecondaryX += sharedVx * frameScale;
    merge.startSecondaryY += sharedVy * frameScale;

    const pose = resolveMergePose(merge);
    merge.pose = pose;

    primary.x = pose.ax;
    primary.y = pose.ay;
    primary.radius = pose.ar;
    secondary.x = pose.bx;
    secondary.y = pose.by;
    secondary.radius = pose.br;
    primary.vx = sharedVx;
    primary.vy = sharedVy;
    secondary.vx = sharedVx;
    secondary.vy = sharedVy;

    if (merge.progress >= 1) {
      primary.x = (pose.ax * pose.ar + pose.bx * pose.br) / Math.max(1, pose.ar + pose.br);
      primary.y = (pose.ay * pose.ar + pose.by * pose.br) / Math.max(1, pose.ar + pose.br);
      primary.radius = merge.targetRadius;
      primary.terminalRise = Math.min(
        2.2,
        terminalRiseForRadius(primary.radius, speedScale, false) * 1.04,
      );
      primary.settle = 0.7;
      primary.aspect = 0.94;
      const removeIdx = bubbles.findIndex((b) => b.id === secondary.id);
      if (removeIdx >= 0) bubbles.splice(removeIdx, 1);
      completed.push(i);
    }
  }

  for (let i = completed.length - 1; i >= 0; i--) {
    merges.splice(completed[i], 1);
  }
};
