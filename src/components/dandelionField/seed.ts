import { clamp } from '@cos-design/shared';
import { headLifecycle, placeSeed, puffBallSeedMotion } from './plant';
import type { Plant, Seed } from './types';
import { hash } from './utils';

const seedPuffProgress = (plant: Plant) => headLifecycle(plant).puff;

/** 绒球从中心向外展开：reveal 透明度 · expand 径向位置 · fluffLen 绒毛长度 */
export const puffSeedMotion = (plant: Plant, seed: Seed) => {
  if (plant.phase === 'mature') return puffBallSeedMotion(plant, 1, seed);
  const puff = seedPuffProgress(plant);
  if (plant.phase === 'puffing' || (plant.phase === 'flower' && puff > 0)) {
    return puffBallSeedMotion(plant, puff, seed);
  }
  if (plant.phase === 'wither') return { reveal: plant.puffReveal, expand: 1, fluffLen: 1 };
  return { reveal: 0, expand: 0, fluffLen: 0 };
};

/** 绒球飘降时忽快忽慢的垂直目标速度 */
export const seedFallTargetVy = (seed: Seed, time: number, wind: { x: number; y: number }, sway: number) => {
  const base = seed.terminalVy;
  const slow = Math.sin(time * seed.fallFreqA + seed.swayPhase);
  const fast = Math.sin(time * seed.fallFreqB + seed.hairPhase);
  const drift = Math.cos(time * seed.fallFreqA * 0.52 + seed.swayPhase * 1.35);
  const mul = 0.58 + slow * 0.3 + fast * 0.17 + drift * 0.15;
  let target = base * clamp(mul, 0.1, 1.42);
  target += wind.y * 0.82 + sway * base * 0.2 + wind.x * 0.05;
  return clamp(target, -base * 0.55, base * 1.85);
};

export const appendSeedsForPlant = (seeds: Seed[], plant: Plant, attached: boolean) => {
  for (let i = 0; i < plant.seedQuota; i++) {
    const local = placeSeed(i, plant.seedQuota, plant.radius);
    seeds.push({
      plantId: plant.id,
      attached,
      canGerminate: false,
      lx: local.lx,
      ly: local.ly,
      lz: local.lz,
      x: plant.x + local.lx,
      y: plant.ground - plant.stemLen + local.ly,
      vx: 0,
      vy: 0,
      rot: hash(plant.id * 80 + i) * Math.PI * 2,
      spin: 0,
      life: 1,
      size: (4.8 + hash(i + plant.id) * 4.2) * plant.scale,
      hairPhase: hash(i * 2.3 + plant.id) * Math.PI * 2,
      landed: false,
      landedAt: -1,
      germinateDelay: 0,
      germinateChecked: false,
      settleT: 0,
      restGroundY: -1,
      swayPhase: hash(i * 2.3 + plant.id) * Math.PI * 2,
      terminalVy: 0,
      driftBias: (hash(i * 5.3 + plant.id * 1.1) - 0.5) * 0.22,
      depth: clamp(plant.depth + local.lz * 0.0045, 0.05, 0.98),
      fallFreqA: 0,
      fallFreqB: 0,
      fluffOx: 0,
      fluffOy: 0
    });
  }
};

/** Silky pappus with radiating hairs and a brown achene — photorealistic seed sprite */
export const makePappusSprite = () => {
  const size = 72;
  const cv = document.createElement('canvas');
  cv.width = size;
  cv.height = size;
  const c = cv.getContext('2d')!;
  const cx = size / 2;
  const cy = size / 2;
  const hairCount = 28;

  for (let i = 0; i < hairCount; i++) {
    const angle = (i / hairCount) * Math.PI * 2 + (hash(i * 1.7) - 0.5) * 0.45;
    const len = size * 0.34 + hash(i + 11) * size * 0.14;
    const startR = 2.2 + hash(i + 13) * 0.8;
    const bend = (hash(i + 17) - 0.5) * 0.22;
    const alpha = 0.28 + hash(i + 19) * 0.42;

    c.strokeStyle = `rgba(248, 246, 238, ${alpha})`;
    c.lineWidth = 0.28 + hash(i + 23) * 0.32;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(cx + Math.cos(angle) * startR, cy + Math.sin(angle) * startR);
    const midR = len * 0.52;
    c.quadraticCurveTo(
      cx + Math.cos(angle + bend) * midR,
      cy + Math.sin(angle + bend) * midR,
      cx + Math.cos(angle + bend * 0.6) * len,
      cy + Math.sin(angle + bend * 0.6) * len
    );
    c.stroke();
  }

  const halo = c.createRadialGradient(cx, cy, 0, cx, cy, size * 0.36);
  halo.addColorStop(0, 'rgba(255, 252, 244, 0.22)');
  halo.addColorStop(0.55, 'rgba(255, 250, 240, 0.08)');
  halo.addColorStop(1, 'rgba(255, 250, 240, 0)');
  c.fillStyle = halo;
  c.beginPath();
  c.arc(cx, cy, size * 0.36, 0, Math.PI * 2);
  c.fill();

  const achene = c.createRadialGradient(cx - 0.6, cy - 0.8, 0, cx, cy, 3.2);
  achene.addColorStop(0, '#9a7b62');
  achene.addColorStop(0.55, '#6b4f3a');
  achene.addColorStop(1, '#4a3528');
  c.fillStyle = achene;
  c.beginPath();
  c.ellipse(cx, cy + 0.4, 1.6, 2.6, 0.08, 0, Math.PI * 2);
  c.fill();

  return cv;
};
