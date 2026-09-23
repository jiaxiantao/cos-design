import { bindVisibilityPause } from '@cos-design/shared';
import type { LorenzAttractorController, LorenzAttractorOptions } from './types';

const P = 'cos-lorenz-attractor';

export function createLorenzAttractor(
  container: HTMLElement,
  initial: LorenzAttractorOptions = {},
): LorenzAttractorController {
  let options: LorenzAttractorOptions = {
    width: 400,
    height: 360,
    speed: 1,
    color: '#f472b6',
    pointCount: 2000,
    ...initial,
  };
  let destroyed = false;
  let frameId = 0;
  let unbindVisibility: (() => void) | null = null;
  let rot = 0;

  const root = document.createElement('div');
  const canvas = document.createElement('canvas');
  canvas.className = `${P}__canvas`;
  root.appendChild(canvas);
  container.appendChild(root);

  const stop = () => {
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
    unbindVisibility?.();
    unbindVisibility = null;
  };

  const start = () => {
    stop();
    if (destroyed) return;
    const width = options.width ?? 400;
    const height = options.height ?? 360;
    const speed = options.speed ?? 1;
    const color = options.color ?? '#f472b6';
    const pointCount = options.pointCount ?? 2000;
    root.className = P;
    root.style.width = `${width}px`;
    root.style.height = `${height}px`;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const sigma = 10;
    const rho = 28;
    const beta = 8 / 3;
    const dt = 0.005;
    const points: { x: number; y: number; z: number }[] = [];
    let x = 0.1;
    let y = 0;
    let z = 0;
    for (let i = 0; i < pointCount; i++) {
      const dx = sigma * (y - x);
      const dy = x * (rho - z) - y;
      const dz = x * y - beta * z;
      x += dx * dt;
      y += dy * dt;
      z += dz * dt;
      points.push({ x, y, z });
    }

    const project = (px: number, py: number, pz: number, rotation: number) => {
      const cosR = Math.cos(rotation);
      const sinR = Math.sin(rotation);
      const rx = px * cosR - pz * sinR;
      const rz = px * sinR + pz * cosR;
      const scale = 6;
      return { x: width / 2 + rx * scale, y: height / 2 - py * scale, depth: rz };
    };

    let paused = typeof document !== 'undefined' ? document.hidden : false;
    unbindVisibility = bindVisibilityPause((hidden) => {
      paused = hidden;
    });

    const draw = () => {
      frameId = requestAnimationFrame(draw);
      if (paused || destroyed) return;
      rot += 0.004 * speed;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.15)';
      ctx.fillRect(0, 0, width, height);
      const projected = points.map((p) => project(p.x, p.y, p.z, rot));
      ctx.beginPath();
      projected.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.75;
      ctx.lineWidth = 0.9;
      ctx.stroke();
      ctx.globalAlpha = 1;
      projected.forEach((p, i) => {
        if (i % 50 !== 0) return;
        const alpha = 0.2 + ((p.depth + 30) / 60) * 0.6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = Math.max(0.1, Math.min(alpha, 0.9));
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    };

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);
    draw();
  };

  start();

  return {
    update(next) {
      options = { ...options, ...next };
      start();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      stop();
      root.remove();
    },
  };
}
