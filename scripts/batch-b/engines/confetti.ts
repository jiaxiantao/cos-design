import {
  bindPrefersReducedMotion,
  bindVisibilityPause,
  observeElementSize,
  prefersReducedMotion,
  resolveCanvasBoxSize,
} from '@cos-design/shared';
import type { ConfettiController, ConfettiOptions } from './types';

const P = 'cos-confetti';
const COLORS = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#a66cff', '#ff85c0', '#38bdf8'];
const DEFAULT_W = 800;
const DEFAULT_H = 400;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  width: number;
  height: number;
  alpha: number;
  gravity: number;
}

const randomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

const createParticles = (width: number, height: number, count: number): Particle[] => {
  const originX = width / 2;
  const originY = height * 0.6;
  return Array.from({ length: count }, () => {
    const angle = (Math.random() - 0.5) * Math.PI;
    const speed = Math.random() * 12 + 6;
    return {
      x: originX + (Math.random() - 0.5) * 40,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - Math.random() * 8,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      color: randomColor(),
      width: Math.random() * 8 + 4,
      height: Math.random() * 6 + 3,
      alpha: 1,
      gravity: Math.random() * 0.15 + 0.12,
    };
  });
};

export function createConfetti(
  container: HTMLElement,
  initial: ConfettiOptions = {},
): ConfettiController {
  let options: ConfettiOptions = {
    fill: false,
    auto: true,
    particleCount: 120,
    hint: '点击画布再次喷射',
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
  const particles: Particle[] = [];
  let active = false;
  const onCompleteRef = { current: options.onComplete };

  const root = document.createElement('div');
  root.className = P;
  const canvas = document.createElement('canvas');
  canvas.className = `${P}__canvas`;
  const hintEl = document.createElement('p');
  hintEl.className = `${P}__hint`;
  root.appendChild(canvas);
  root.appendChild(hintEl);
  container.appendChild(root);

  const syncInteractive = () => {
    const auto = options.auto ?? true;
    const interactive = options.interactive ?? auto;
    canvas.classList.toggle(`${P}__canvas--interactive`, interactive);
    canvas.classList.toggle(`${P}__canvas--passthrough`, !interactive);
    canvas.style.touchAction = interactive ? 'none' : 'auto';
    const hint = options.hint ?? '点击画布再次喷射';
    if (interactive && hint) {
      hintEl.textContent = hint;
      hintEl.hidden = false;
    } else {
      hintEl.hidden = true;
    }
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
    syncInteractive();
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

  const burst = () => {
    const count = options.particleCount ?? 120;
    particles.push(...createParticles(width, height, reduced ? Math.min(24, count) : count));
    active = true;
  };

  const onPointerDown = () => {
    const auto = options.auto ?? true;
    const interactive = options.interactive ?? auto;
    if (interactive) burst();
  };

  canvas.addEventListener('pointerdown', onPointerDown);

  const tick = () => {
    if (destroyed) return;
    frameId = requestAnimationFrame(tick);
    if (paused) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    const fade = reduced ? 0.03 : 0.008;
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.99;
      p.rotation += p.rotationSpeed;
      p.alpha -= fade;
      if (p.alpha <= 0 || p.y > height + 20) {
        particles.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
      ctx.restore();
    }
    if (active && particles.length === 0) {
      active = false;
      onCompleteRef.current?.();
    }
  };

  unbindVisibility = bindVisibilityPause((h) => {
    paused = h;
  });
  unbindMotion = bindPrefersReducedMotion((v) => {
    reduced = v;
  });

  bindSize();
  if (options.auto ?? true) burst();
  tick();

  return {
    update(next) {
      options = { ...options, ...next };
      onCompleteRef.current = options.onComplete;
      bindSize();
    },
    burst,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancelAnimationFrame(frameId);
      unbindVisibility?.();
      unbindMotion?.();
      sizeCleanup?.();
      canvas.removeEventListener('pointerdown', onPointerDown);
      root.remove();
    },
  };
}
