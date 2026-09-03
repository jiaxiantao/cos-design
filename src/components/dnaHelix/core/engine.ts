import { bindVisibilityPause } from '@cos-design/shared';
import type { DnaHelixController, DnaHelixOptions } from './types';

const P = 'cos-dna-helix';

export function createDnaHelix(container: HTMLElement, initial: DnaHelixOptions = {}): DnaHelixController {
  let options: DnaHelixOptions = { width: 200, height: 360, speed: 1, color: '#38bdf8', ...initial };
  let destroyed = false;
  let frameId = 0;
  let t = 0;
  let paused = typeof document !== 'undefined' ? document.hidden : false;
  let unbindVisibility: (() => void) | null = null;

  const root = document.createElement('div');
  root.className = P;
  const canvas = document.createElement('canvas');
  canvas.className = `${P}__canvas`;
  root.appendChild(canvas);
  container.appendChild(root);

  const applyLayout = () => {
    const width = options.width ?? 200;
    const height = options.height ?? 360;
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

  const draw = () => {
    if (destroyed) return;
    frameId = requestAnimationFrame(draw);
    if (paused) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = options.width ?? 200;
    const height = options.height ?? 360;
    const speed = options.speed ?? 1;
    const color = options.color ?? '#38bdf8';
    t += 0.03 * speed;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2;
    const amp = width * 0.32;
    const pairs = 18;

    for (let i = 0; i < pairs; i++) {
      const y = (i / (pairs - 1)) * (height - 40) + 20;
      const phase = t + i * 0.4;
      const x1 = cx + Math.sin(phase) * amp;
      const x2 = cx + Math.sin(phase + Math.PI) * amp;
      const depth = Math.cos(phase);
      const r = 5 + depth * 2;

      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      ctx.strokeStyle = `rgb(148 163 184 / ${30 + Math.abs(depth) * 30}%)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x1, y, r, 0, Math.PI * 2);
      ctx.fillStyle = depth > 0 ? color : '#a78bfa';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x2, y, r, 0, Math.PI * 2);
      ctx.fillStyle = depth > 0 ? '#a78bfa' : color;
      ctx.fill();
    }
  };

  applyLayout();
  unbindVisibility = bindVisibilityPause((hidden) => {
    paused = hidden;
  });
  draw();

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
