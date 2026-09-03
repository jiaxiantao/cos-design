import {
  bindPrefersReducedMotion,
  bindVisibilityPause,
  getRelativePointerPosition,
  observeElementSize,
  prefersReducedMotion,
  resolveCanvasBoxSize,
  applyCanvasHostBox,
} from '@cos-design/shared';
import type { FireworksController, FireworksOptions } from './types';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  decay: number;
}

interface Rocket {
  x: number;
  y: number;
  vy: number;
  targetY: number;
  color: string;
  exploded: boolean;
  particles: Particle[];
  age: number;
}

const COLORS = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#a66cff', '#ff85c0'];
const GRAVITY = 0.12;
const MAX_ROCKET_AGE = 240;
const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 500;

const randomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

const createExplosion = (x: number, y: number, color: string): Particle[] => {
  const count = 60 + Math.floor(Math.random() * 30);
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 4 + 2;
    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      alpha: 1,
      color: Math.random() > 0.3 ? color : randomColor(),
      decay: Math.random() * 0.015 + 0.01,
    };
  });
};

export function createFireworks(
  container: HTMLElement,
  initialOptions: FireworksOptions = {},
): FireworksController {
  let options: FireworksOptions = { auto: true, ...initialOptions };
  let destroyed = false;

  const root = document.createElement('div');
  root.className = 'cos-fireworks';
  const canvas = document.createElement('canvas');
  canvas.className = 'cos-fireworks__canvas';
  const hintEl = document.createElement('p');
  hintEl.className = 'cos-fireworks__hint';
  root.appendChild(canvas);
  root.appendChild(hintEl);
  container.appendChild(root);

  const rockets: Rocket[] = [];
  let frameId = 0;
  let timer = 0;
  let active = false;
  let paused = typeof document !== 'undefined' ? document.hidden : false;
  let reduced = prefersReducedMotion();
  let width = options.width ?? DEFAULT_WIDTH;
  let height = options.height ?? DEFAULT_HEIGHT;
  let sizeObserverCleanup: (() => void) | null = null;
  let unbindVisibility: (() => void) | null = null;
  let unbindMotion: (() => void) | null = null;

  const onCompleteRef = { current: options.onComplete };

  const launch = (x?: number) => {
    const startX = x ?? Math.random() * width * 0.6 + width * 0.2;
    rockets.push({
      x: startX,
      y: height,
      vy: -(Math.random() * 4 + 6),
      targetY: Math.random() * height * 0.35 + height * 0.15,
      color: randomColor(),
      exploded: false,
      particles: [],
      age: 0,
    });
    active = true;
  };

  const applyHostLayout = () => {
    const fill = options.fill ?? false;
    applyCanvasHostBox(container, root, { fill: Boolean(fill), width: width, height: height });
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  };

  const syncCanvasSize = () => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const syncInteractive = () => {
    const auto = options.auto ?? true;
    const interactive = options.interactive ?? auto;
    canvas.classList.toggle('cos-fireworks__canvas--interactive', interactive);
    canvas.classList.toggle('cos-fireworks__canvas--passthrough', !interactive);
    canvas.style.touchAction = interactive ? 'none' : 'auto';

    const hint = options.hint ?? '点击画布燃放烟花';
    if (interactive && hint) {
      hintEl.textContent = hint;
      hintEl.hidden = false;
    } else {
      hintEl.hidden = true;
    }
  };

  const clearAutoTimer = () => {
    if (timer) {
      clearInterval(timer);
      timer = 0;
    }
  };

  const setupAutoTimer = () => {
    clearAutoTimer();
    const auto = options.auto ?? true;
    if (!auto || destroyed) return;
    if (reduced) {
      launch();
      return;
    }
    timer = window.setInterval(() => launch(), 1200);
  };

  const tick = () => {
    if (destroyed) return;
    frameId = requestAnimationFrame(tick);
    if (paused) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'rgb(15 23 42 / 25%)';
    ctx.fillRect(0, 0, width, height);

    if (reduced) {
      if (active && rockets.length === 0) {
        active = false;
        onCompleteRef.current?.();
      }
      return;
    }

    for (let i = rockets.length - 1; i >= 0; i -= 1) {
      const rocket = rockets[i];
      if (!rocket.exploded) {
        rocket.age += 1;
        rocket.y += rocket.vy;
        rocket.vy += GRAVITY;
        ctx.beginPath();
        ctx.arc(rocket.x, rocket.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = rocket.color;
        ctx.fill();

        const atApex = rocket.vy >= 0;
        const reachedTarget = rocket.y <= rocket.targetY;
        const outOfBounds = rocket.y < 0;
        const timedOut = rocket.age >= MAX_ROCKET_AGE;

        if (atApex || reachedTarget || outOfBounds || timedOut) {
          rocket.exploded = true;
          rocket.particles = createExplosion(rocket.x, rocket.y, rocket.color);
        }
        continue;
      }

      rocket.particles = rocket.particles.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06;
        p.alpha -= p.decay;
        if (p.alpha <= 0) return false;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
        return true;
      });

      if (rocket.particles.length === 0) {
        rockets.splice(i, 1);
      }
    }

    if (active && rockets.length === 0) {
      active = false;
      onCompleteRef.current?.();
    }
  };

  const bindSizeObserver = () => {
    sizeObserverCleanup?.();
    sizeObserverCleanup = null;

    const fill = options.fill ?? false;
    if (!fill) {
      width = options.width ?? DEFAULT_WIDTH;
      height = options.height ?? DEFAULT_HEIGHT;
      applyHostLayout();
      syncCanvasSize();
      return;
    }

    sizeObserverCleanup = observeElementSize(container, (measured) => {
      const box = resolveCanvasBoxSize({
        fill: true,
        width: options.width,
        height: options.height,
        defaultWidth: DEFAULT_WIDTH,
        defaultHeight: DEFAULT_HEIGHT,
        measured,
      });
      width = box.width;
      height = box.height;
      applyHostLayout();
      syncCanvasSize();
    });
  };

  const onPointerDown = (event: PointerEvent) => {
    const auto = options.auto ?? true;
    const interactive = options.interactive ?? auto;
    if (!interactive) return;
    const pos = getRelativePointerPosition(canvas, event);
    if (pos) launch(pos.x);
  };

  canvas.addEventListener('pointerdown', onPointerDown);

  unbindVisibility = bindVisibilityPause((hidden) => {
    paused = hidden;
  });
  unbindMotion = bindPrefersReducedMotion((value) => {
    reduced = value;
    setupAutoTimer();
  });

  const update = (next: Partial<FireworksOptions>) => {
    const prev = options;
    options = { ...options, ...next };
    if (next.onComplete !== undefined) {
      onCompleteRef.current = next.onComplete;
    }
    const sizeChanged =
      prev.fill !== options.fill || prev.width !== options.width || prev.height !== options.height;
    const lookChanged =
      prev.auto !== options.auto ||
      prev.interactive !== options.interactive ||
      prev.hint !== options.hint;
    if (sizeChanged) bindSizeObserver();
    if (lookChanged) {
      syncInteractive();
      setupAutoTimer();
    }
  };

  bindSizeObserver();
  syncInteractive();
  setupAutoTimer();
  tick();

  return {
    update,
    launch,
    destroy: () => {
      if (destroyed) return;
      destroyed = true;
      cancelAnimationFrame(frameId);
      clearAutoTimer();
      canvas.removeEventListener('pointerdown', onPointerDown);
      unbindVisibility?.();
      unbindMotion?.();
      sizeObserverCleanup?.();
      root.remove();
    },
  };
}
