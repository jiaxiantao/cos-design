import {
  bindPrefersReducedMotion,
  bindVisibilityPause,
  observeElementSize,
  prefersReducedMotion,
  resolveCanvasBoxSize,
} from '@cos-design/shared';
import type { StarfieldController, StarfieldOptions } from './types';

interface Star {
  x: number;
  y: number;
  z: number;
}

const P = 'cos-starfield';
const DEFAULT_W = 800;
const DEFAULT_H = 500;

export function createStarfield(
  container: HTMLElement,
  initial: StarfieldOptions = {},
): StarfieldController {
  let options: StarfieldOptions = { starCount: 400, speed: 1, ...initial };
  let destroyed = false;
  let width = options.width ?? DEFAULT_W;
  let height = options.height ?? DEFAULT_H;
  let sizeCleanup: (() => void) | null = null;
  let unbindVisibility: (() => void) | null = null;
  let unbindMotion: (() => void) | null = null;
  let frameId = 0;
  let paused = typeof document !== 'undefined' ? document.hidden : false;
  let reduced = prefersReducedMotion();
  const stars: Star[] = [];

  const root = document.createElement('div');
  root.className = P;
  const canvas = document.createElement('canvas');
  canvas.className = `${P}__canvas`;
  root.appendChild(canvas);
  container.appendChild(root);

  const initStars = () => {
    stars.length = 0;
    const count = options.starCount ?? 400;
    for (let i = 0; i < count; i++) {
      stars.push({
        x: (Math.random() - 0.5) * width,
        y: (Math.random() - 0.5) * height,
        z: Math.random() * width,
      });
    }
  };

  const applyLayout = () => {
    const fill = options.fill ?? false;
    if (fill) {
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
      initStars();
      return;
    }
    sizeCleanup = observeElementSize(container, (measured) => {
      const box = resolveCanvasBoxSize({
        fill: true,
        width: options.width,
        height: options.height,
        defaultWidth: DEFAULT_W,
        defaultHeight: DEFAULT_H,
        measured,
      });
      width = box.width;
      height = box.height;
      applyLayout();
      syncCanvas();
      initStars();
    });
  };

  const drawStars = (ctx: CanvasRenderingContext2D, animateZ: boolean) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const speed = options.speed ?? 1;
    ctx.fillStyle = 'rgb(0 0 0 / 25%)';
    ctx.fillRect(0, 0, width, height);
    for (const star of stars) {
      if (animateZ) {
        star.z -= speed * 2;
        if (star.z <= 0) {
          star.x = (Math.random() - 0.5) * width;
          star.y = (Math.random() - 0.5) * height;
          star.z = width;
        }
      }
      const k = 128 / star.z;
      const px = star.x * k + centerX;
      const py = star.y * k + centerY;
      if (px < 0 || px >= width || py < 0 || py >= height) continue;
      const size = (1 - star.z / width) * 3;
      const brightness = (1 - star.z / width) * 255;
      if (animateZ && size > 0.5) {
        const prevK = 128 / (star.z + speed * 4);
        const prevPx = star.x * prevK + centerX;
        const prevPy = star.y * prevK + centerY;
        ctx.beginPath();
        ctx.strokeStyle = `rgb(${brightness} ${brightness} ${brightness + 30})`;
        ctx.lineWidth = size;
        ctx.moveTo(prevPx, prevPy);
        ctx.lineTo(px, py);
        ctx.stroke();
      } else {
        ctx.fillStyle = `rgb(${brightness} ${brightness} ${brightness + 30})`;
        ctx.fillRect(px, py, Math.max(size, 0.5), Math.max(size, 0.5));
      }
    }
  };

  const tick = () => {
    if (destroyed) return;
    frameId = requestAnimationFrame(tick);
    if (paused) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (reduced) return;
    drawStars(ctx, true);
  };

  const paintStatic = () => {
    const ctx = syncCanvas();
    if (!ctx) return;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    drawStars(ctx, false);
  };

  unbindVisibility = bindVisibilityPause((hidden) => {
    paused = hidden;
  });
  unbindMotion = bindPrefersReducedMotion((value) => {
    reduced = value;
    if (reduced) paintStatic();
    else tick();
  });

  bindSize();
  initStars();
  if (reduced) paintStatic();
  else tick();

  return {
    update(next) {
      options = { ...options, ...next };
      bindSize();
      if (reduced) paintStatic();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancelAnimationFrame(frameId);
      unbindVisibility?.();
      unbindMotion?.();
      sizeCleanup?.();
      root.remove();
    },
  };
}
