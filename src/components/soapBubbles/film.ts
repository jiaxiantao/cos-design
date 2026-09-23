import { lambertAtAngle } from './lighting';
import type { Bubble } from './types';
import { TWO_PI } from './types';
import { hash01 } from './utils';

/** 薄膜厚度 → RGB（软过渡干涉色） */
export const filmRgb = (thickness: number): [number, number, number] => {
  const t = ((thickness % 1) + 1) % 1;
  const stops: [number, number, number][] = [
    [55, 58, 72],
    [200, 150, 55],
    [230, 60, 150],
    [30, 185, 230],
    [55, 210, 120],
    [235, 195, 70],
    [170, 85, 210],
    [55, 58, 72],
  ];
  const x = t * (stops.length - 1);
  const i = Math.floor(x);
  const f = x - i;
  const a = stops[i];
  const b = stops[Math.min(i + 1, stops.length - 1)];
  return [
    Math.round(a[0] + (b[0] - a[0]) * f),
    Math.round(a[1] + (b[1] - a[1]) * f),
    Math.round(a[2] + (b[2] - a[2]) * f),
  ];
};

export const filmColor = (thickness: number, alpha: number) => {
  const [r, g, bl] = filmRgb(thickness);
  return `rgba(${r},${g},${bl},${alpha})`;
};

/** 软色斑：径向渐变从色心平滑淡出 */
export const softBlob = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  rot: number,
  rgb: [number, number, number],
  peak: number,
) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(rx, ry);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  const [r, gr, b] = rgb;
  g.addColorStop(0, `rgba(${r},${gr},${b},${peak})`);
  g.addColorStop(0.22, `rgba(${r},${gr},${b},${peak * 0.62})`);
  g.addColorStop(0.48, `rgba(${r},${gr},${b},${peak * 0.28})`);
  g.addColorStop(0.72, `rgba(${r},${gr},${b},${peak * 0.08})`);
  g.addColorStop(1, `rgba(${r},${gr},${b},0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, TWO_PI);
  ctx.fill();
  ctx.restore();
};

/** 虹彩薄膜（局部坐标，调用方负责 clip / translate） */
export const drawSoapIridescence = (
  ctx: CanvasRenderingContext2D,
  b: Pick<Bubble, 'phase' | 'seed' | 'depth'>,
  R: number,
  lightTo: number,
  time: number,
  filmBias: number,
  peakScale = 1,
) => {
  const s = b.seed;
  ctx.globalCompositeOperation = 'lighter';
  const patches = 7 + Math.floor(hash01(s + 16.2) * 5);
  for (let i = 0; i < patches; i++) {
    const ang =
      b.phase * 0.7 +
      i * (0.55 + hash01(s + i * 3.1) * 0.35) +
      time * (0.14 + (i % 3) * 0.04) +
      s * 0.01;
    const thick =
      filmBias * 0.35 +
      0.12 +
      0.55 * (0.5 + 0.5 * Math.sin(s * 0.3 + i * 1.1 + time * 0.32)) +
      0.22 * Math.sin(ang * 1.4 + time * 0.2);
    const rgb = filmRgb(thick);
    const dist = R * (0.38 + hash01(s + i * 2.7) * 0.4);
    const px = Math.cos(ang) * dist;
    const py = Math.sin(ang) * dist * (0.85 + hash01(s + i) * 0.2);
    const size = R * (0.22 + hash01(s + i * 4.1) * 0.22);
    const peak =
      (0.2 + b.depth * 0.18) *
      (0.55 + hash01(s + i * 5.3) * 0.45) *
      lambertAtAngle(ang, lightTo) *
      peakScale;
    softBlob(ctx, px, py, size, size * (0.55 + hash01(s + i * 6) * 0.4), ang * 0.4, rgb, peak);
  }

  const rimBands = 6 + Math.floor(hash01(s + 17.5) * 4);
  for (let i = 0; i < rimBands; i++) {
    const mid = b.phase + (i / rimBands) * TWO_PI + time * (0.1 + hash01(s + 18) * 0.12) + filmBias;
    const thick = filmBias + 0.2 + 0.6 * (0.5 + 0.5 * Math.sin(i * 1.9 + s + time * 0.45));
    const rgb = filmRgb(thick);
    const cx = Math.cos(mid) * R * 0.82;
    const cy = Math.sin(mid) * R * 0.82;
    softBlob(
      ctx,
      cx,
      cy,
      R * (0.16 + hash01(s + i * 1.3) * 0.12),
      R * (0.1 + hash01(s + i * 2.1) * 0.1),
      mid + Math.PI / 2,
      rgb,
      (0.22 + b.depth * 0.16 + hash01(s + i) * 0.09) * lambertAtAngle(mid, lightTo) * peakScale,
    );
  }
  ctx.globalCompositeOperation = 'source-over';
};
