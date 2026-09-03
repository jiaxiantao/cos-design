import { bindVisibilityPause } from '@cos-design/shared';
import type { CanvasClockController, CanvasClockOptions } from './types';

const P = 'cos-canvas-clock';

export function createCanvasClock(
  container: HTMLElement,
  initial: CanvasClockOptions = {},
): CanvasClockController {
  let options: CanvasClockOptions = { width: 400, height: 400, ...initial };
  let destroyed = false;
  let frameId = 0;
  let paused = typeof document !== 'undefined' ? document.hidden : false;
  let unbindVisibility: (() => void) | null = null;

  const root = document.createElement('div');
  root.className = P;
  const canvas = document.createElement('canvas');
  canvas.className = `${P}__canvas`;
  root.appendChild(canvas);
  container.appendChild(root);

  const getSize = () => Math.min(options.width ?? 400, options.height ?? 400);

  const applyLayout = () => {
    const size = getSize();
    root.style.width = `${size}px`;
    root.style.height = `${size}px`;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
  };

  const syncCanvas = () => {
    const size = getSize();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  };

  const drawClock = (ctx: CanvasRenderingContext2D) => {
    const size = getSize();
    const radius = size / 2 - 16;
    const center = size / 2;

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(center, center);

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 2;
    ctx.stroke();

    for (let i = 0; i < 60; i++) {
      const angle = (i / 60) * Math.PI * 2;
      const inner = radius - (i % 5 === 0 ? 14 : 8);
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
      ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
      ctx.strokeStyle = i % 5 === 0 ? '#374151' : '#9ca3af';
      ctx.lineWidth = i % 5 === 0 ? 2 : 1;
      ctx.stroke();
    }

    ctx.fillStyle = '#111827';
    ctx.font = `bold ${Math.floor(size / 22)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 1; i <= 12; i++) {
      const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
      const textRadius = radius - 32;
      ctx.fillText(String(i), Math.cos(angle) * textRadius, Math.sin(angle) * textRadius);
    }

    const now = new Date();
    const hour = now.getHours() % 12;
    const min = now.getMinutes();
    const sec = now.getSeconds();
    const ms = now.getMilliseconds();

    const drawHand = (angle: number, length: number, lw: number, color: string, shadow: string) => {
      ctx.save();
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, lw);
      ctx.lineTo(length, 0);
      ctx.lineTo(0, -lw);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.shadowColor = shadow;
      ctx.shadowBlur = 4;
      ctx.fill();
      ctx.restore();
    };

    const hourAngle = ((hour + min / 60) / 12) * Math.PI * 2 - Math.PI / 2;
    const minAngle = ((min + sec / 60) / 60) * Math.PI * 2 - Math.PI / 2;
    const secAngle = ((sec + ms / 1000) / 60) * Math.PI * 2 - Math.PI / 2;

    drawHand(hourAngle, radius * 0.5, 4, '#111827', 'rgb(0 0 0 / 40%)');
    drawHand(minAngle, radius * 0.72, 3, '#1e80ff', 'rgb(30 128 255 / 40%)');
    drawHand(secAngle, radius * 0.85, 2, '#e9686b', 'rgb(233 104 107 / 40%)');

    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#111827';
    ctx.fill();
    ctx.restore();
  };

  const tick = () => {
    if (destroyed) return;
    frameId = requestAnimationFrame(tick);
    if (!paused) {
      const ctx = canvas.getContext('2d');
      if (ctx) drawClock(ctx);
    }
  };

  applyLayout();
  syncCanvas();
  unbindVisibility = bindVisibilityPause((hidden) => {
    paused = hidden;
  });
  tick();

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
