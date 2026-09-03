import { bindVisibilityPause } from '@cos-design/shared';
import type { CursorTrailController, CursorTrailOptions } from './types';

const P = 'cos-cursor-trail';

interface TrailPoint {
  x: number;
  y: number;
  life: number;
}

export function createCursorTrail(
  container: HTMLElement,
  initial: CursorTrailOptions = {},
): CursorTrailController {
  let options: CursorTrailOptions = {
    color: '#38bdf8',
    length: 20,
    width: 800,
    height: 400,
    hint: '移动鼠标查看粒子轨迹',
    ...initial,
  };
  let destroyed = false;
  let width = options.width ?? 800;
  let height = options.height ?? 400;
  let frameId = 0;
  let paused = typeof document !== 'undefined' ? document.hidden : false;
  let unbindVisibility: (() => void) | null = null;
  const trail: TrailPoint[] = [];
  const mouse = { x: width / 2, y: height / 2 };

  const root = document.createElement('div');
  root.className = P;
  const canvas = document.createElement('canvas');
  canvas.className = `${P}__canvas`;
  const hintEl = document.createElement('p');
  hintEl.className = `${P}__hint`;
  root.appendChild(canvas);
  root.appendChild(hintEl);
  container.appendChild(root);

  const applyLayout = () => {
    width = options.width ?? 800;
    height = options.height ?? 400;
    root.style.width = `${width}px`;
    root.style.height = `${height}px`;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    hintEl.textContent = options.hint ?? '';
  };

  const syncCanvas = () => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  };

  const onMove = (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  };

  canvas.addEventListener('mousemove', onMove);

  const tick = () => {
    if (destroyed) return;
    frameId = requestAnimationFrame(tick);
    if (paused) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const color = options.color ?? '#38bdf8';
    const length = options.length ?? 20;
    trail.unshift({ x: mouse.x, y: mouse.y, life: 1 });
    if (trail.length > length) trail.length = length;
    ctx.fillStyle = 'rgb(15 23 42 / 15%)';
    ctx.fillRect(0, 0, width, height);
    for (let i = 0; i < trail.length; i++) {
      const alpha = 1 - i / trail.length;
      const size = (1 - i / trail.length) * 8 + 2;
      ctx.beginPath();
      ctx.arc(trail[i].x, trail[i].y, size, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = alpha * 0.8;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  applyLayout();
  syncCanvas();
  unbindVisibility = bindVisibilityPause((h) => {
    paused = h;
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
      canvas.removeEventListener('mousemove', onMove);
      root.remove();
    },
  };
}
