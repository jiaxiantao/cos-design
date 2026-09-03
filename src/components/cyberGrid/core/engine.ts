import {
  bindPrefersReducedMotion,
  bindVisibilityPause,
  observeElementSize,
  prefersReducedMotion,
  resolveCanvasBoxSize,
  applyCanvasHostBox,
} from '@cos-design/shared';
import type { CyberGridController, CyberGridOptions } from './types';

const P = 'cos-cyber-grid';
const DEFAULT_W = 800;
const DEFAULT_H = 500;

export function createCyberGrid(
  container: HTMLElement,
  initial: CyberGridOptions = {},
): CyberGridController {
  let options: CyberGridOptions = { fill: false, color: '#00f0ff', speed: 1, ...initial };
  let destroyed = false;
  let width = options.width ?? DEFAULT_W;
  let height = options.height ?? DEFAULT_H;
  let frameId = 0;
  let offset = 0;
  let paused = typeof document !== 'undefined' ? document.hidden : false;
  let reduced = prefersReducedMotion();
  let sizeCleanup: (() => void) | null = null;
  let unbindVisibility: (() => void) | null = null;
  let unbindMotion: (() => void) | null = null;

  const root = document.createElement('div');
  root.className = P;
  const canvas = document.createElement('canvas');
  canvas.className = `${P}__canvas`;
  root.appendChild(canvas);
  container.appendChild(root);

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
    });
  };

  const paintGrid = (animate: boolean) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const color = options.color ?? '#00f0ff';
    const speed = options.speed ?? 1;
    const gridSpacing = 40;
    const horizonY = height * 0.45;

    if (animate) offset = (offset + speed * 1.5) % gridSpacing;

    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, width, height);

    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, '#0a0a20');
    skyGrad.addColorStop(1, '#050510');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, horizonY);

    const vanishX = width / 2;
    ctx.strokeStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.lineWidth = 1;

    const lineCount = 12;
    for (let i = -lineCount; i <= lineCount; i++) {
      const spread = (i / lineCount) * width * 1.2;
      ctx.beginPath();
      ctx.moveTo(vanishX + spread * 0.05, horizonY);
      ctx.lineTo(vanishX + spread, height);
      ctx.globalAlpha = 0.3 + (1 - Math.abs(i) / lineCount) * 0.5;
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    const rows = Math.ceil(height / gridSpacing) + 2;
    for (let row = 0; row < rows; row++) {
      const progress = (row * gridSpacing + offset) / (height - horizonY);
      const y = horizonY + ((progress * (height - horizonY)) % (height - horizonY));
      const perspective = (y - horizonY) / (height - horizonY);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.globalAlpha = perspective * 0.8;
      ctx.stroke();
    }

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    const glowGrad = ctx.createRadialGradient(vanishX, horizonY, 0, vanishX, horizonY, width * 0.4);
    glowGrad.addColorStop(0, `${color}33`);
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, width, height);
  };

  const tick = () => {
    if (destroyed) return;
    frameId = requestAnimationFrame(tick);
    if (paused || reduced) return;
    paintGrid(true);
  };

  unbindVisibility = bindVisibilityPause((h) => {
    paused = h;
  });
  unbindMotion = bindPrefersReducedMotion((v) => {
    reduced = v;
    if (reduced) paintGrid(false);
  });

  bindSize();
  if (reduced) paintGrid(false);
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
      if (reduced) paintGrid(false);
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
