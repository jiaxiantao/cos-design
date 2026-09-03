import { hash01 } from './utils';

const softGlow = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  colorStops: Array<[number, string]>,
) => {
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  for (const [t, c] of colorStops) g.addColorStop(t, c);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
};

const softShaft = (
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  angle: number,
  length: number,
  widthScale: number,
  alpha: number,
) => {
  ctx.save();
  ctx.translate(ox, oy);
  ctx.rotate(angle);
  ctx.scale(widthScale, 1);
  const g = ctx.createRadialGradient(0, 0, 0, 0, length * 0.15, length);
  g.addColorStop(0, `rgb(170 220 240 / ${alpha * 100}%)`);
  g.addColorStop(0.2, `rgb(90 170 200 / ${alpha * 45}%)`);
  g.addColorStop(0.55, `rgb(40 110 150 / ${alpha * 12}%)`);
  g.addColorStop(1, 'rgb(10 40 60 / 0%)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, length * 0.15, length, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

const drawMarineSnow = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  sprite: HTMLCanvasElement,
) => {
  const count = Math.min(70, Math.floor((width * height) / 22000));
  for (let i = 0; i < count; i++) {
    const a = hash01(i + 1);
    const b = hash01(i + 57);
    const c = hash01(i + 131);
    const size = 0.3 + c * 1.1;
    const fall = 5 + b * 16;
    const sway = Math.sin(time * (0.1 + a * 0.28) + i * 0.7) * (5 + b * 14);
    const x = ((a * width + time * (1.5 + c * 5) + sway) % (width + 24)) - 12;
    const y = ((b * height + time * fall * 0.22) % (height + 24)) - 12;
    const depth = Math.min(1, Math.max(0, y / height));
    const alpha = (0.02 + c * 0.07) * (0.35 + depth * 0.55);
    const drawSize = size * 4.4;
    ctx.globalAlpha = alpha;
    ctx.drawImage(sprite, x - drawSize * 0.5, y - drawSize * 0.5, drawSize, drawSize);
  }
  ctx.globalAlpha = 1;
};

export const drawStaticBackground = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  tint: string,
) => {
  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, '#0c4558');
  bg.addColorStop(0.08, '#0a3c50');
  bg.addColorStop(0.18, '#083445');
  bg.addColorStop(0.32, '#062a38');
  bg.addColorStop(0.48, '#041f2b');
  bg.addColorStop(0.64, '#03161f');
  bg.addColorStop(0.8, '#020e15');
  bg.addColorStop(0.92, '#01080c');
  bg.addColorStop(1, '#000406');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  const sunX = width * 0.55;
  const sunY = -height * 0.05;
  softGlow(ctx, sunX, sunY, height * 1.05, [
    [0, 'rgb(150 215 235 / 26%)'],
    [0.18, 'rgb(80 170 200 / 14%)'],
    [0.4, `${tint}12`],
    [0.65, 'rgb(30 90 120 / 4%)'],
    [1, 'rgb(5 20 30 / 0%)'],
  ]);

  softGlow(ctx, width * 0.18, height * 0.12, width * 0.7, [
    [0, 'rgb(70 150 175 / 8%)'],
    [0.45, 'rgb(30 90 120 / 3%)'],
    [1, 'rgb(10 30 45 / 0%)'],
  ]);
  softGlow(ctx, width * 0.88, height * 0.22, width * 0.55, [
    [0, 'rgb(50 120 150 / 6%)'],
    [0.5, 'rgb(20 70 100 / 2%)'],
    [1, 'rgb(5 20 30 / 0%)'],
  ]);

  for (let i = 0; i < 4; i++) {
    const a = hash01(i + 3);
    const b = hash01(i + 11);
    const cx = width * (0.2 + a * 0.6);
    const cy = height * (0.28 + b * 0.4);
    softGlow(ctx, cx, cy, height * (0.28 + b * 0.18), [
      [0, `rgb(25 70 95 / ${4 + a * 3}%)`],
      [0.5, `rgb(15 45 65 / ${2 + b * 2}%)`],
      [1, 'rgb(5 20 30 / 0%)'],
    ]);
  }

  const depthVeil = ctx.createLinearGradient(0, 0, 0, height);
  depthVeil.addColorStop(0, 'rgb(0 10 16 / 0%)');
  depthVeil.addColorStop(0.35, 'rgb(0 8 14 / 6%)');
  depthVeil.addColorStop(0.65, 'rgb(0 5 10 / 22%)');
  depthVeil.addColorStop(0.85, 'rgb(0 3 7 / 42%)');
  depthVeil.addColorStop(1, 'rgb(0 1 3 / 62%)');
  ctx.fillStyle = depthVeil;
  ctx.fillRect(0, 0, width, height);

  softGlow(ctx, width * 0.5, height * 1.05, height * 0.55, [
    [0, 'rgb(0 2 5 / 70%)'],
    [0.45, 'rgb(0 4 8 / 35%)'],
    [1, 'rgb(0 6 10 / 0%)'],
  ]);
  softGlow(ctx, width * 0.28, height * 1.02, width * 0.4, [
    [0, 'rgb(0 3 6 / 28%)'],
    [1, 'rgb(0 3 6 / 0%)'],
  ]);
  softGlow(ctx, width * 0.75, height * 1.04, width * 0.35, [
    [0, 'rgb(0 2 5 / 24%)'],
    [1, 'rgb(0 2 5 / 0%)'],
  ]);

  const vignette = ctx.createRadialGradient(
    width * 0.5,
    height * 0.4,
    Math.min(width, height) * 0.35,
    width * 0.5,
    height * 0.48,
    Math.max(width, height) * 0.78,
  );
  vignette.addColorStop(0, 'rgb(0 0 0 / 0%)');
  vignette.addColorStop(0.55, 'rgb(0 6 10 / 6%)');
  vignette.addColorStop(0.8, 'rgb(0 3 6 / 18%)');
  vignette.addColorStop(1, 'rgb(0 1 3 / 36%)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
};

export const drawDynamicBackground = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  snowSprite: HTMLCanvasElement,
  reduceMotion: boolean,
) => {
  const sunX = width * (0.55 + Math.sin(time * 0.07) * 0.03);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 5; i++) {
    const t = time * 0.11 + i * 1.35;
    const ox = width * (0.22 + i * 0.14) + Math.sin(t) * width * (reduceMotion ? 0.015 : 0.04);
    const angle = 0.12 + Math.sin(t * 0.6 + i) * (reduceMotion ? 0.02 : 0.05);
    const alpha = 0.045 + (i % 3) * 0.012 + Math.sin(time * 0.2 + i) * 0.008;
    softShaft(
      ctx,
      ox,
      -height * 0.02,
      angle,
      height * (0.7 + (i % 2) * 0.12),
      0.12 + (i % 3) * 0.04,
      alpha,
    );
  }
  softShaft(
    ctx,
    sunX + width * 0.02,
    -height * 0.04,
    0.08 + Math.sin(time * 0.09) * (reduceMotion ? 0.012 : 0.03),
    height * 0.78,
    0.2,
    0.07 + Math.sin(time * 0.15) * 0.012,
  );
  ctx.restore();
  drawMarineSnow(ctx, width, height, time, snowSprite);
};

export const createSnowSprite = () => {
  const size = 48;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgb(220 240 250 / 90%)');
  g.addColorStop(0.3, 'rgb(180 220 240 / 42%)');
  g.addColorStop(1, 'rgb(180 220 240 / 0%)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();

  return canvas;
};
