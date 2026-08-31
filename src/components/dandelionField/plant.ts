import { clamp } from '@cos-design/shared';
import {
  FLOWER_HEAD_GROW,
  FLOWER_WILT_YELLOW_END,
  GOLDEN,
  HEAD_BLOOM_IN,
  HEAD_BLOOM_OUT,
  HEAD_RECEPTACLE_IN,
  HEAD_RECEPTACLE_OUT,
  HEAD_WILT_IN,
  HEAD_WILT_OUT,
  INTRO_DURATION,
  MATURE_HOLD_MAX,
  MATURE_HOLD_MIN,
  PHASE,
  RELEASE_DURATION_MAX,
  RELEASE_DURATION_MIN,
  STEM_BASE_VERTICAL,
  STEM_LIFT_STIFF,
  STEM_TIP_MAX_TILT,
  STEM_WIND_BEND,
  STEM_WIND_DAMP,
  STEM_WIND_LIFT,
  STEM_WIND_STIFF,
  FLUFF_WIND_DRAG,
  FLUFF_WIND_DRAG_Y
} from './constants';
import type { HeadLifecycle, IntroSpawn, Plant, PlantLayout, Seed } from './types';
import { depthFromGround, easeInOutCubic, easeOutCubic, hash, smoothstep, softSat, windVisualStrength } from './utils';

export const sproutLife = (stemLenRatio = 0, phaseTime = 0) => ({
  phase: 'sprout' as const,
  phaseTime,
  grow: 0,
  puffReveal: 0,
  stemLenRatio,
  leafScale: stemLenRatio > 0 ? 0.08 + stemLenRatio * 0.92 : 0.08,
  fade: stemLenRatio > 0 ? Math.min(1, stemLenRatio * 1.35) : 0,
  wilt: 0,
  stemBrown: 0
});

export const matureLife = () => ({
  phase: 'mature' as const,
  phaseTime: 0,
  grow: FLOWER_HEAD_GROW,
  puffReveal: 1,
  stemLenRatio: 1,
  leafScale: 1,
  fade: 1,
  wilt: 0,
  stemBrown: 0
});

export const rollMatureHold = () => MATURE_HOLD_MIN + Math.random() * (MATURE_HOLD_MAX - MATURE_HOLD_MIN);

export const rollReleaseDuration = (plantId: number) =>
  RELEASE_DURATION_MIN + hash(plantId * 5.1) * (RELEASE_DURATION_MAX - RELEASE_DURATION_MIN);

export const buildIntroQueue = (count: number, width: number, height: number, baseSeedCount: number): IntroSpawn[] =>
  scatterPlantLayouts(count, width, height, baseSeedCount)
    .map((layout, i) => ({
      at: i === 0 ? 0 : (i / Math.max(count - 1, 1)) * INTRO_DURATION + (Math.random() - 0.5) * 0.28,
      layout,
      spawned: false
    }))
    .sort((a, b) => a.at - b.at);

export const placeSeed = (i: number, n: number, radius: number) => {
  const y = 1 - (i / Math.max(n - 1, 1)) * 2;
  const r = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = GOLDEN * i;
  return {
    lx: Math.cos(theta) * r * radius,
    ly: y * radius * 0.52,
    lz: Math.sin(theta) * r * radius * 0.38
  };
};

export const plantDepthAlpha = (plant: Plant) => 0.58 + plant.depth * 0.42;

/** 茎尖高度系数：始终用完整 stemLen，避免 flower→puffing 时茎干突然变短 */
export const headGrowFactor = () => 1;

/** 绒球花头视觉（puffing 与 mature 共用，避免阶段切换突变） */
export const puffBallHeadAt = (puff: number): HeadLifecycle => {
  const p = clamp(puff, 0, 1);
  return {
    budSize: 0,
    budOpen: 0,
    bloom: 0,
    wilt: 0,
    receptacle: 1 - smoothstep(0.5, 0.95, p) * 0.32,
    puff: p,
    glow: smoothstep(0.08, 0.42, p) * (1 - smoothstep(0.82, 1, p) * 0.45)
  };
};

export const puffBallSeedMotion = (plant: Plant, puff: number, seed: Seed) => {
  const puffT = clamp(puff / 0.94, 0, 1);
  const maxR = Math.max(plant.radius * 0.52, 1);
  const radial = clamp(Math.hypot(seed.lx, seed.ly) / maxR, 0, 1);
  const jitter = hash(seed.hairPhase * 2.7 + seed.lx * 0.03) * 0.022;
  if (radial < 0.22) {
    const centerReveal = clamp(puffT / 0.045, 0, 1);
    const centerExpand = clamp((puffT - 0.008) / 0.065, 0, 1);
    const centerFluff = clamp((puffT - 0.012) / 0.08, 0, 1);
    return { reveal: centerReveal, expand: centerExpand, fluffLen: centerFluff };
  }
  const start = radial * 0.28 + jitter;
  const span = 0.07 + radial * 0.3;
  const reveal = smoothstep(start, start + span, puffT);
  const expand = smoothstep(start + 0.006, start + span + 0.028, puffT);
  const fluffLen = smoothstep(start + 0.012, start + span + 0.04, puffT);
  return { reveal, expand, fluffLen };
};

/** 统一花头时间线：各阶段权重交叉渐变，避免突变 */
export const headLifecycle = (plant: Plant): HeadLifecycle => {
  const stemRatio = clamp(plant.stemLen / Math.max(plant.stem, 0.001), 0, 1);

  if (plant.phase === 'sprout') {
    const stemT = easeInOutCubic(stemRatio);
    const budSize = smoothstep(0.04, 0.9, stemT);
    const preBloom = smoothstep(0.78, 0.97, stemT) * 0.08;
    return { budSize, budOpen: 0, bloom: preBloom, wilt: 0, receptacle: 0, puff: 0, glow: 0 };
  }

  if (plant.phase === 'flower') {
    const p = plant.phaseTime / PHASE.FLOWER;
    const bloom = smoothstep(HEAD_BLOOM_IN, HEAD_BLOOM_OUT, p);
    const wilt = smoothstep(HEAD_WILT_IN, HEAD_WILT_OUT, p);
    const receptacle = smoothstep(HEAD_RECEPTACLE_IN, HEAD_RECEPTACLE_OUT, p);
    const budOpen = smoothstep(0.02, 0.38, bloom) * (1 - smoothstep(0.55, 0.88, bloom));
    const glow = bloom * (1 - wilt) * smoothstep(0.42, 0.72, bloom);
    const puff = wilt >= FLOWER_WILT_YELLOW_END ? clamp(plant.puffReveal, 0, 1) : 0;
    return { budSize: 1 - bloom * 0.18, budOpen, bloom, wilt, receptacle, puff, glow };
  }

  if (plant.phase === 'puffing') {
    return puffBallHeadAt(plant.puffReveal);
  }

  if (plant.phase === 'mature') {
    return puffBallHeadAt(1);
  }

  return { budSize: 0, budOpen: 0, bloom: 0, wilt: 0, receptacle: 0, puff: 0, glow: 0 };
};

export const stemBendSeed = (id: number, x: number) => Math.imul(id, 7919) ^ Math.imul(Math.round(x * 127.1), 104729);

export const stemBendTraits = (seed: number) => {
  const mag1 = 0.24 + hash(seed + 23.1) * 0.42;
  const mag2 = 0.09 + hash(seed + 51.2) * 0.24;
  return {
    stemBendX: (hash(seed + 37.9) - 0.5) * mag1 * 2.5,
    stemBendY: (hash(seed + 41.7) - 0.5) * mag1 * 1.55,
    stemBend2X: (hash(seed + 63.4) - 0.5) * mag2 * 2.6,
    stemBend2Y: (hash(seed + 67.2) - 0.5) * mag2 * 1.35
  };
};

export const randomStemBendTraits = () => stemBendTraits(Math.floor(Math.random() * 0x7fffffff));

/** 茎身弯度随抽茎进度 0→1，开花时继续缓慢到位 */
export const stemCurveAmount = (plant: Plant) => {
  const stemT = easeOutCubic(plant.stemLen / Math.max(plant.stem, 0.001));
  if (plant.phase === 'sprout') return stemT;
  if (plant.phase === 'flower') {
    const bloom = headLifecycle(plant).bloom;
    return stemT + (1 - stemT) * smoothstep(0, 0.55, bloom) * 0.85;
  }
  return 1;
};

/** 茎尖水平偏移：个体方向 × 弯度，带上限（风摆由 stemWindOffset 单独叠加） */
export const stemTipOffsetX = (plant: Plant, rise: number, curveT: number) => {
  const bendDir = (plant.stemBendX + plant.stemBend2X * 0.42 + plant.lean * 0.1) * rise * curveT;
  const maxDx = rise * Math.tan(STEM_TIP_MAX_TILT);
  return clamp(bendDir * 0.32, -maxDx, maxDx);
};

/** 茎干风摆：弹簧阻尼追随风向，底部硬、顶部软（在 stemWindOffset 体现） */
export const updateStemWind = (plant: Plant, wind: { x: number; y: number }, idle: number, dt: number) => {
  const targetX = wind.x * (1.28 + hash(plant.id * 5.1) * 0.88) + idle * 0.2;
  const targetY = wind.y * (0.58 + hash(plant.id * 7.3) * 0.32);

  plant.swayVel += ((targetX - plant.sway) * STEM_WIND_STIFF - plant.swayVel * STEM_WIND_DAMP) * dt;
  plant.sway += plant.swayVel * dt;
  plant.sway = clamp(plant.sway, -4.2, 4.2);

  plant.liftVel += ((targetY - plant.windLift) * STEM_LIFT_STIFF - plant.liftVel * STEM_WIND_DAMP) * dt;
  plant.windLift += plant.liftVel * dt;
  plant.windLift = clamp(plant.windLift, -1.6, 1.6);
};

/** 绒球绒毛：外圈轻、滞后大；弹簧回拉 + 风向拖拽 + 微幅紊流 */
export const updateAttachedFluff = (
  seed: Seed,
  plant: Plant,
  wind: { x: number; y: number },
  time: number,
  dt: number,
  onPuffBall: boolean,
  plantRadius: number
) => {
  const maxR = Math.max(plantRadius * 0.52, 1);
  const radial = clamp(Math.hypot(seed.lx, seed.ly) / maxR, 0, 1);
  const windMag = windVisualStrength(wind);
  const puff = onPuffBall ? 1 : 0.32;

  const lagX = 3.8 + radial * 7.5;
  const lagY = 4.6 + radial * 8.2;
  const dragX = FLUFF_WIND_DRAG * (0.55 + radial * 0.65) * puff * (0.35 + windMag * 0.65);
  const dragY = FLUFF_WIND_DRAG_Y * (0.55 + radial * 0.65) * puff * (0.35 + windMag * 0.65);

  const targetOx = wind.x * dragX + softSat(plant.sway, 0.18) * plantRadius * 0.055 * puff;
  const targetOy = wind.y * dragY + softSat(plant.windLift, 0.22) * plantRadius * 0.042 * puff;

  const followX = 1 - Math.exp(-dt * lagX);
  const followY = 1 - Math.exp(-dt * lagY);
  seed.fluffOx += (targetOx - seed.fluffOx) * followX;
  seed.fluffOy += (targetOy - seed.fluffOy) * followY;

  const maxOff = plantRadius * (0.16 + radial * 0.14);
  const offMag = Math.hypot(seed.fluffOx, seed.fluffOy);
  if (offMag > maxOff) {
    const s = maxOff / offMag;
    seed.fluffOx *= s;
    seed.fluffOy *= s;
  }

  const flutterAmp = (0.012 + windMag * 0.028) * puff;
  const flutterX = Math.sin(time * (2.6 + seed.hairPhase * 0.25) + seed.swayPhase) * flutterAmp;
  const flutterY = Math.sin(time * (2.35 + seed.hairPhase * 0.31) + seed.swayPhase * 1.18) * flutterAmp * 1.12;

  return {
    offX: seed.fluffOx + flutterX,
    offY: seed.fluffOy + flutterY,
    tiltX: seed.fluffOx * 0.42 + flutterX * 0.6,
    tiltY: seed.fluffOy * 0.42 + flutterY * 0.6
  };
};

/** 风力导致的茎尖位移（随风向弯曲，随茎高放大） */
export const stemWindStrength = (plant: Plant) => {
  switch (plant.phase) {
    case 'sprout':
      return 0.45;
    case 'flower':
      return 0.62;
    default:
      return 1;
  }
};

export const stemWindOffset = (plant: Plant, rise: number) => {
  const kX = stemWindStrength(plant) * STEM_WIND_BEND;
  const kY = stemWindStrength(plant) * STEM_WIND_LIFT;
  const maxDx = rise * Math.tan(STEM_TIP_MAX_TILT) * 0.66;
  const maxDy = rise * 0.03;
  const windDx = softSat(plant.sway, 0.19) * maxDx * kX;
  const windDy = softSat(plant.windLift, 0.22) * maxDy * kY;
  return { dx: windDx, dy: windDy };
};

/** 茎干几何：底段竖直出土，上段随高度渐弯（见用户草图） */
export const stemCurveGeometry = (plant: Plant) => {
  const len = plant.stemLen * (1 - plant.wilt * 0.12);
  const grow = headGrowFactor();
  const baseX = plant.x;
  const baseY = plant.ground;
  const base = { x: baseX, y: baseY };
  const rise = len * grow;
  const curveT = stemCurveAmount(plant);
  const tipDx = stemTipOffsetX(plant, rise, curveT);
  const { dx: windDx, dy: windDy } = stemWindOffset(plant, rise);
  const head = { x: baseX + tipDx + windDx, y: baseY - rise + windDy };
  const cp1 = {
    x: baseX + windDx * 0.04,
    y: baseY - rise * STEM_BASE_VERTICAL + windDy * 0.03
  };
  const cp2 = {
    x: baseX + tipDx * 0.74 + windDx * 0.48,
    y: baseY - rise * 0.84 + windDy * 0.12
  };

  if (plant.phase !== 'wither') {
    return { base, cp1, cp2, head };
  }

  const t = plant.wilt;
  const wiltDx = tipDx + windDx + (plant.lean + plant.stemBendX * 0.2) * rise * 0.28 * t;
  const droopY = rise * 0.34 * t + windDy;
  return {
    base,
    cp1: { x: baseX + windDx * 0.08, y: baseY - rise * STEM_BASE_VERTICAL * (1 - t * 0.15) + windDy * 0.06 },
    cp2: {
      x: baseX + wiltDx * 0.62,
      y: baseY - rise * 0.78 + droopY * 0.28
    },
    head: { x: baseX + wiltDx, y: baseY - rise + droopY }
  };
};

export const buildPlantTraits = (
  x: number,
  ground: number,
  height: number,
  baseSeedCount: number,
  id: number
): PlantLayout => {
  const depth = depthFromGround(ground, height);
  const sizeJitter = 0.82 + hash(id + 11.7) * 0.38;
  const scale = clamp(0.48 + depth * 0.62 + (hash(id + 5.3) - 0.5) * 0.16, 0.42, 1.38) * sizeJitter;
  const stem = height * (0.1 + hash(id + 9.4) * 0.26 + depth * 0.1) * (0.68 + hash(id + 13.2) * 0.62);
  const radius = (8 + hash(id + 2.8) * 16) * scale;
  const seedQuota = clamp(Math.round(baseSeedCount * (0.55 + hash(id + 17.5) * 0.75) * (0.75 + scale * 0.35)), 20, 96);
  return {
    x,
    ground,
    stem,
    radius,
    lean: (hash(id + 41.3) - 0.5) * 0.42,
    ...stemBendTraits(stemBendSeed(id, x)),
    depth,
    scale,
    seedQuota
  };
};

type PlantLife = ReturnType<typeof sproutLife> | ReturnType<typeof matureLife>;

export type { PlantLife };

export const makePlant = (layout: PlantLayout, id: number, life: PlantLife): Plant => ({
  id,
  ...layout,
  stemLen: layout.stem * life.stemLenRatio,
  sway: 0,
  windLift: 0,
  swayVel: 0,
  liftVel: 0,
  swayPhase: Math.random() * Math.PI * 2,
  swayAmp: 0.8 + Math.random() * 1.6,
  grow: life.grow,
  phase: life.phase,
  phaseTime: life.phaseTime,
  wilt: life.wilt,
  fade: life.fade,
  puffReveal: life.puffReveal,
  leafScale: life.leafScale,
  stemBrown: life.stemBrown,
  matureHoldLeft: life.phase === 'mature' ? rollMatureHold() : -1,
  releaseDuration: life.phase === 'mature' ? rollReleaseDuration(id) : RELEASE_DURATION_MIN,
  releaseElapsed: 0,
  releaseSeedTotal: 0,
  releasing: false,
  releaseBoost: 0
});

/** 随机散布位置，保证最小间距，避免均匀排布 */
export const scatterPlantLayouts = (
  count: number,
  width: number,
  height: number,
  baseSeedCount: number
): PlantLayout[] => {
  const marginX = width * 0.05;
  const slots: { x: number; depth: number }[] = [];
  const minGap = width * 0.085;

  for (let attempt = 0; attempt < count * 50 && slots.length < count; attempt++) {
    const x = marginX + Math.random() * (width - marginX * 2);
    const depth = clamp(0.08 + Math.random() * 0.92, 0, 1);
    const ok = slots.every((s) => Math.abs(s.x - x) > minGap * (0.65 + (1 - Math.abs(s.depth - depth)) * 0.35));
    if (ok) slots.push({ x, depth });
  }

  while (slots.length < count) {
    slots.push({
      x: marginX + Math.random() * (width - marginX * 2),
      depth: Math.random()
    });
  }

  return slots.map(({ x, depth }) => {
    const sizeJitter = 0.82 + Math.random() * 0.38;
    const scale = clamp(0.48 + depth * 0.62 + (Math.random() - 0.5) * 0.16, 0.42, 1.38) * sizeJitter;
    const ground = height * (0.66 + depth * 0.24 + (Math.random() - 0.5) * 0.035);
    const stem = height * (0.1 + Math.random() * 0.26 + depth * 0.1) * (0.68 + Math.random() * 0.62);
    const radius = (8 + Math.random() * 16) * scale;
    const seedQuota = clamp(Math.round(baseSeedCount * (0.55 + Math.random() * 0.75) * (0.75 + scale * 0.35)), 20, 96);
    return {
      x,
      ground,
      stem,
      radius,
      lean: (Math.random() - 0.5) * 0.42,
      ...randomStemBendTraits(),
      depth,
      scale,
      seedQuota
    };
  });
};
