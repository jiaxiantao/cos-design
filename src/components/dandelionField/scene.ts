import { clamp } from '@cos-design/shared';
import {
  GRASS_IDLE_AMP,
  GRASS_LIFT_STIFF,
  GRASS_WIND_AMP,
  GRASS_WIND_DAMP,
  GRASS_WIND_STIFF,
} from './constants';
import type { GrassTuftDef, GrassTuftWind } from './types';
import { hash, smoothstep, softSat } from './utils';

/** 静态天空 + 草地底色（不含草叶，草叶单独每帧绘制以响应风） */
export const buildSceneBackdrop = (width: number, height: number): HTMLCanvasElement => {
  const cv = document.createElement('canvas');
  cv.width = width;
  cv.height = height;
  const ctx = cv.getContext('2d')!;
  const sunX = width * 0.76;
  const sunY = height * 0.1;
  const grassStart = height * 0.68;

  const atmos = ctx.createLinearGradient(0, 0, 0, height);
  atmos.addColorStop(0, '#1a4f8c');
  atmos.addColorStop(0.22, '#2f6aad');
  atmos.addColorStop(0.36, '#5598c4');
  atmos.addColorStop(0.44, '#7eb0cc');
  atmos.addColorStop(0.49, '#94b8b4');
  atmos.addColorStop(0.53, '#8aab88');
  atmos.addColorStop(0.57, '#789a68');
  atmos.addColorStop(0.62, '#668856');
  atmos.addColorStop(0.7, '#547044');
  atmos.addColorStop(0.82, '#465c38');
  atmos.addColorStop(1, '#384a2e');
  ctx.fillStyle = atmos;
  ctx.fillRect(0, 0, width, height);

  const zenith = ctx.createRadialGradient(
    width * 0.5,
    0,
    0,
    width * 0.5,
    height * 0.22,
    height * 0.65,
  );
  zenith.addColorStop(0, 'rgba(12, 42, 90, 0.32)');
  zenith.addColorStop(0.55, 'rgba(30, 80, 140, 0.08)');
  zenith.addColorStop(1, 'rgba(30, 80, 140, 0)');
  ctx.fillStyle = zenith;
  ctx.fillRect(0, 0, width, height * 0.5);

  const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, width * 0.48);
  sunGlow.addColorStop(0, 'rgba(255, 248, 228, 0.38)');
  sunGlow.addColorStop(0.22, 'rgba(255, 238, 200, 0.14)');
  sunGlow.addColorStop(0.55, 'rgba(255, 225, 180, 0.06)');
  sunGlow.addColorStop(1, 'rgba(255, 220, 170, 0)');
  ctx.fillStyle = sunGlow;
  ctx.fillRect(0, 0, width, height * 0.48);

  const corona = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, width * 0.038);
  corona.addColorStop(0, 'rgba(255, 252, 245, 0.88)');
  corona.addColorStop(0.55, 'rgba(255, 246, 220, 0.35)');
  corona.addColorStop(1, 'rgba(255, 235, 200, 0)');
  ctx.fillStyle = corona;
  ctx.beginPath();
  ctx.arc(sunX, sunY, width * 0.038, 0, Math.PI * 2);
  ctx.fill();

  const drawCloud = (cx: number, cy: number, scale: number, alpha: number) => {
    const puffs = [
      { ox: 0, oy: 0, r: scale },
      { ox: scale * 0.72, oy: scale * 0.08, r: scale * 0.78 },
      { ox: -scale * 0.65, oy: scale * 0.12, r: scale * 0.68 },
      { ox: scale * 0.35, oy: -scale * 0.22, r: scale * 0.55 },
      { ox: -scale * 0.28, oy: -scale * 0.18, r: scale * 0.48 },
    ];
    ctx.save();
    ctx.globalAlpha = alpha;
    for (const p of puffs) {
      const g = ctx.createRadialGradient(cx + p.ox, cy + p.oy, 0, cx + p.ox, cy + p.oy, p.r);
      g.addColorStop(0, 'rgba(255, 255, 255, 0.92)');
      g.addColorStop(0.55, 'rgba(248, 252, 255, 0.55)');
      g.addColorStop(1, 'rgba(240, 248, 255, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx + p.ox, cy + p.oy, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  drawCloud(width * 0.22, height * 0.14, width * 0.09, 0.72);
  drawCloud(width * 0.52, height * 0.08, width * 0.07, 0.58);
  drawCloud(width * 0.88, height * 0.18, width * 0.08, 0.65);
  drawCloud(width * 0.08, height * 0.26, width * 0.06, 0.48);
  drawCloud(width * 0.62, height * 0.22, width * 0.055, 0.42);

  for (let i = 0; i < 16; i++) {
    const seed = i * 5.9 + 40;
    const cx = hash(seed) * width;
    const cy = height * (0.44 + hash(seed * 1.3) * 0.16);
    const rx = 80 + hash(seed + 2) * 220;
    const ry = 18 + hash(seed + 4) * 42;
    const lighter = hash(seed + 6) > 0.5;
    const pg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry));
    if (lighter) {
      pg.addColorStop(0, 'rgba(130, 168, 148, 0.07)');
      pg.addColorStop(1, 'rgba(130, 168, 148, 0)');
    } else {
      pg.addColorStop(0, 'rgba(88, 118, 98, 0.06)');
      pg.addColorStop(1, 'rgba(88, 118, 98, 0)');
    }
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, hash(seed + 8) * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  const sunWash = ctx.createRadialGradient(
    sunX,
    height * 0.64,
    0,
    sunX,
    height * 0.7,
    width * 0.68,
  );
  sunWash.addColorStop(0, 'rgba(168, 188, 118, 0.14)');
  sunWash.addColorStop(0.5, 'rgba(138, 162, 98, 0.06)');
  sunWash.addColorStop(1, 'rgba(100, 130, 80, 0)');
  ctx.fillStyle = sunWash;
  ctx.fillRect(0, 0, width, height);

  const drawGroundPatch = (
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    r: number,
    g: number,
    b: number,
    a: number,
  ) => {
    const pg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry));
    pg.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${a})`);
    pg.addColorStop(0.55, `rgba(${r}, ${g}, ${b}, ${a * 0.45})`);
    pg.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, hash(cx + cy) * 0.5, 0, Math.PI * 2);
    ctx.fill();
  };

  for (let i = 0; i < 44; i++) {
    const seed = i * 4.17 + 90;
    const cx = hash(seed) * width;
    const cy = grassStart + hash(seed * 1.7) * (height - grassStart);
    const depth = (cy - grassStart) / Math.max(height - grassStart, 1);
    const rx = (28 + hash(seed + 3) * 90) * (0.55 + depth * 0.45);
    const ry = (10 + hash(seed + 5) * 32) * (0.5 + depth * 0.5);
    const kind = hash(seed + 7);
    if (kind < 0.34) {
      drawGroundPatch(cx, cy, rx, ry, 72, 98, 52, 0.1 + depth * 0.06);
    } else if (kind < 0.58) {
      drawGroundPatch(cx, cy, rx * 0.85, ry * 0.85, 38, 58, 32, 0.12 + depth * 0.05);
    } else if (kind < 0.78) {
      drawGroundPatch(cx, cy, rx * 0.7, ry * 0.65, 118, 128, 68, 0.07 + depth * 0.04);
    } else {
      drawGroundPatch(cx, cy, rx * 0.6, ry * 0.55, 92, 82, 48, 0.06 + depth * 0.03);
    }
  }

  const groundShade = ctx.createRadialGradient(
    width * 0.5,
    height * 1.02,
    height * 0.08,
    width * 0.5,
    height * 1.02,
    height * 0.55,
  );
  groundShade.addColorStop(0, 'rgba(12, 20, 10, 0.16)');
  groundShade.addColorStop(0.55, 'rgba(12, 20, 10, 0.06)');
  groundShade.addColorStop(1, 'rgba(12, 20, 10, 0)');
  ctx.fillStyle = groundShade;
  ctx.fillRect(0, height * 0.55, width, height * 0.45);

  const vignette = ctx.createRadialGradient(
    width * 0.5,
    height * 0.48,
    width * 0.28,
    width * 0.5,
    height * 0.5,
    width * 0.82,
  );
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(1, 'rgba(12, 22, 8, 0.12)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  return cv;
};

export const grassFadeAt = (y: number, height: number, grassStart: number) =>
  smoothstep(grassStart - height * 0.04, grassStart + height * 0.08, y);

/** 预生成草簇布局（确定性，每帧只重绘形态） */
export const buildGrassField = (width: number, height: number): GrassTuftDef[] => {
  const grassStart = height * 0.68;
  const tufts: GrassTuftDef[] = [];

  const scatter = (
    yMin: number,
    yMax: number,
    cols: number,
    rows: number,
    sizeMin: number,
    sizeMax: number,
    alpha: number,
    skipChance: number,
  ) => {
    const regionTop = height * yMin;
    const regionH = height * (yMax - yMin);
    const cellW = width / cols;
    const cellH = regionH / rows;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const seed = col * 17.3 + row * 23.9 + yMin * 100;
        if (hash(seed) < skipChance) continue;
        const jx = (hash(seed + 1) - 0.5) * cellW * 0.75;
        const jy = (hash(seed + 2) - 0.5) * cellH * 0.75;
        const x = col * cellW + cellW * 0.5 + jx;
        const y = regionTop + row * cellH + cellH * 0.5 + jy;
        const depth = (y - grassStart) / Math.max(height - grassStart, 1);
        const size = (sizeMin + hash(seed + 3) * (sizeMax - sizeMin)) * (0.55 + depth * 0.55);
        const a = alpha * (0.45 + depth * 0.65) * (0.75 + hash(seed + 4) * 0.5);
        tufts.push({
          x,
          y,
          size,
          alpha: a,
          depth,
          phase: hash(seed + 6) * Math.PI * 2,
        });
      }
    }
  };

  scatter(0.68, 0.8, 20, 5, 10, 24, 0.42, 0.38);
  scatter(0.74, 0.9, 24, 7, 14, 34, 0.55, 0.22);
  scatter(0.82, 0.97, 28, 6, 18, 44, 0.68, 0.12);
  return tufts;
};

/** 每簇草独立弹簧阻尼，追随风向并带自然回弹 */
export const updateGrassFieldWind = (
  states: GrassTuftWind[],
  tufts: GrassTuftDef[],
  wind: { x: number; y: number; speed: number },
  time: number,
  dt: number,
) => {
  for (let i = 0; i < tufts.length; i++) {
    const tuft = tufts[i];
    const st = states[i];
    if (!st) continue;

    const depthMul = 0.32 + tuft.depth * 0.68;
    const stiffMul = 0.78 + hash(tuft.phase * 2.1) * 0.44;
    const idle =
      Math.sin(time * (0.72 + hash(tuft.phase) * 0.38) + tuft.phase) *
      GRASS_IDLE_AMP *
      (0.45 + tuft.depth * 0.55);

    const targetSway =
      (wind.x * (0.62 + tuft.depth * 0.28) +
        softSat(wind.x, 0.12) * 0.45 +
        wind.speed * 0.22 * Math.sin(time * 1.65 + tuft.phase * 1.3) +
        idle) *
      depthMul *
      GRASS_WIND_AMP;
    const targetLift =
      (wind.y * (0.26 + tuft.depth * 0.16) + idle * 0.35) * depthMul * GRASS_WIND_AMP;

    st.swayVel +=
      ((targetSway - st.sway) * GRASS_WIND_STIFF * stiffMul - st.swayVel * GRASS_WIND_DAMP) * dt;
    st.sway += st.swayVel * dt;
    st.sway = clamp(st.sway, -2.6 * GRASS_WIND_AMP, 2.6 * GRASS_WIND_AMP);

    st.liftVel +=
      ((targetLift - st.lift) * GRASS_LIFT_STIFF * stiffMul - st.liftVel * GRASS_WIND_DAMP) * dt;
    st.lift += st.liftVel * dt;
    st.lift = clamp(st.lift, -0.75 * GRASS_WIND_AMP, 0.75 * GRASS_WIND_AMP);
  }
};

export const drawGrassField = (
  ctx: CanvasRenderingContext2D,
  tufts: GrassTuftDef[],
  states: GrassTuftWind[],
  height: number,
  time: number,
) => {
  const grassStart = height * 0.68;

  for (let ti = 0; ti < tufts.length; ti++) {
    const tuft = tufts[ti];
    const st = states[ti];
    if (!st) continue;

    const fade = grassFadeAt(tuft.y, height, grassStart);
    if (fade <= 0.01) continue;

    const a = tuft.alpha * fade;
    const blades = 4 + Math.floor(hash(tuft.x * 0.17 + tuft.y * 0.23) * 5);
    let maxLen = tuft.size * 0.55;
    for (let b = 0; b < blades; b++) {
      const seed = tuft.x * 0.31 + tuft.y * 0.19 + b * 11.7;
      maxLen = Math.max(maxLen, tuft.size * (0.65 + hash(seed + 2) * 0.55));
    }

    for (let b = 0; b < blades; b++) {
      const seed = tuft.x * 0.31 + tuft.y * 0.19 + b * 11.7;
      const spread = (hash(seed + 1) - 0.5) * 0.75;
      const ang = -Math.PI / 2 + spread;
      const len = tuft.size * (0.65 + hash(seed + 2) * 0.55);
      const lenRatio = len / Math.max(maxLen, 1);
      const bladeFlex = 0.58 + lenRatio * 0.42;
      const bladeLag = 0.82 + hash(seed + 12) * 0.28;

      const sway = st.sway * bladeFlex * bladeLag;
      const lift = st.lift * bladeFlex * bladeLag;
      const flutter =
        Math.sin(time * (3.2 + hash(seed + 14) * 2.4) + tuft.phase + b * 0.7) *
        len *
        0.028 *
        lenRatio *
        lenRatio *
        GRASS_WIND_AMP;

      const baseX = tuft.x + (hash(seed + 6) - 0.5) * tuft.size * 0.08;
      const baseY = tuft.y;
      const restCpX =
        baseX + Math.cos(ang) * len * 0.42 + (hash(seed + 3) - 0.5) * tuft.size * 0.22;
      const restCpY = baseY + Math.sin(ang) * len * 0.42 + len * 0.06;
      const restTipX = baseX + Math.cos(ang) * len;
      const restTipY = baseY + Math.sin(ang) * len;

      const cpBend = sway * len * 0.22 * lenRatio * lenRatio;
      const tipBend = sway * len * 0.58 * lenRatio;
      const cpX = restCpX + cpBend;
      const cpY = restCpY - lift * len * 0.06 * lenRatio - cpBend * 0.08;
      const tipX = restTipX + tipBend + flutter;
      const tipY = restTipY - lift * len * 0.14 * lenRatio + flutter * 0.15;

      const sunLit = hash(seed + 4) > 0.38;
      const grad = ctx.createLinearGradient(baseX, baseY, tipX, tipY);
      if (sunLit) {
        grad.addColorStop(0, `rgba(42, 62, 28, ${a})`);
        grad.addColorStop(0.55, `rgba(72, 98, 44, ${a * 0.92})`);
        grad.addColorStop(1, `rgba(108, 128, 58, ${a * 0.72})`);
      } else {
        grad.addColorStop(0, `rgba(34, 52, 24, ${a})`);
        grad.addColorStop(0.6, `rgba(52, 74, 34, ${a * 0.88})`);
        grad.addColorStop(1, `rgba(68, 88, 42, ${a * 0.65})`);
      }
      ctx.strokeStyle = grad;
      ctx.lineWidth = 0.35 + hash(seed + 5) * 0.55 + tuft.size * 0.015;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(baseX, baseY);
      ctx.quadraticCurveTo(cpX, cpY, tipX, tipY);
      ctx.stroke();
    }
  }
};
