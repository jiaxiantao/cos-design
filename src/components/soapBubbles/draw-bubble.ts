import { drawSoapIridescence, filmColor, softBlob } from './film';
import {
  drawSoapCastShadow,
  paintBlobShading,
  paintSphereShading,
  resolveSceneLighting,
} from './lighting';
import {
  buildMergePath,
  mergeEndFade,
  mergeStartFade,
  type ActiveMerge,
  type MergePose,
} from './merge';
import type { Bubble, Droplet } from './types';
import { TWO_PI } from './types';
import { bubbleAlpha, buildBubbleVisual, hash01 } from './utils';
import { clamp } from '@cos-design/shared';

/** 背光侧环境反射色斑 */
const drawEnvReflection = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  R: number,
  toLight: number,
  seed: number,
  envAmt: number,
  envRgb: [number, number, number],
  scale = 1,
) => {
  const envAng = toLight + Math.PI + (hash01(seed + 19.2) - 0.5) * 0.3;
  const envR = 0.32 + hash01(seed + 20.1) * 0.2;
  softBlob(
    ctx,
    cx + Math.cos(envAng) * R * envR * scale,
    cy + Math.sin(envAng) * R * envR * scale,
    R * (0.4 + hash01(seed + 21) * 0.25) * scale,
    R * (0.28 + hash01(seed + 22) * 0.18) * scale,
    envAng,
    envRgb,
    envAmt,
  );
};

/**
 * 真实感肥皂泡：球体 Lambert 明暗 + 背光内阴影 + 镜面高光 + 软色斑虹彩 + 背景投影。
 */
export const drawSoapBubble = (
  ctx: CanvasRenderingContext2D,
  b: Bubble,
  time: number,
  lightX: number,
  lightY: number,
  opts?: { alphaScale?: number; skipShadow?: boolean },
) => {
  const breathe = Math.sin(time * 1.8 * b.wobble + b.phase);
  const squashX = 1 + breathe * 0.05;
  const squashY = 1 - breathe * 0.045;
  const alpha = bubbleAlpha(b.depth, opts?.alphaScale ?? 1);
  const light = resolveSceneLighting(b.x, b.y, lightX, lightY);
  const { shadeOpts, filmBias, envAmt, envRgb } = buildBubbleVisual(b.seed, b.depth);

  if (!opts?.skipShadow) {
    drawSoapCastShadow(ctx, b.x, b.y, b.r, light, b.depth, alpha);
  }

  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.globalAlpha = alpha;
  ctx.scale(squashX, squashY);
  const R = b.r;

  paintSphereShading(ctx, R, light.toLight, shadeOpts);

  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, R * 0.995, 0, TWO_PI);
  ctx.clip();
  drawSoapIridescence(ctx, b, R, light.toLight, time, filmBias);
  ctx.restore();

  drawEnvReflection(ctx, 0, 0, R, light.toLight, b.seed, envAmt, envRgb);
  ctx.restore();
};

/**
 * 融合绘制：metaball 液滴 + 起步/收尾与单泡 crossfade。
 */
export const drawMergingSoapPair = (
  ctx: CanvasRenderingContext2D,
  pose: MergePose,
  time: number,
  primary: Bubble,
  secondary: Bubble | undefined,
  mergeProgress: number,
  lightX: number,
  lightY: number,
  opts?: { skipShadow?: boolean },
) => {
  const { ax, ay, ar, bx, by, br, absorb } = pose;
  const mass = Math.max(1, ar + br);
  const mx = (ax * ar + bx * br) / mass;
  const my = (ay * ar + by * br) / mass;
  const startFade = mergeStartFade(mergeProgress);
  const endFade = mergeEndFade(absorb);
  const metaFade = (1 - startFade) * (1 - endFade);

  if (startFade > 0.02 && secondary) {
    drawSoapBubble(ctx, { ...primary, x: ax, y: ay, r: ar }, time, lightX, lightY, {
      skipShadow: true,
      alphaScale: startFade,
    });
    drawSoapBubble(ctx, { ...secondary, x: bx, y: by, r: br }, time, lightX, lightY, {
      skipShadow: true,
      alphaScale: startFade,
    });
  }

  if (endFade > 0.02) {
    drawSoapBubble(ctx, { ...primary, x: mx, y: my, r: ar }, time, lightX, lightY, {
      skipShadow: true,
      alphaScale: endFade,
    });
  }

  if (metaFade < 0.02) return;

  const meta = buildMergePath(ax, ay, ar, bx, by, br);
  const { shadeOpts, filmBias, envAmt, envRgb } = buildBubbleVisual(primary.seed, primary.depth);
  const light = resolveSceneLighting(meta.cx, meta.cy, lightX, lightY);
  const alpha = bubbleAlpha(primary.depth, metaFade);
  const shadeR = meta.radius;

  if (!opts?.skipShadow) {
    drawSoapCastShadow(ctx, meta.cx, meta.cy, shadeR * 0.85, light, primary.depth, alpha);
  }

  ctx.save();
  ctx.globalAlpha = alpha;

  paintBlobShading(ctx, meta.path, meta.cx, meta.cy, shadeR, light, shadeOpts);

  ctx.save();
  ctx.clip(meta.path);
  ctx.translate(meta.cx, meta.cy);
  drawSoapIridescence(ctx, primary, shadeR, light.toLight, time, filmBias, metaFade);

  ctx.translate(-meta.cx, -meta.cy);
  const envAng = light.toLight + Math.PI + (hash01(primary.seed + 19.2) - 0.5) * 0.3;
  softBlob(
    ctx,
    meta.cx + Math.cos(envAng) * shadeR * 0.28,
    meta.cy + Math.sin(envAng) * shadeR * 0.28,
    shadeR * 0.34,
    shadeR * 0.24,
    envAng,
    envRgb,
    envAmt * metaFade,
  );
  ctx.restore();
  ctx.restore();
};

/** 融合中各阶段的地面投影 */
export const drawMergeShadows = (
  ctx: CanvasRenderingContext2D,
  merge: ActiveMerge,
  pose: MergePose,
  primary: Bubble,
  secondary: Bubble | undefined,
  lightX: number,
  lightY: number,
) => {
  const mass = Math.max(1, pose.ar + pose.br);
  const mx = (pose.ax * pose.ar + pose.bx * pose.br) / mass;
  const my = (pose.ay * pose.ar + pose.by * pose.br) / mass;
  const startFade = mergeStartFade(merge.progress);
  const endFade = mergeEndFade(pose.absorb);
  const alpha = bubbleAlpha(primary.depth);
  const metaFade = (1 - startFade) * (1 - endFade);

  if (startFade > 0.02 && secondary) {
    const lightA = resolveSceneLighting(pose.ax, pose.ay, lightX, lightY);
    const lightB = resolveSceneLighting(pose.bx, pose.by, lightX, lightY);
    drawSoapCastShadow(ctx, pose.ax, pose.ay, pose.ar, lightA, primary.depth, alpha * startFade);
    drawSoapCastShadow(ctx, pose.bx, pose.by, pose.br, lightB, secondary.depth, alpha * startFade);
  }
  if (endFade > 0.02) {
    const light = resolveSceneLighting(mx, my, lightX, lightY);
    drawSoapCastShadow(ctx, mx, my, pose.ar, light, primary.depth, alpha * endFade);
  }
  if (metaFade > 0.02) {
    const meta = buildMergePath(pose.ax, pose.ay, pose.ar, pose.bx, pose.by, pose.br);
    const light = resolveSceneLighting(meta.cx, meta.cy, lightX, lightY);
    drawSoapCastShadow(
      ctx,
      meta.cx,
      meta.cy,
      meta.radius * 0.85,
      light,
      primary.depth,
      alpha * metaFade,
    );
  }
};

/** 爆裂：刺破点张开 → 薄膜回缩珠串 → 细雾消散 */
export const drawPop = (ctx: CanvasRenderingContext2D, b: Bubble) => {
  const p = b.pop;
  ctx.save();
  ctx.translate(b.x, b.y);

  if (p < 0.55) {
    const open = Math.min(1, p / 0.35);
    const remain = 1 - open;
    const half = Math.PI * remain;
    const mid = b.popAng + Math.PI;
    const rad = b.r * (1 - p * 0.15);
    ctx.globalAlpha = 0.55 * remain;
    ctx.beginPath();
    ctx.arc(0, 0, rad, mid - half, mid + half);
    ctx.strokeStyle = filmColor(0.4 + p, 0.5);
    ctx.lineWidth = Math.max(1.2, b.r * 0.035);
    ctx.stroke();

    const beads = 10 + Math.floor(b.r / 4);
    for (let i = 0; i < beads; i++) {
      const t = i / Math.max(1, beads - 1);
      const a = mid - half + t * half * 2;
      const br = 1.2 + (1 - Math.abs(t - 0.5) * 2) * b.r * 0.04;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * rad, Math.sin(a) * rad, br, 0, TWO_PI);
      ctx.fillStyle = `rgba(230,245,255,${0.45 * remain})`;
      ctx.fill();
    }
  }

  if (p < 0.2) {
    const flash = 1 - p / 0.2;
    ctx.globalAlpha = flash * 0.35;
    ctx.beginPath();
    ctx.arc(
      Math.cos(b.popAng) * b.r * 0.7,
      Math.sin(b.popAng) * b.r * 0.7,
      b.r * 0.15 * flash,
      0,
      TWO_PI,
    );
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fill();
  }

  ctx.restore();
};

export const drawDroplet = (ctx: CanvasRenderingContext2D, d: Droplet) => {
  const k = clamp(d.life / d.maxLife, 0, 1);
  ctx.save();
  ctx.globalAlpha = k * (d.kind === 0 ? 0.45 : 0.75);
  const g = ctx.createRadialGradient(d.x - d.r * 0.3, d.y - d.r * 0.3, 0, d.x, d.y, d.r);
  g.addColorStop(0, 'rgba(255,255,255,0.9)');
  g.addColorStop(0.45, 'rgba(210,235,255,0.55)');
  g.addColorStop(1, 'rgba(160,200,230,0.05)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(d.x, d.y, d.r, 0, TWO_PI);
  ctx.fill();
  ctx.restore();
};
