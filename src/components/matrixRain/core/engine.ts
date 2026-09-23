import {
  bindPrefersReducedMotion,
  bindVisibilityPause,
  observeElementSize,
  prefersReducedMotion,
  resolveCanvasBoxSize,
  applyCanvasHostBox,
} from '@cos-design/shared';
import type { MatrixRainController, MatrixRainOptions } from './types';

const P = 'cos-matrix-rain';
const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*アイウエオカキクケコ';
const DEFAULT_W = 800;
const DEFAULT_H = 500;

export function createMatrixRain(
  container: HTMLElement,
  initial: MatrixRainOptions = {},
): MatrixRainController {
  let options: MatrixRainOptions = {
    fill: false,
    density: 0.6,
    color: '#00ff41',
    showOverlay: true,
    title: 'MATRIX',
    subtitle: '数字雨效果',
    ...initial,
  };
  let destroyed = false;
  let width = options.width ?? DEFAULT_W;
  let height = options.height ?? DEFAULT_H;
  let frameId = 0;
  let paused = typeof document !== 'undefined' ? document.hidden : false;
  let reduced = prefersReducedMotion();
  let sizeCleanup: (() => void) | null = null;
  let unbindVisibility: (() => void) | null = null;
  let unbindMotion: (() => void) | null = null;
  const fontSize = 16;
  let columns = 0;
  let drops: number[] = [];

  const root = document.createElement('div');
  root.className = P;
  const canvas = document.createElement('canvas');
  canvas.className = `${P}__canvas`;
  const overlay = document.createElement('div');
  overlay.className = `${P}__overlay`;
  const titleEl = document.createElement('h2');
  titleEl.className = `${P}__title`;
  const subtitleEl = document.createElement('p');
  subtitleEl.className = `${P}__subtitle`;
  overlay.append(titleEl, subtitleEl);
  root.append(canvas, overlay);
  container.appendChild(root);

  const initDrops = () => {
    const density = options.density ?? 0.6;
    columns = Math.floor((width / fontSize) * density);
    drops = Array.from({ length: columns }, () => Math.random() * -50);
  };

  const syncOverlay = () => {
    const show = options.showOverlay ?? true;
    overlay.hidden = !show;
    if (show) {
      titleEl.textContent = options.title ?? 'MATRIX';
      subtitleEl.textContent = options.subtitle ?? '数字雨效果';
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
    syncOverlay();
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
      initDrops();
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
      initDrops();
    });
  };

  const paintFrame = (animate: boolean) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const color = options.color ?? '#00ff41';
    const density = options.density ?? 0.6;

    if (animate) {
      ctx.fillStyle = 'rgb(0 0 0 / 8%)';
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);
    }
    ctx.font = `${fontSize}px monospace`;

    drops.forEach((y, i) => {
      const char = CHARSET[Math.floor(Math.random() * CHARSET.length)];
      const x = (i / density) * fontSize;
      ctx.fillStyle = color;
      ctx.fillText(char, x, y * fontSize);
      if (animate) {
        if (y * fontSize > height && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 1;
      }
    });
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
    if (reduced) {
      for (let i = 0; i < drops.length; i++) drops[i] = Math.random() * (height / fontSize);
      paintFrame(false);
    }
  });

  bindSize();
  initDrops();
  if (reduced) {
    for (let i = 0; i < drops.length; i++) drops[i] = Math.random() * (height / fontSize);
    paintFrame(false);
  } else tick();

  return {
    update(next) {
      const prev = options;
      options = { ...options, ...next };
      const sizeChanged =
        prev.fill !== options.fill ||
        prev.width !== options.width ||
        prev.height !== options.height;
      if (sizeChanged) bindSize();
      syncOverlay();
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
    },
  };
}
