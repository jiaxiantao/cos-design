import {
  bindPrefersReducedMotion,
  bindVisibilityPause,
  observeElementSize,
  prefersReducedMotion,
  resolveCanvasBoxSize,
} from '@cos-design/shared';
import type { ParticleNetworkController, ParticleNetworkOptions } from './types';

const P = 'cos-particle-network';
const DEFAULT_W = 800;
const DEFAULT_H = 500;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export function createParticleNetwork(
  container: HTMLElement,
  initial: ParticleNetworkOptions = {},
): ParticleNetworkController {
  let options: ParticleNetworkOptions = {
    fill: false,
    particleCount: 60,
    linkDistance: 120,
    repelRadius: 150,
    color: '#38bdf8',
    hint: '移动鼠标或手指与粒子互动',
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
  const mouse = { x: -1000, y: -1000 };

  const root = document.createElement('div');
  root.className = P;
  const canvas = document.createElement('canvas');
  canvas.className = `${P}__canvas`;
  const hintEl = document.createElement('p');
  hintEl.className = `${P}__hint`;
  root.append(canvas, hintEl);
  container.appendChild(root);

  const initParticles = () => {
    particles.length = 0;
    const count = options.particleCount ?? 60;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        radius: Math.random() * 2 + 1,
      });
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

  const bindSize = () => {
    sizeCleanup?.();
    sizeCleanup = null;
    if (!(options.fill ?? false)) {
      width = options.width ?? DEFAULT_W;
      height = options.height ?? DEFAULT_H;
      applyLayout();
      syncCanvas();
      initParticles();
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
      initParticles();
    });
  };

  const updatePointer = (clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = clientX - rect.left;
    mouse.y = clientY - rect.top;
  };

  const resetPointer = () => {
    mouse.x = -1000;
    mouse.y = -1000;
  };

  const onMouseMove = (e: MouseEvent) => updatePointer(e.clientX, e.clientY);
  const onTouchMove = (e: TouchEvent) => {
    const t = e.touches[0];
    if (t) updatePointer(t.clientX, t.clientY);
  };

  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseleave', resetPointer);
  canvas.addEventListener('touchmove', onTouchMove, { passive: true });
  canvas.addEventListener('touchend', resetPointer);

  const paintFrame = (animate: boolean) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const color = options.color ?? '#38bdf8';
    const linkDistance = options.linkDistance ?? 120;
    const repelRadius = options.repelRadius ?? 150;
    const repelRadiusSq = repelRadius * repelRadius;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    if (animate) {
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < repelRadiusSq && distSq > 0) {
          const dist = Math.sqrt(distSq);
          p.vx -= (dx / dist) * 0.15;
          p.vy -= (dy / dist) * 0.15;
        }
      }
    }

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distSq = dx * dx + dy * dy;
        if (distSq < linkDistance * linkDistance) {
          const dist = Math.sqrt(distSq);
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = color;
          ctx.globalAlpha = 1 - dist / linkDistance;
          ctx.lineWidth = 0.8;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }

    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
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
  initParticles();
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
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', resetPointer);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', resetPointer);
      root.remove();
    },
  };
}
