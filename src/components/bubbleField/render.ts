import { BLOB_SEGMENTS, LIGHT_X, LIGHT_Y, META_SEGMENTS } from './constants';
import type { Bubble } from './types';

const blobRadius = (bubble: Bubble, angle: number, time: number) => {
  const breathe = Math.sin(time * bubble.deformSpeed + bubble.deformPhase) * bubble.deformAmp;
  const ripple =
    Math.sin(angle * 2 + bubble.phase + time * 0.4) * bubble.deformAmp * 0.55 +
    Math.sin(angle * 3 + bubble.deformPhase) * bubble.deformAmp * 0.25;
  let local = breathe + ripple + bubble.pulseBoost * 0.035 + bubble.settle * 0.06;

  if (Math.abs(bubble.streamStretch) > 0.01) {
    const facing = Math.cos(angle - bubble.streamAngle);
    const s = bubble.streamStretch * (0.14 + Math.min(0.08, bubble.radius * 0.0025));
    local += facing * facing * s;
    local -= (1 - facing * facing) * s * 0.55;
  }

  if (Math.abs(bubble.mode2) > 0.002) {
    local += bubble.mode2 * Math.cos(2 * (angle - bubble.mode2Angle)) * 0.28;
  }

  if (Math.abs(bubble.mode3) > 0.002) {
    local += bubble.mode3 * Math.cos(3 * (angle - bubble.mode3Phase)) * 0.16;
  }

  return bubble.radius * (1 + local);
};

const buildBubblePath = (bubble: Bubble, time: number) => {
  const cx = bubble.x;
  const cy = bubble.y;
  let aspect = bubble.aspect - bubble.settle * 0.04;
  let tilt = bubble.tilt;

  const deformEnergy =
    Math.abs(bubble.streamStretch) * 0.7 + Math.abs(bubble.mode2) * 0.9 + Math.abs(bubble.mode3) * 0.35;
  if (deformEnergy > 0.03) {
    const f = Math.min(1, deformEnergy);
    const axis = bubble.streamStretch > 0.02 ? bubble.streamAngle : bubble.mode2Angle;
    tilt = tilt * (1 - f * 0.55) + axis * f * 0.55;
    aspect -= Math.min(0.12, bubble.streamStretch * 0.1 + Math.abs(bubble.mode2) * 0.08);
  }

  const cos = Math.cos(tilt);
  const sin = Math.sin(tilt);
  const path = new Path2D();

  for (let i = 0; i <= BLOB_SEGMENTS; i++) {
    const angle = (Math.PI * 2 * i) / BLOB_SEGMENTS;
    const r = blobRadius(bubble, angle, time);
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r * aspect;
    const x = cx + px * cos - py * sin;
    const y = cy + px * sin + py * cos;
    if (i === 0) path.moveTo(x, y);
    else path.lineTo(x, y);
  }

  path.closePath();
  return path;
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

const buildMetaballPath = (ax: number, ay: number, ar: number, bx: number, by: number, br: number) => {
  const mass = ar + br || 1;
  const cx = (ax * ar + bx * br) / mass;
  const cy = (ay * ar + by * br) / mass;
  const path = new Path2D();

  for (let i = 0; i <= META_SEGMENTS; i++) {
    const angle = (Math.PI * 2 * i) / META_SEGMENTS;
    const p = sampleMetaballPoint(angle, ax, ay, ar, bx, by, br, cx, cy);
    if (i === 0) path.moveTo(p.x, p.y);
    else path.lineTo(p.x, p.y);
  }

  path.closePath();
  return { path, cx, cy, radius: Math.max(ar, br) };
};

export const drawBubble = (
  ctx: CanvasRenderingContext2D,
  bubble: Bubble,
  time: number,
  tint: string,
  width: number,
  height: number
) => {
  const path = buildBubblePath(bubble, time);
  const depth = Math.min(1, Math.max(0, bubble.y / height));
  const lightX = width * LIGHT_X;
  const lightY = height * LIGHT_Y;
  const toLight = Math.atan2(lightY - bubble.y, lightX - bubble.x);
  const highlightX = bubble.x + Math.cos(toLight) * bubble.radius * 0.38;
  const highlightY = bubble.y + Math.sin(toLight) * bubble.radius * 0.38;
  const shadowX = bubble.x - Math.cos(toLight) * bubble.radius * 0.42;
  const shadowY = bubble.y - Math.sin(toLight) * bubble.radius * 0.42;
  const depthAlpha = bubble.alpha * (0.55 + (1 - depth) * 0.55);

  const bodyGradient = ctx.createRadialGradient(
    highlightX,
    highlightY,
    bubble.radius * 0.04,
    bubble.x,
    bubble.y,
    bubble.radius * 1.45
  );
  bodyGradient.addColorStop(0, 'rgb(255 255 255 / 72%)');
  bodyGradient.addColorStop(0.12, 'rgb(186 230 253 / 42%)');
  bodyGradient.addColorStop(0.35, `${tint}30`);
  bodyGradient.addColorStop(0.62, 'rgb(14 116 144 / 22%)');
  bodyGradient.addColorStop(0.85, 'rgb(2 12 27 / 48%)');
  bodyGradient.addColorStop(1, 'rgb(1 4 12 / 78%)');

  ctx.fillStyle = bodyGradient;
  ctx.globalAlpha = depthAlpha;
  ctx.fill(path);

  ctx.save();
  ctx.clip(path);

  const innerShadow = ctx.createRadialGradient(shadowX, shadowY, 0, shadowX, shadowY, bubble.radius * 0.95);
  innerShadow.addColorStop(0, 'rgb(1 8 20 / 58%)');
  innerShadow.addColorStop(0.55, 'rgb(2 12 27 / 28%)');
  innerShadow.addColorStop(1, 'rgb(2 12 27 / 0%)');
  ctx.fillStyle = innerShadow;
  ctx.fillRect(
    bubble.x - bubble.radius * 1.2,
    bubble.y - bubble.radius * 1.2,
    bubble.radius * 2.4,
    bubble.radius * 2.4
  );

  ctx.beginPath();
  ctx.ellipse(highlightX, highlightY, bubble.radius * 0.2, bubble.radius * 0.11, toLight - 0.25, 0, Math.PI * 2);
  ctx.fillStyle = 'rgb(255 255 255 / 78%)';
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(
    bubble.x + Math.cos(toLight + 0.9) * bubble.radius * 0.15,
    bubble.y + Math.sin(toLight + 0.9) * bubble.radius * 0.15,
    bubble.radius * 0.07,
    bubble.radius * 0.04,
    toLight,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = 'rgb(255 255 255 / 22%)';
  ctx.fill();
  ctx.restore();

  const rim = ctx.createRadialGradient(
    bubble.x,
    bubble.y,
    bubble.radius * 0.68,
    bubble.x,
    bubble.y,
    bubble.radius * 1.06
  );
  rim.addColorStop(0, 'rgb(255 255 255 / 0%)');
  rim.addColorStop(0.5, 'rgb(186 230 253 / 24%)');
  rim.addColorStop(1, 'rgb(224 242 254 / 55%)');
  ctx.strokeStyle = rim;
  ctx.lineWidth = 0.8 + bubble.radius * 0.028;
  ctx.stroke(path);

  ctx.globalAlpha = 1;
};

export const drawMergingPair = (
  ctx: CanvasRenderingContext2D,
  ax: number,
  ay: number,
  ar: number,
  bx: number,
  by: number,
  br: number,
  tint: string,
  width: number,
  height: number,
  alpha: number
) => {
  const center = buildMetaballPath(ax, ay, ar, bx, by, br);
  const depth = Math.min(1, Math.max(0, center.cy / height));
  const lightX = width * LIGHT_X;
  const lightY = height * LIGHT_Y;
  const toLight = Math.atan2(lightY - center.cy, lightX - center.cx);
  const highlightX = center.cx + Math.cos(toLight) * center.radius * 0.32;
  const highlightY = center.cy + Math.sin(toLight) * center.radius * 0.32;
  const extent = Math.hypot(ax - bx, ay - by) + ar + br;

  const bodyGradient = ctx.createRadialGradient(
    highlightX,
    highlightY,
    center.radius * 0.05,
    center.cx,
    center.cy,
    extent * 0.75
  );
  bodyGradient.addColorStop(0, 'rgb(255 255 255 / 70%)');
  bodyGradient.addColorStop(0.14, 'rgb(186 230 253 / 40%)');
  bodyGradient.addColorStop(0.4, `${tint}32`);
  bodyGradient.addColorStop(0.75, 'rgb(2 12 27 / 45%)');
  bodyGradient.addColorStop(1, 'rgb(1 4 12 / 75%)');

  ctx.fillStyle = bodyGradient;
  ctx.globalAlpha = alpha * (0.55 + (1 - depth) * 0.5);
  ctx.fill(center.path);

  ctx.save();
  ctx.clip(center.path);
  ctx.beginPath();
  ctx.ellipse(highlightX, highlightY, center.radius * 0.22, center.radius * 0.12, toLight - 0.2, 0, Math.PI * 2);
  ctx.fillStyle = 'rgb(255 255 255 / 72%)';
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = 'rgb(224 242 254 / 42%)';
  ctx.lineWidth = 1 + center.radius * 0.02;
  ctx.stroke(center.path);
  ctx.globalAlpha = 1;
};
