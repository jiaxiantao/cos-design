import React, { useEffect, useRef } from 'react';
import { bindVisibilityPause } from '@cos-design/shared';
import styles from './style/index.module.less';

export interface PlasmaBallProps {
  width?: number;
  height?: number;
  color?: string;
  arcCount?: number;
}

interface Arc {
  angle: number;
  length: number;
  speed: number;
}

const PlasmaBall: React.FC<PlasmaBallProps> = ({ width = 320, height = 320, color = '#a78bfa', arcCount = 8 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef({ x: width / 2, y: height / 2, active: false });
  const arcsRef = useRef<Arc[]>([]);

  useEffect(() => {
    arcsRef.current = Array.from({ length: arcCount }, (_, i) => ({
      angle: (i / arcCount) * Math.PI * 2,
      length: 0.6 + Math.random() * 0.35,
      speed: 0.02 + Math.random() * 0.03
    }));
  }, [arcCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.38;

    const onMove = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      pointerRef.current = {
        x: clientX - rect.left,
        y: clientY - rect.top,
        active: true
      };
    };

    const onLeave = () => {
      pointerRef.current.active = false;
    };

    const handleMouse = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const handleTouch = (e: TouchEvent) => {
      if (e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    canvas.addEventListener('mousemove', handleMouse);
    canvas.addEventListener('mouseleave', onLeave);
    canvas.addEventListener('touchmove', handleTouch, { passive: true });
    canvas.addEventListener('touchend', onLeave);

    let frameId = 0;
    let paused = document.hidden;
    const unbindVisibility = bindVisibilityPause((hidden) => {
      paused = hidden;
    });

    const displace = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      rough: number,
      depth: number
    ): [number, number][] => {
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

    const draw = () => {
      frameId = requestAnimationFrame(draw);
      if (paused) return;

      const pointer = pointerRef.current;
      const arcs = arcsRef.current;

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

    draw();

    return () => {
      cancelAnimationFrame(frameId);
      unbindVisibility();
      canvas.removeEventListener('mousemove', handleMouse);
      canvas.removeEventListener('mouseleave', onLeave);
      canvas.removeEventListener('touchmove', handleTouch);
      canvas.removeEventListener('touchend', onLeave);
    };
  }, [arcCount, color, height, width]);

  return (
    <div className={styles.plasmaBall} style={{ width, height }}>
      <canvas ref={canvasRef} className={styles.canvas} style={{ width, height }} />
    </div>
  );
};

export default PlasmaBall;
