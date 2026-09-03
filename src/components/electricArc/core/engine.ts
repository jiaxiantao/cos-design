import { bindVisibilityPause } from '@cos-design/shared';
import type { ElectricArcController, ElectricArcOptions } from './types';

const P = 'cos-electric-arc';
const DEFAULT_W = 320;
const DEFAULT_H = 160;

const displace = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  roughness: number,
  depth: number,
): [number, number][] => {
  if (depth <= 0)
    return [
      [x1, y1],
      [x2, y2],
    ];
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const offset = (Math.random() - 0.5) * roughness;
  const nx = (-dy / len) * offset;
  const ny = (dx / len) * offset;
  const left = displace(x1, y1, mx + nx, my + ny, roughness * 0.6, depth - 1);
  const right = displace(mx + nx, my + ny, x2, y2, roughness * 0.6, depth - 1);
  return [...left.slice(0, -1), ...right];
};

export function createElectricArc(
  container: HTMLElement,
  initial: ElectricArcOptions = {},
): ElectricArcController {
  let options: ElectricArcOptions = { color: '#67e8f9', ...initial };
  let destroyed = false;
  let width = options.width ?? DEFAULT_W;
  let height = options.height ?? DEFAULT_H;
  let frameId = 0;
  let paused = typeof document !== 'undefined' ? document.hidden : false;
  let unbindVisibility: (() => void) | null = null;

  const root = document.createElement('div');
  root.className = P;
  const canvas = document.createElement('canvas');
  canvas.className = `${P}__canvas`;
  root.appendChild(canvas);
  container.appendChild(root);

  const applyLayout = () => {
    width = options.width ?? DEFAULT_W;
    height = options.height ?? DEFAULT_H;
    root.style.width = `${width}px`;
    root.style.height = `${height}px`;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  };

  const syncCanvas = () => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  };

  const draw = () => {
    if (destroyed) return;
    frameId = requestAnimationFrame(draw);
    if (paused) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const color = options.color ?? '#67e8f9';
    const x1 = 40;
    const y1 = height / 2;
    const x2 = width - 40;
    const y2 = height / 2;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    const points = displace(x1, y1, x2, y2, 40, 5);

    ctx.beginPath();
    points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.beginPath();
    points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 0.8;
    ctx.globalAlpha = 0.6;
    ctx.stroke();
    ctx.globalAlpha = 1;

    for (const [x, y] of [
      [x1, y1],
      [x2, y2],
    ]) {
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
  };

  applyLayout();
  syncCanvas();
  unbindVisibility = bindVisibilityPause((hidden) => {
    paused = hidden;
  });
  draw();

  return {
    update(next) {
      options = { ...options, ...next };
      applyLayout();
      syncCanvas();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancelAnimationFrame(frameId);
      unbindVisibility?.();
      root.remove();
    },
  };
}
