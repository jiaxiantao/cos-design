import { bindVisibilityPause } from '@cos-design/shared';
import type { RadarScanController, RadarScanOptions } from './types';

const P = 'cos-radar-scan';

interface Blip {
  angle: number;
  dist: number;
  alpha: number;
}

export function createRadarScan(
  container: HTMLElement,
  initial: RadarScanOptions = {},
): RadarScanController {
  let options: RadarScanOptions = { size: 300, color: '#22d3ee', blipCount: 5, ...initial };
  let destroyed = false;
  let size = options.size ?? 300;
  let frameId = 0;
  let angle = 0;
  let paused = typeof document !== 'undefined' ? document.hidden : false;
  let unbindVisibility: (() => void) | null = null;
  const blips: Blip[] = [];

  const root = document.createElement('div');
  root.className = P;
  const canvas = document.createElement('canvas');
  canvas.className = `${P}__canvas`;
  root.appendChild(canvas);
  container.appendChild(root);

  const initBlips = () => {
    blips.length = 0;
    const count = options.blipCount ?? 5;
    for (let i = 0; i < count; i++) {
      blips.push({
        angle: Math.random() * Math.PI * 2,
        dist: Math.random() * 0.7 + 0.15,
        alpha: Math.random() * 0.5 + 0.5,
      });
    }
  };

  const applyLayout = () => {
    size = options.size ?? 300;
    root.style.width = `${size}px`;
    root.style.height = `${size}px`;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
  };

  const syncCanvas = () => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  };

  const tick = () => {
    if (destroyed) return;
    frameId = requestAnimationFrame(tick);
    if (paused) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const color = options.color ?? '#22d3ee';
    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 10;

    angle += 0.03;
    ctx.fillStyle = 'rgb(15 23 42 / 25%)';
    ctx.fillRect(0, 0, size, size);

    for (let i = 1; i <= 4; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, (radius / 4) * i, 0, Math.PI * 2);
      ctx.strokeStyle = `${color}33`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.moveTo(cx, cy - radius);
    ctx.lineTo(cx, cy + radius);
    ctx.moveTo(cx - radius, cy);
    ctx.lineTo(cx + radius, cy);
    ctx.strokeStyle = `${color}44`;
    ctx.stroke();

    const sweepAngle = angle;
    const gradient = ctx.createConicGradient(sweepAngle - 0.5, cx, cy);
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(0.15, `${color}66`);
    gradient.addColorStop(0.3, 'transparent');
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, sweepAngle - 0.5, sweepAngle);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(sweepAngle) * radius, cy + Math.sin(sweepAngle) * radius);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    for (const blip of blips) {
      const bx = cx + Math.cos(blip.angle) * radius * blip.dist;
      const by = cy + Math.sin(blip.angle) * radius * blip.dist;
      const diff = Math.abs(((sweepAngle - blip.angle + Math.PI) % (Math.PI * 2)) - Math.PI);
      if (diff < 0.3) blip.alpha = Math.min(1, blip.alpha + 0.05);
      else blip.alpha = Math.max(0.2, blip.alpha - 0.01);
      ctx.beginPath();
      ctx.arc(bx, by, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = blip.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  applyLayout();
  syncCanvas();
  initBlips();
  unbindVisibility = bindVisibilityPause((h) => {
    paused = h;
  });
  tick();

  return {
    update(next) {
      options = { ...options, ...next };
      applyLayout();
      syncCanvas();
      initBlips();
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
