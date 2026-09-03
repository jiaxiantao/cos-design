import {
  bindPrefersReducedMotion,
  bindVisibilityPause,
  observeElementSize,
  prefersReducedMotion,
  resolveCanvasBoxSize
} from '@cos-design/shared';
import type { SnowfallController, SnowfallOptions } from './types';

const P = 'cos-snowfall';
const DEFAULT_W = 800;
const DEFAULT_H = 500;

interface Flake {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

export function createSnowfall(container: HTMLElement, initial: SnowfallOptions = {}): SnowfallController {
  let options: SnowfallOptions = { fill: false, mode: 'snow', count: 120, ...initial };
  let destroyed = false;
  let width = options.width ?? DEFAULT_W;
  let height = options.height ?? DEFAULT_H;
  let frameId = 0;
  let paused = typeof document !== 'undefined' ? document.hidden : false;
  let reduced = prefersReducedMotion();
  let sizeCleanup: (() => void) | null = null;
  let unbindVisibility: (() => void) | null = null;
  let unbindMotion: (() => void) | null = null;
  const flakes: Flake[] = [];

  const root = document.createElement('div');
  root.className = P;
  const canvas = document.createElement('canvas');
  canvas.className = `${P}__canvas`;
  root.appendChild(canvas);
  container.appendChild(root);

  const createFlake = (y?: number): Flake => {
    const mode = options.mode ?? 'snow';
    return {
      x: Math.random() * width,
      y: y ?? Math.random() * height,
      size: mode === 'sakura' ? Math.random() * 6 + 4 : Math.random() * 3 + 1,
      speed: Math.random() * 1.5 + 0.5,
      drift: (Math.random() - 0.5) * 0.8,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.04,
      opacity: Math.random() * 0.6 + 0.4
    };
  };

  const initFlakes = () => {
    flakes.length = 0;
    const count = options.count ?? 120;
    for (let i = 0; i < count; i++) flakes.push(createFlake());
  };

  const applyLayout = () => {
    if (options.fill) {
      root.style.width = '100%';
      root.style.height = '100%';
    } else {
      root.style.width = `${width}px`;
      root.style.height = `${height}px`;
    }
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

  const bindSize = () => {
    sizeCleanup?.();
    sizeCleanup = null;
    if (!(options.fill ?? false)) {
      width = options.width ?? DEFAULT_W;
      height = options.height ?? DEFAULT_H;
      applyLayout();
      syncCanvas();
      initFlakes();
      return;
    }
    sizeCleanup = observeElementSize(container, (measured) => {
      const box = resolveCanvasBoxSize({
        fill: true,
        width: options.width,
        height: options.height,
        defaultWidth: DEFAULT_W,
        defaultHeight: DEFAULT_H,
        measured
      });
      width = box.width;
      height = box.height;
      applyLayout();
      syncCanvas();
      initFlakes();
    });
  };

  const drawSnowflake = (ctx: CanvasRenderingContext2D, flake: Flake) => {
    ctx.globalAlpha = flake.opacity;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawPetal = (ctx: CanvasRenderingContext2D, flake: Flake) => {
    ctx.save();
    ctx.translate(flake.x, flake.y);
    ctx.rotate(flake.rotation);
    ctx.globalAlpha = flake.opacity;
    const s = flake.size;
    ctx.fillStyle = '#ffb7c5';
    ctx.beginPath();
    ctx.ellipse(0, 0, s, s * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff8fa3';
    ctx.beginPath();
    ctx.ellipse(s * 0.3, 0, s * 0.5, s * 0.35, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const paintFrame = (animate: boolean) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const mode = options.mode ?? 'snow';
    ctx.fillStyle = mode === 'sakura' ? '#1a1020' : '#0f172a';
    ctx.fillRect(0, 0, width, height);
    for (const flake of flakes) {
      if (animate) {
        flake.y += flake.speed;
        flake.x += flake.drift + Math.sin(flake.y * 0.02) * 0.3;
        flake.rotation += flake.rotationSpeed;
        if (flake.y > height + 10) Object.assign(flake, createFlake(-10));
      }
      if (mode === 'sakura') drawPetal(ctx, flake);
      else drawSnowflake(ctx, flake);
    }
    ctx.globalAlpha = 1;
  };

  const tick = () => {
    if (destroyed) return;
    frameId = requestAnimationFrame(tick);
    if (paused || reduced) return;
    paintFrame(true);
  };

  unbindVisibility = bindVisibilityPause((h) => {
    paused = h;
  });
  unbindMotion = bindPrefersReducedMotion((v) => {
    reduced = v;
    if (reduced) paintFrame(false);
    else tick();
  });

  bindSize();
  initFlakes();
  if (reduced) paintFrame(false);
  else tick();

  return {
    update(next) {
      options = { ...options, ...next };
      bindSize();
      if (reduced) paintFrame(false);
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancelAnimationFrame(frameId);
      unbindVisibility?.();
      unbindMotion?.();
      sizeCleanup?.();
      root.remove();
    }
  };
}
