import { bindVisibilityPause, clamp } from '@cos-design/shared';
import type { MetaballPoolController, MetaballPoolOptions } from './types';

const P = 'cos-metaball-pool';

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

export function createMetaballPool(container: HTMLElement, initial: MetaballPoolOptions = {}): MetaballPoolController {
  let options: MetaballPoolOptions = { width: 400, height: 300, ballCount: 5, color: '#38bdf8', ...initial };
  let destroyed = false;
  let frameId = 0;
  let paused = typeof document !== 'undefined' ? document.hidden : false;
  let unbindVisibility: (() => void) | null = null;
  let balls: Ball[] = [];
  const pointer = { x: -999, y: -999, active: false };

  const root = document.createElement('div');
  root.className = P;
  const canvas = document.createElement('canvas');
  canvas.className = `${P}__canvas`;
  root.appendChild(canvas);
  container.appendChild(root);

  const spawnBalls = () => {
    const width = options.width ?? 400;
    const height = options.height ?? 300;
    const count = Math.max(2, Math.min(options.ballCount ?? 5, 10));
    balls = Array.from({ length: count }, () => ({
      x: Math.random() * (width - 80) + 40,
      y: Math.random() * (height - 80) + 40,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      r: 28 + Math.random() * 18
    }));
  };

  const applyLayout = () => {
    const width = options.width ?? 400;
    const height = options.height ?? 300;
    const color = options.color ?? '#38bdf8';
    root.style.width = `${width}px`;
    root.style.height = `${height}px`;
    root.style.setProperty('--pool-color', color);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const onMove = (clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = clientX - rect.left;
    pointer.y = clientY - rect.top;
    pointer.active = true;
  };
  const onLeave = () => {
    pointer.active = false;
  };
  const handleMouse = (e: MouseEvent) => onMove(e.clientX, e.clientY);
  const handleTouch = (e: TouchEvent) => {
    if (e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY);
  };

  const tick = () => {
    if (destroyed) return;
    frameId = requestAnimationFrame(tick);
    if (paused) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = options.width ?? 400;
    const height = options.height ?? 300;
    const scale = 0.5;
    const sw = Math.floor(width * scale);
    const sh = Math.floor(height * scale);

    for (const b of balls) {
      if (pointer.active) {
        const dx = b.x - pointer.x;
        const dy = b.y - pointer.y;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < 120) {
          const force = (120 - dist) * 0.04;
          b.vx += (dx / dist) * force;
          b.vy += (dy / dist) * force;
        }
      }
      b.vx *= 0.98;
      b.vy *= 0.98;
      b.x += b.vx;
      b.y += b.vy;

      if (b.x - b.r < 0) {
        b.x = b.r;
        b.vx *= -0.8;
      } else if (b.x + b.r > width) {
        b.x = width - b.r;
        b.vx *= -0.8;
      }
      if (b.y - b.r < 0) {
        b.y = b.r;
        b.vy *= -0.8;
      } else if (b.y + b.r > height) {
        b.y = height - b.r;
        b.vy *= -0.8;
      }
    }

    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        const a = balls[i];
        const b = balls[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 0.001;
        const minDist = (a.r + b.r) * 0.55;
        if (dist < minDist) {
          const nx = dx / dist;
          const ny = dy / dist;
          const overlap = minDist - dist;
          a.x -= nx * overlap * 0.5;
          a.y -= ny * overlap * 0.5;
          b.x += nx * overlap * 0.5;
          b.y += ny * overlap * 0.5;
        }
      }
    }

    const offscreen = document.createElement('canvas');
    offscreen.width = sw;
    offscreen.height = sh;
    const octx = offscreen.getContext('2d');
    if (!octx) return;
    const imageData = octx.createImageData(sw, sh);
    const data = imageData.data;
    const threshold = 1.0;

    for (let py = 0; py < sh; py++) {
      for (let px = 0; px < sw; px++) {
        const x = px / scale;
        const y = py / scale;
        let sum = 0;
        for (const b of balls) {
          const dx = x - b.x;
          const dy = y - b.y;
          const d2 = dx * dx + dy * dy;
          sum += (b.r * b.r) / (d2 + 1);
        }
        const idx = (py * sw + px) * 4;
        if (sum > threshold) {
          const intensity = clamp((sum - threshold) * 0.8, 0, 1);
          data[idx] = 56 + intensity * 40;
          data[idx + 1] = 189;
          data[idx + 2] = 248;
          data[idx + 3] = 255;
        } else {
          data[idx + 3] = 0;
        }
      }
    }

    octx.putImageData(imageData, 0, 0);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);
    ctx.save();
    ctx.filter = 'blur(8px)';
    ctx.drawImage(offscreen, 0, 0, width, height);
    ctx.restore();
    ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(offscreen, 0, 0, width, height);
    ctx.globalCompositeOperation = 'source-over';

    for (const b of balls) {
      const grad = ctx.createRadialGradient(b.x - b.r * 0.3, b.y - b.r * 0.3, 0, b.x, b.y, b.r * 0.6);
      grad.addColorStop(0, 'rgba(255,255,255,0.5)');
      grad.addColorStop(1, 'rgba(56,189,248,0)');
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }
  };

  spawnBalls();
  applyLayout();
  canvas.addEventListener('mousemove', handleMouse);
  canvas.addEventListener('mouseleave', onLeave);
  canvas.addEventListener('touchmove', handleTouch, { passive: true });
  canvas.addEventListener('touchend', onLeave);
  unbindVisibility = bindVisibilityPause((hidden) => {
    paused = hidden;
  });
  tick();

  return {
    update(next) {
      const prevCount = options.ballCount;
      const prevW = options.width;
      const prevH = options.height;
      options = { ...options, ...next };
      applyLayout();
      if (options.ballCount !== prevCount || options.width !== prevW || options.height !== prevH) spawnBalls();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancelAnimationFrame(frameId);
      unbindVisibility?.();
      canvas.removeEventListener('mousemove', handleMouse);
      canvas.removeEventListener('mouseleave', onLeave);
      canvas.removeEventListener('touchmove', handleTouch);
      canvas.removeEventListener('touchend', onLeave);
      root.remove();
    }
  };
}
