import { clamp } from '@cos-design/shared';
import { FLOWER_HEAD_GROW, FLOWER_WILT_YELLOW_END } from './constants';
import { headLifecycle, plantDepthAlpha, stemCurveGeometry } from './plant';
import type { Plant, Seed } from './types';
import { easeInOutCubic, easeOutCubic, hash, lerpColor, smoothstep } from './utils';

export const drawRosetteLeaves = (ctx: CanvasRenderingContext2D, plant: Plant) => {
  if (plant.fade <= 0.02 || plant.leafScale <= 0.02) return;
  const vis = plant.fade * plantDepthAlpha(plant);
  ctx.save();
  ctx.globalAlpha = vis * 0.92;
  const leafCount = 5 + Math.floor(hash(plant.x * 3.7) * 3);
  for (let i = 0; i < leafCount; i++) {
    const ang = (i / leafCount) * Math.PI * 2 + hash(i + plant.x) * 0.4;
    const len = (14 + hash(i + 7) * 16) * plant.leafScale * plant.scale;
    const wiltDrop = plant.wilt * 6;
    const lx = plant.x + Math.cos(ang) * len * 0.55;
    const ly = plant.ground + Math.sin(ang) * len * 0.18 + 2 + wiltDrop;
    const tipX = plant.x + Math.cos(ang + plant.wilt * 0.35) * len;
    const tipY = plant.ground + Math.sin(ang) * len * 0.35 - 4 + wiltDrop * 1.4;

    const leafGrad = ctx.createLinearGradient(plant.x, plant.ground, tipX, tipY);
    leafGrad.addColorStop(
      0,
      `rgba(${lerpColor(82, 68, plant.stemBrown) | 0}, ${lerpColor(58, 48, plant.stemBrown) | 0}, ${lerpColor(36, 28, plant.stemBrown) | 0}, ${0.85 * plant.leafScale})`,
    );
    leafGrad.addColorStop(
      0.6,
      `rgba(${lerpColor(94, 78, plant.stemBrown) | 0}, ${lerpColor(72, 58, plant.stemBrown) | 0}, ${lerpColor(48, 38, plant.stemBrown) | 0}, ${0.72 * plant.leafScale})`,
    );
    leafGrad.addColorStop(
      1,
      `rgba(${lerpColor(108, 88, plant.stemBrown) | 0}, ${lerpColor(86, 68, plant.stemBrown) | 0}, ${lerpColor(56, 44, plant.stemBrown) | 0}, ${0.45 * plant.leafScale})`,
    );
    ctx.fillStyle = leafGrad;
    ctx.beginPath();
    ctx.moveTo(plant.x, plant.ground);
    ctx.quadraticCurveTo(lx, ly - 3, tipX, tipY);
    ctx.quadraticCurveTo(lx + (hash(i) - 0.5) * 4, ly + 5, plant.x, plant.ground + 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(42, 58, 30, ${0.35 * plant.leafScale})`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(plant.x, plant.ground);
    ctx.quadraticCurveTo((plant.x + tipX) * 0.5, (plant.ground + tipY) * 0.5 - 2, tipX, tipY);
    ctx.stroke();
  }
  ctx.restore();
};

export const drawStem = (ctx: CanvasRenderingContext2D, plant: Plant) => {
  if (plant.fade <= 0.02 || plant.stemLen <= 0.5) return;
  const curve = stemCurveGeometry(plant);
  const { base, cp1, cp2, head } = curve;
  const sw = plant.scale;

  ctx.save();
  ctx.globalAlpha = plant.fade * plantDepthAlpha(plant);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const b = plant.stemBrown;
  ctx.strokeStyle = `rgba(${lerpColor(36, 52, b) | 0}, ${lerpColor(50, 42, b) | 0}, ${lerpColor(28, 22, b) | 0}, 0.35)`;
  ctx.lineWidth = 3.6 * sw * (1 - b * 0.25);
  ctx.beginPath();
  ctx.moveTo(base.x + 0.6, base.y);
  ctx.bezierCurveTo(cp1.x + 0.8, cp1.y, cp2.x + 0.5, cp2.y + 1, head.x + 0.5, head.y + 1);
  ctx.stroke();

  const stemGrad = ctx.createLinearGradient(base.x, base.y, head.x, head.y);
  stemGrad.addColorStop(
    0,
    `rgb(${lerpColor(61, 98, b) | 0} ${lerpColor(82, 78, b) | 0} ${lerpColor(48, 42, b) | 0})`,
  );
  stemGrad.addColorStop(
    0.45,
    `rgb(${lerpColor(90, 120, b) | 0} ${lerpColor(115, 95, b) | 0} ${lerpColor(68, 58, b) | 0})`,
  );
  stemGrad.addColorStop(
    0.85,
    `rgb(${lerpColor(109, 138, b) | 0} ${lerpColor(134, 110, b) | 0} ${lerpColor(82, 68, b) | 0})`,
  );
  stemGrad.addColorStop(
    1,
    `rgb(${lerpColor(122, 148, b) | 0} ${lerpColor(148, 118, b) | 0} ${lerpColor(96, 78, b) | 0})`,
  );
  ctx.strokeStyle = stemGrad;
  ctx.lineWidth = (2.4 - b * 0.6) * sw * (0.6 + (plant.stemLen / plant.stem) * 0.4);
  ctx.beginPath();
  ctx.moveTo(base.x, base.y);
  ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, head.x, head.y);
  ctx.stroke();

  if (b < 0.65) {
    ctx.strokeStyle = `rgba(180, 200, 140, ${0.25 * (1 - b)})`;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(base.x + 0.4, base.y - 2);
    ctx.bezierCurveTo(cp1.x + 0.3, cp1.y - 1, cp2.x - 0.2, cp2.y - 1, head.x - 0.2, head.y - 1);
    ctx.stroke();
  }
  ctx.restore();
};

export const drawFlowerBud = (
  ctx: CanvasRenderingContext2D,
  head: { x: number; y: number },
  scale: number,
  fade: number,
  sizeT: number,
  openT: number,
  plantId: number,
) => {
  const size = easeOutCubic(clamp(sizeT, 0, 1));
  const open = clamp(openT, 0, 1);
  if (fade <= 0.02 || size <= 0.04) return;

  ctx.save();
  const sw = scale;
  const bractCount = 13;
  const baseR = (2.4 + size * 3.8) * sw;
  const bractLen = (5.5 + size * 9.5) * sw;
  const budAlpha = fade * (1 - smoothstep(0.35, 0.92, open));

  for (let i = 0; i < bractCount; i++) {
    const ang = (i / bractCount) * Math.PI * 2 - Math.PI / 2 + hash(plantId + i * 1.7) * 0.12;
    const spread = smoothstep(0.08, 0.82, open) * (0.58 + hash(plantId + i * 2.3) * 0.2);
    const bractAng = ang + spread * 0.55;
    const tipDir = bractAng + spread * 1.05 + 0.08;
    const bractW = (0.85 + hash(i + plantId) * 0.45) * sw * (1 - open * 0.3);

    const bx = head.x + Math.cos(bractAng) * baseR * 0.42;
    const by = head.y + Math.sin(bractAng) * baseR * 0.18 + sw * 0.5;
    const mx = head.x + Math.cos(tipDir) * bractLen * 0.52;
    const my = head.y - bractLen * (0.38 - spread * 0.12) + Math.sin(tipDir) * bractLen * 0.08;
    const tx = head.x + Math.cos(tipDir) * bractLen * 0.92;
    const ty = head.y - bractLen * (0.62 - spread * 0.22) + Math.sin(tipDir) * bractLen * 0.12;

    const g = 48 + hash(plantId + i) * 22;
    ctx.globalAlpha = budAlpha * (0.82 + hash(i) * 0.14);
    ctx.fillStyle = `rgba(${g - 10}, ${g + 32}, ${g - 16}, 0.9)`;
    ctx.beginPath();
    ctx.moveTo(
      bx - Math.cos(bractAng + Math.PI / 2) * bractW,
      by - Math.sin(bractAng + Math.PI / 2) * bractW,
    );
    ctx.quadraticCurveTo(mx, my, tx, ty);
    ctx.quadraticCurveTo(
      mx,
      my,
      bx + Math.cos(bractAng + Math.PI / 2) * bractW,
      by + Math.sin(bractAng + Math.PI / 2) * bractW,
    );
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = `rgba(28, 48, 24, ${0.32 * (1 - open * 0.55)})`;
    ctx.lineWidth = 0.32 * sw;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.quadraticCurveTo(mx, my, tx, ty);
    ctx.stroke();
  }

  if (open < 0.88) {
    const innerA = fade * (1 - open * 1.1) * 0.96;
    ctx.globalAlpha = innerA;
    const iw = (2.2 + size * 3.4) * sw * (1 - open * 0.35);
    const ih = (4 + size * 6.5) * sw * (1 - open * 0.45);
    const iy = head.y - ih * 0.4;
    const inner = ctx.createLinearGradient(head.x, iy - ih * 0.55, head.x, iy + ih * 0.35);
    inner.addColorStop(0, 'rgba(54, 86, 44, 0.95)');
    inner.addColorStop(0.4, 'rgba(44, 72, 36, 0.93)');
    inner.addColorStop(0.75, 'rgba(58, 90, 48, 0.9)');
    inner.addColorStop(1, 'rgba(68, 102, 54, 0.86)');
    ctx.fillStyle = inner;
    ctx.beginPath();
    ctx.ellipse(head.x, iy, iw * 0.46, ih * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    const hint = clamp((open - 0.04) * 2.8 + (size - 0.75) * 1.8, 0, 1);
    if (hint > 0.03) {
      ctx.globalAlpha = innerA * hint * 0.5;
      const hintGrad = ctx.createRadialGradient(
        head.x,
        iy - ih * 0.34,
        0,
        head.x,
        iy - ih * 0.34,
        iw * 0.52,
      );
      hintGrad.addColorStop(0, 'rgba(255, 214, 52, 0.65)');
      hintGrad.addColorStop(0.55, 'rgba(255, 198, 42, 0.22)');
      hintGrad.addColorStop(1, 'rgba(255, 198, 42, 0)');
      ctx.fillStyle = hintGrad;
      ctx.beginPath();
      ctx.arc(head.x, iy - ih * 0.3, iw * 0.38, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
};

export const drawFlowerReceptacle = (
  ctx: CanvasRenderingContext2D,
  head: { x: number; y: number },
  scale: number,
  alpha: number,
  strength: number,
  puff = 0,
) => {
  const t = clamp(strength, 0, 1);
  if (alpha <= 0.01 || t <= 0.01) return;
  ctx.save();
  const baseR = (2.2 + t * 1.3) * scale;
  const r = baseR * (1 + puff * 0.1);
  ctx.globalAlpha = alpha * smoothstep(0, 0.2, t) * (0.58 + puff * 0.24);
  const disc = ctx.createRadialGradient(
    head.x - 0.25 * scale,
    head.y - 0.3 * scale,
    0,
    head.x,
    head.y,
    r,
  );
  disc.addColorStop(0, 'rgba(148, 118, 76, 0.68)');
  disc.addColorStop(0.42, 'rgba(116, 92, 60, 0.48)');
  disc.addColorStop(0.76, 'rgba(92, 76, 54, 0.22)');
  disc.addColorStop(1, 'rgba(80, 68, 50, 0)');
  ctx.fillStyle = disc;
  ctx.beginPath();
  ctx.arc(head.x, head.y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

export const drawFlowerBloomGlow = (
  ctx: CanvasRenderingContext2D,
  head: { x: number; y: number },
  scale: number,
  alpha: number,
) => {
  if (alpha <= 0.02) return;
  const r = 14 * scale;
  const glow = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, r);
  glow.addColorStop(0, `rgba(255, 232, 80, ${0.22 * alpha})`);
  glow.addColorStop(0.45, `rgba(255, 220, 60, ${0.08 * alpha})`);
  glow.addColorStop(1, 'rgba(255, 220, 60, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(head.x, head.y, r, 0, Math.PI * 2);
  ctx.fill();
};

export const drawYellowFlower = (
  ctx: CanvasRenderingContext2D,
  head: { x: number; y: number },
  scale: number,
  fade: number,
  transition = 1,
  curl = 0,
) => {
  const t = clamp(transition, 0, 1);
  const c = clamp(curl, 0, 1);
  if (scale <= 0.02 || fade <= 0.02 || t <= 0.015) return;
  ctx.save();
  ctx.globalAlpha = fade * smoothstep(0.08, 0.55, t) * (1 - smoothstep(0.45, 1, c));
  const petalCount = 48;
  const discR = 7.2 * scale * (0.32 + t * 0.68);
  const petalReach = easeInOutCubic(t);
  for (let i = 0; i < petalCount; i++) {
    const ang = (i / petalCount) * Math.PI * 2;
    const stagger = hash(i) * 0.24;
    const petalT = smoothstep(stagger, stagger + 0.62, petalReach);
    const baseLen = (10 + hash(i) * 5) * scale;
    const len = baseLen * (0.08 + petalT * 0.92) * (1 - c * 0.88);
    const baseR = discR * (0.34 + c * 0.32);
    const px = head.x + Math.cos(ang) * baseR;
    const py = head.y + Math.sin(ang) * baseR;
    const tipR = baseR + len * (1 - c * 0.8);
    const tipX = head.x + Math.cos(ang) * tipR;
    const tipY = head.y + Math.sin(ang) * tipR;

    const warm = 1 - c * 0.45;
    const petalAlpha = clamp(petalT * 1.1 - hash(i) * 0.06, 0, 1);
    const petal = ctx.createLinearGradient(px, py, tipX, tipY);
    petal.addColorStop(
      0,
      `rgba(${lerpColor(235, 140, warm) | 0}, ${lerpColor(195, 118, warm) | 0}, ${lerpColor(28, 48, warm) | 0}, ${0.94 * scale * petalAlpha})`,
    );
    petal.addColorStop(
      0.55,
      `rgba(${lerpColor(255, 210, warm) | 0}, ${lerpColor(228, 168, warm) | 0}, ${lerpColor(52, 72, warm) | 0}, ${0.82 * scale * petalAlpha})`,
    );
    petal.addColorStop(
      1,
      `rgba(${lerpColor(255, 228, warm) | 0}, ${lerpColor(238, 188, warm) | 0}, ${lerpColor(78, 88, warm) | 0}, ${0.48 * scale * petalAlpha})`,
    );
    ctx.fillStyle = petal;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.quadraticCurveTo(
      px + Math.cos(ang + 0.12 + c * 0.28) * len * 0.52,
      py + Math.sin(ang + 0.12 + c * 0.28) * len * 0.52,
      tipX,
      tipY,
    );
    ctx.quadraticCurveTo(
      px + Math.cos(ang - 0.12 - c * 0.28) * len * 0.52,
      py + Math.sin(ang - 0.12 - c * 0.28) * len * 0.52,
      px,
      py,
    );
    ctx.fill();
  }

  if (c < 0.98) {
    const discShrink = 1 - smoothstep(0.42, 0.86, c) * 0.68;
    const discFade = (1 - smoothstep(0.48, 0.8, c)) * smoothstep(0.08, 0.55, t);
    if (discFade > 0.015 && discShrink > 0.12) {
      const shrunkR = discR * discShrink;
      const disc = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, shrunkR);
      const brown = c * 0.75;
      const discAlpha = discFade * (1 - c * 0.25);
      disc.addColorStop(
        0,
        `rgba(${lerpColor(210, 128, brown) | 0}, ${lerpColor(158, 102, brown) | 0}, ${lerpColor(38, 58, brown) | 0}, ${0.72 * scale * discAlpha})`,
      );
      disc.addColorStop(
        0.65,
        `rgba(${lerpColor(180, 108, brown) | 0}, ${lerpColor(128, 92, brown) | 0}, ${lerpColor(32, 48, brown) | 0}, ${0.48 * scale * discAlpha})`,
      );
      disc.addColorStop(
        1,
        `rgba(${lerpColor(130, 92, brown) | 0}, ${lerpColor(96, 76, brown) | 0}, ${lerpColor(28, 40, brown) | 0}, ${0.18 * scale * discAlpha})`,
      );
      ctx.fillStyle = disc;
      ctx.beginPath();
      ctx.arc(head.x, head.y, shrunkR, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
};

export const drawPlantHead = (
  ctx: CanvasRenderingContext2D,
  plant: Plant,
  head: { x: number; y: number },
) => {
  const life = headLifecycle(plant);
  const vis = plant.fade * plantDepthAlpha(plant);
  const scale = plant.scale;

  if (life.budSize > 0.015) {
    const budFade = vis * (1 - smoothstep(0.28, 0.82, life.bloom));
    drawFlowerBud(ctx, head, scale, budFade, life.budSize, life.budOpen, plant.id);
  }

  const bloomAlpha = vis * life.bloom * (1 - life.wilt * 0.96);
  if (life.bloom > 0.012 && bloomAlpha > 0.015 && life.wilt < FLOWER_WILT_YELLOW_END) {
    if (life.glow > 0.02) {
      drawFlowerBloomGlow(ctx, head, scale, bloomAlpha * life.glow);
    }
    drawYellowFlower(ctx, head, FLOWER_HEAD_GROW * scale, bloomAlpha, life.bloom, life.wilt);
  }

  if (
    life.receptacle > 0.012 &&
    (plant.phase === 'flower' || plant.phase === 'puffing' || plant.phase === 'mature')
  ) {
    drawFlowerReceptacle(ctx, head, scale, vis, life.receptacle, life.puff);
  }
};

export const drawHeadGlow = (
  ctx: CanvasRenderingContext2D,
  head: { x: number; y: number },
  radius: number,
  alpha: number,
) => {
  const glow = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, radius * 1.35);
  glow.addColorStop(0, `rgba(255, 252, 242, ${0.14 * alpha})`);
  glow.addColorStop(0.45, `rgba(255, 248, 235, ${0.06 * alpha})`);
  glow.addColorStop(1, 'rgba(255, 248, 235, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(head.x, head.y, radius * 1.35, 0, Math.PI * 2);
  ctx.fill();
};

export const drawWitheredStub = (
  ctx: CanvasRenderingContext2D,
  head: { x: number; y: number },
  plant: Plant,
) => {
  const alpha = plant.fade * plantDepthAlpha(plant) * clamp(1 - plant.puffReveal, 0, 1);
  if (alpha <= 0.02) return;
  const sw = plant.scale;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = `rgba(${74 + plant.stemBrown * 30}, ${56 + plant.stemBrown * 20}, ${38 + plant.stemBrown * 10}, 0.72)`;
  ctx.beginPath();
  ctx.ellipse(
    head.x,
    head.y + plant.wilt * 4 * sw,
    (2.2 - plant.wilt * 0.4) * sw,
    (3.2 - plant.wilt * 0.5) * sw,
    0.1 + plant.wilt * 0.4,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.fillStyle = `rgba(110, 88, 62, ${0.45 * alpha})`;
  ctx.beginPath();
  ctx.arc(
    head.x - 0.4 * sw + plant.wilt * 2 * sw,
    head.y - 0.6 * sw + plant.wilt * 5 * sw,
    (1.4 - plant.wilt * 0.3) * sw,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.restore();
};

export const drawEmergingPappus = (
  ctx: CanvasRenderingContext2D,
  seed: Seed,
  s: number,
  fluffLen: number,
  alpha: number,
  time: number,
) => {
  const tremble = Math.sin(time * 3.4 + seed.hairPhase) * 0.14 * (1 - fluffLen);
  const ang0 = Math.atan2(seed.ly, seed.lx + 0.001) + tremble;
  ctx.rotate(ang0 * 0.06);
  const hairs = 7;
  for (let h = 0; h < hairs; h++) {
    const ang = ang0 + (h - hairs / 2) * 0.38 + seed.hairPhase * 0.02;
    const len = s * (0.35 + fluffLen * 1.55);
    const bend = (hash(h + seed.hairPhase) - 0.5) * 0.35;
    ctx.strokeStyle = `rgba(255, 252, 246, ${alpha * (0.22 + fluffLen * 0.62)})`;
    ctx.lineWidth = 0.18 + fluffLen * 0.22;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(
      Math.cos(ang + bend) * len * 0.42,
      Math.sin(ang + bend) * len * 0.42,
      Math.cos(ang + bend * 0.4) * len,
      Math.sin(ang + bend * 0.4) * len,
    );
    ctx.stroke();
  }
};

export const drawSeed = (
  ctx: CanvasRenderingContext2D,
  fluff: HTMLCanvasElement,
  seed: Seed,
  time: number,
  staticFrame: boolean,
  reveal: number,
  plantFade: number,
  growing = false,
  fluffLen = 1,
) => {
  if (reveal <= 0.008) return;
  const depthAlpha = seed.attached
    ? 0.42 + clamp((seed.lz + 8) / 20, 0, 1) * 0.48
    : 0.42 + seed.depth * 0.48;
  const alpha = Math.max(0, seed.life) * depthAlpha * reveal * plantFade;
  ctx.save();
  ctx.translate(seed.x, seed.y);

  if (!seed.attached) {
    ctx.globalAlpha = alpha;
    if (seed.landed || seed.settleT >= 0.85) {
      ctx.rotate(seed.rot);
      ctx.scale(1, 0.72);
    } else {
      const tilt = seed.vx * 0.42 + seed.vy * 0.022 + Math.sin(time * 2.1 + seed.swayPhase) * 0.07;
      ctx.rotate(tilt);
    }
  } else {
    ctx.rotate(seed.rot);
  }

  const s = seed.size * (0.88 + seed.life * 0.12) * (seed.attached ? 1 : 0.76 + seed.depth * 0.24);

  if (seed.attached && growing) {
    const spriteAlpha = alpha * smoothstep(0.1, 0.42, fluffLen);
    if (spriteAlpha > 0.008) {
      ctx.globalAlpha = spriteAlpha;
      ctx.drawImage(fluff, -s, -s, s * 2, s * 2);
    }
    const emergeAlpha = alpha * (1 - smoothstep(0.38, 0.92, fluffLen));
    if (emergeAlpha > 0.008) {
      drawEmergingPappus(ctx, seed, s, Math.max(fluffLen, 0.28), emergeAlpha, time);
    }
  } else {
    ctx.globalAlpha = alpha;
    ctx.drawImage(fluff, -s, -s, s * 2, s * 2);
  }

  if (seed.attached && !staticFrame && fluffLen > 0.42) {
    const tremble = Math.sin(time * 3.2 + seed.hairPhase) * 0.18;
    ctx.globalAlpha = alpha * smoothstep(0.42, 0.72, fluffLen);
    ctx.strokeStyle = `rgba(255, 250, 240, ${0.12 + hash(seed.hairPhase) * 0.1})`;
    ctx.lineWidth = 0.25;
    for (let h = 0; h < 3; h++) {
      const ang = seed.hairPhase + h * 2.1 + tremble;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(ang) * s * 0.9, Math.sin(ang) * s * 0.9);
      ctx.stroke();
    }
  }

  ctx.restore();
};
