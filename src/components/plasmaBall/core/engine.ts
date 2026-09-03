import { bindVisibilityPause } from '@cos-design/shared';
import type { PlasmaBallController, PlasmaBallOptions } from './types';

const P = 'cos-plasma-ball';

interface Arc {
  angle: number;
  length: number;
  speed: number;
}

const displace = (x1: number, y1: number, x2: number, y2: number, rough: number, depth: number): [number, number][] => {
  if (depth <= 0)
    return [
      [x1, y1],
      [x2, y2]
    ];
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const offset = (Math.random() - 0.5) * rough;
  const nx = (-dy / len) * offset;
  const ny = (dx / len) * offset;
  const left = displace(x1, y1, mx + nx, my + ny, rough * 0.55, depth - 1);
  const right = displace(mx + nx, my + ny, x2, y2, rough * 0.55, depth - 1);
  return [...left.slice(0, -1), ...right];
};

export function createPlasmaBall(container: HTMLElement, initial: PlasmaBallOptions = {}): PlasmaBallController {
  let options: PlasmaBallOptions = { width: 320, height: 320, color: '#a78bfa', arcCount: 8, ...initial };
  let destroyed = false;
  let frameId = 0;
  let paused = typeof document !== 'undefined' ? document.hidden : false;
  let unbindVisibility: (() => void) | null = null;
  const pointer = { x: 160, y: 160, active: false };
  let arcs: Arc[] = [];

  const root = document.createElement('div');
  root.className = P;
  const canvas = document.createElement('canvas');
  canvas.className = `${P}__canvas`;
  root.appendChild(canvas);
  container.appendChild(root);

  const rebuildArcs = () => {
    const arcCount = options.arcCount ?? 8;
    arcs = Array.from({ length: arcCount }, (_, i) => ({
      angle: (i / arcCount) * Math.PI * 2,
      length: 0.6 + Math.random() * 0.35,
      speed: 0.02 + Math.random() * 0.03
    }));
  };

  const applyLayout = () => {
    const width = options.width ?? 320;
    const height = options.height ?? 320;
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

  const draw = () => {
    if (destroyed) return;
    frameId = requestAnimationFrame(draw);
    if (paused) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = options.width ?? 320;
    const height = options.height ?? 320;
    const color = options.color ?? '#a78bfa';
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.38;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    const grad = ctx.createRadialGradient(cx, cy, radius * 0.1, cx, cy, radius * 1.1);
    grad.addColorStop(0, 'rgba(30, 41, 59, 0.9)');
    grad.addColorStop(0.7, 'rgba(15, 23, 42, 0.6)');
    grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.05, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();

    arcs.forEach((arc) => {
      arc.angle += arc.speed * (Math.random() > 0.5 ? 1 : -1);
      const baseAngle = pointer.active
        ? Math.atan2(pointer.y - cy, pointer.x - cx) + (arc.angle - Math.PI) * 0.15
        : arc.angle;
      const len = radius * arc.length;
      const ex = cx + Math.cos(baseAngle) * len;
      const ey = cy + Math.sin(baseAngle) * len;
      const points = displace(cx, cy, ex, ey, 18, 4);

      ctx.beginPath();
      points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = color;
      ctx.shadowBlur = 14;
      ctx.globalAlpha = 0.85;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    });

    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 10);
    coreGrad.addColorStop(0, '#fff');
    coreGrad.addColorStop(0.5, color);
    coreGrad.addColorStop(1, color);
    ctx.fillStyle = coreGrad;
    ctx.shadowColor = color;
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  rebuildArcs();
  applyLayout();
  canvas.addEventListener('mousemove', handleMouse);
  canvas.addEventListener('mouseleave', onLeave);
  canvas.addEventListener('touchmove', handleTouch, { passive: true });
  canvas.addEventListener('touchend', onLeave);
  unbindVisibility = bindVisibilityPause((hidden) => {
    paused = hidden;
  });
  draw();

  return {
    update(next) {
      const prevCount = options.arcCount ?? 8;
      options = { ...options, ...next };
      applyLayout();
      if ((options.arcCount ?? 8) !== prevCount) rebuildArcs();
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
