import {
  bindPrefersReducedMotion,
  bindVisibilityPause,
  observeElementSize,
  prefersReducedMotion,
  resolveCanvasBoxSize,
  applyCanvasHostBox,
} from '@cos-design/shared';
import type { MeteorRainController, MeteorRainOptions } from './types';

const P = 'cos-meteor-rain';
const DEFAULT_W = 800;
const DEFAULT_H = 500;

interface Meteor {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
}

export function createMeteorRain(
  container: HTMLElement,
  initial: MeteorRainOptions = {},
): MeteorRainController {
  let options: MeteorRainOptions = { fill: false, meteorCount: 8, ...initial };
  let destroyed = false;
  let width = options.width ?? DEFAULT_W;
  let height = options.height ?? DEFAULT_H;
  let frameId = 0;
  let paused = typeof document !== 'undefined' ? document.hidden : false;
  let reduced = prefersReducedMotion();
  let sizeCleanup: (() => void) | null = null;
  let unbindVisibility: (() => void) | null = null;
  let unbindMotion: (() => void) | null = null;
  const meteors: Meteor[] = [];

  const root = document.createElement('div');
  root.className = P;
  const canvas = document.createElement('canvas');
  canvas.className = `${P}__canvas`;
  root.appendChild(canvas);
  container.appendChild(root);

  const initMeteors = () => {
    meteors.length = 0;
    const count = options.meteorCount ?? 8;
    for (let i = 0; i < count; i++) {
      meteors.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.5,
        length: Math.random() * 60 + 40,
        speed: Math.random() * 6 + 4,
        opacity: Math.random() * 0.5 + 0.3,
      });
    }
  };

  const applyLayout = () => {
    applyCanvasHostBox(container, root, {
      fill: Boolean(options.fill),
      width: width,
      height: height,
    });
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
      initMeteors();
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
      initMeteors();
    });
  };

  const drawMeteors = (animate: boolean) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (animate) {
      ctx.fillStyle = 'rgb(15 23 42 / 15%)';
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);
    }
    for (const meteor of meteors) {
      if (animate) {
        meteor.x += meteor.speed;
        meteor.y += meteor.speed * 0.6;
        if (meteor.x > width + meteor.length || meteor.y > height + meteor.length) {
          meteor.x = -meteor.length;
          meteor.y = Math.random() * height * 0.4;
          meteor.length = Math.random() * 60 + 40;
          meteor.speed = Math.random() * 6 + 4;
          meteor.opacity = Math.random() * 0.5 + 0.3;
        }
      }
      const tailX = meteor.x - meteor.length;
      const tailY = meteor.y - meteor.length * 0.6;
      ctx.beginPath();
      ctx.strokeStyle = `rgb(255 255 255 / ${meteor.opacity})`;
      ctx.lineWidth = 2;
      ctx.moveTo(meteor.x, meteor.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();
      ctx.beginPath();
      ctx.fillStyle = `rgb(255 255 255 / ${Math.min(1, meteor.opacity + 0.2)})`;
      ctx.arc(meteor.x, meteor.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const tick = () => {
    if (destroyed) return;
    frameId = requestAnimationFrame(tick);
    if (paused || reduced) return;
    drawMeteors(true);
  };

  unbindVisibility = bindVisibilityPause((h) => {
    paused = h;
  });
  unbindMotion = bindPrefersReducedMotion((v) => {
    reduced = v;
    if (reduced) drawMeteors(false);
  });

  bindSize();
  initMeteors();
  if (reduced) drawMeteors(false);
  else tick();

  return {
    update(next) {
      const prev = options;
      options = { ...options, ...next };
      const sizeChanged =
        prev.fill !== options.fill ||
        prev.width !== options.width ||
        prev.height !== options.height;
      if (sizeChanged) bindSize();
      if (reduced) drawMeteors(false);
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
