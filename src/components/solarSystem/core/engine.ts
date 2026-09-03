import { bindVisibilityPause } from '@cos-design/shared';
import type { SolarSystemController, SolarSystemOptions } from './types';

const P = 'cos-solar-system';

interface Body {
  name: string;
  radius: number;
  orbit: number;
  speed: number;
  color: string;
  size: number;
  angle: number;
  parent?: number;
}

const PLANETS: Omit<Body, 'angle'>[] = [
  { name: 'Mercury', radius: 0, orbit: 42, speed: 4.8, color: '#94a3b8', size: 3 },
  { name: 'Venus', radius: 0, orbit: 58, speed: 3.5, color: '#fbbf24', size: 5 },
  { name: 'Earth', radius: 0, orbit: 78, speed: 3, color: '#38bdf8', size: 5 },
  { name: 'Mars', radius: 0, orbit: 98, speed: 2.4, color: '#f87171', size: 4 },
  { name: 'Jupiter', radius: 0, orbit: 130, speed: 1.6, color: '#fb923c', size: 12 },
  { name: 'Saturn', radius: 0, orbit: 160, speed: 1.2, color: '#fcd34d', size: 10 },
  { name: 'Moon', radius: 0, orbit: 14, speed: 8, color: '#cbd5e1', size: 2, parent: 2 }
];

export function createSolarSystem(container: HTMLElement, initial: SolarSystemOptions = {}): SolarSystemController {
  let options: SolarSystemOptions = { width: 400, height: 400, speed: 1, showOrbits: true, ...initial };
  let destroyed = false;
  let frameId = 0;
  let paused = typeof document !== 'undefined' ? document.hidden : false;
  let unbindVisibility: (() => void) | null = null;
  const bodies: Body[] = PLANETS.map((p) => ({ ...p, angle: Math.random() * Math.PI * 2 }));
  const stars = Array.from({ length: 80 }, () => ({
    x: Math.random(),
    y: Math.random(),
    alpha: Math.random() * 0.6
  }));

  const root = document.createElement('div');
  root.className = P;
  const canvas = document.createElement('canvas');
  canvas.className = `${P}__canvas`;
  root.appendChild(canvas);
  container.appendChild(root);

  const applyLayout = () => {
    const width = options.width ?? 400;
    const height = options.height ?? 400;
    root.style.width = `${width}px`;
    root.style.height = `${height}px`;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const tick = () => {
    if (destroyed) return;
    frameId = requestAnimationFrame(tick);
    if (paused) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = options.width ?? 400;
    const height = options.height ?? 400;
    const speed = options.speed ?? 1;
    const showOrbits = options.showOrbits ?? true;
    const cx = width / 2;
    const cy = height / 2;
    const scale = Math.min(width, height) / 380;
    const positions: { x: number; y: number }[] = [];

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    stars.forEach((star) => {
      ctx.fillStyle = `rgba(255,255,255,${star.alpha})`;
      ctx.fillRect(star.x * width, star.y * height, 1, 1);
    });

    ctx.beginPath();
    ctx.arc(cx, cy, 18 * scale, 0, Math.PI * 2);
    const sunGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 18 * scale);
    sunGrad.addColorStop(0, '#fef08a');
    sunGrad.addColorStop(0.5, '#fbbf24');
    sunGrad.addColorStop(1, '#f97316');
    ctx.fillStyle = sunGrad;
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 24;
    ctx.fill();
    ctx.shadowBlur = 0;

    bodies.forEach((body, i) => {
      body.angle += (body.speed * 0.008 * speed) / Math.sqrt(body.orbit);

      let px = cx;
      let py = cy;
      if (body.parent !== undefined && positions[body.parent]) {
        px = positions[body.parent].x;
        py = positions[body.parent].y;
      }

      const orbit = body.orbit * scale;
      const x = px + Math.cos(body.angle) * orbit;
      const y = py + Math.sin(body.angle) * orbit;
      positions[i] = { x, y };

      if (showOrbits && body.parent === undefined) {
        ctx.beginPath();
        ctx.arc(px, py, orbit, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      if (body.name === 'Saturn') {
        ctx.beginPath();
        ctx.ellipse(x, y, body.size * scale * 1.8, body.size * scale * 0.5, body.angle * 0.3, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(252, 211, 77, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(x, y, body.size * scale, 0, Math.PI * 2);
      ctx.fillStyle = body.color;
      if (body.name === 'Earth') {
        const eg = ctx.createRadialGradient(x - 2, y - 2, 0, x, y, body.size * scale);
        eg.addColorStop(0, '#4ade80');
        eg.addColorStop(0.6, body.color);
        eg.addColorStop(1, '#1d4ed8');
        ctx.fillStyle = eg;
      }
      ctx.fill();
    });
  };

  applyLayout();
  unbindVisibility = bindVisibilityPause((hidden) => {
    paused = hidden;
  });
  tick();

  return {
    update(next) {
      options = { ...options, ...next };
      applyLayout();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancelAnimationFrame(frameId);
      unbindVisibility?.();
      root.remove();
    }
  };
}
