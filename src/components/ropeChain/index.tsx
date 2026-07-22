import React, { useEffect, useRef } from 'react';
import { bindVisibilityPause } from '@cos-design/shared';
import styles from './style/index.module.less';

export interface RopeChainProps {
  width?: number;
  height?: number;
  segments?: number;
  color?: string;
  gravity?: number;
}

interface Point {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  pinned: boolean;
}

const RopeChain: React.FC<RopeChainProps> = ({
  width = 400,
  height = 400,
  segments = 16,
  color = '#38bdf8',
  gravity = 0.4
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<Point[]>([]);
  const dragRef = useRef({ active: false, index: -1 });

  useEffect(() => {
    const count = Math.max(4, Math.min(segments, 30));
    const segLen = (height * 0.7) / count;
    const startX = width / 2;
    const startY = height * 0.08;

    pointsRef.current = Array.from({ length: count + 1 }, (_, i) => ({
      x: startX,
      y: startY + i * segLen,
      prevX: startX,
      prevY: startY + i * segLen,
      pinned: i === 0
    }));
  }, [height, segments, width]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.max(4, Math.min(segments, 30));
    const segLen = (height * 0.7) / count;
    const iterations = 6;

    const findNearest = (mx: number, my: number) => {
      const points = pointsRef.current;
      let best = -1;
      let bestDist = 30;
      points.forEach((p, i) => {
        const d = Math.hypot(p.x - mx, p.y - my);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      return best;
    };

    const onDown = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const mx = clientX - rect.left;
      const my = clientY - rect.top;
      const idx = findNearest(mx, my);
      if (idx >= 0) {
        dragRef.current = { active: true, index: idx };
        const p = pointsRef.current[idx];
        p.x = mx;
        p.y = my;
        p.prevX = mx;
        p.prevY = my;
      }
    };

    const onMove = (clientX: number, clientY: number) => {
      if (!dragRef.current.active) return;
      const rect = canvas.getBoundingClientRect();
      const p = pointsRef.current[dragRef.current.index];
      p.x = clientX - rect.left;
      p.y = clientY - rect.top;
    };

    const onUp = () => {
      dragRef.current = { active: false, index: -1 };
    };

    const handleMouseDown = (e: MouseEvent) => onDown(e.clientX, e.clientY);
    const handleMouseMove = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches[0]) onDown(e.touches[0].clientX, e.touches[0].clientY);
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', onUp);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', onUp);

    let frameId = 0;
    let paused = document.hidden;
    const unbindVisibility = bindVisibilityPause((hidden) => {
      paused = hidden;
    });

    const tick = () => {
      frameId = requestAnimationFrame(tick);
      if (paused) return;

      const points = pointsRef.current;
      const drag = dragRef.current;

      for (const p of points) {
        if (p.pinned || (drag.active && points.indexOf(p) === drag.index)) continue;
        const vx = (p.x - p.prevX) * 0.99;
        const vy = (p.y - p.prevY) * 0.99;
        p.prevX = p.x;
        p.prevY = p.y;
        p.x += vx;
        p.y += vy;
        p.y += gravity;
      }

      for (let iter = 0; iter < iterations; iter++) {
        for (let i = 0; i < points.length - 1; i++) {
          const a = points[i];
          const b = points[i + 1];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 0.001;
          const diff = (dist - segLen) / dist;
          const offsetX = dx * diff * 0.5;
          const offsetY = dy * diff * 0.5;

          if (!a.pinned && !(drag.active && i === drag.index)) {
            a.x += offsetX;
            a.y += offsetY;
          }
          if (!b.pinned && !(drag.active && i + 1 === drag.index)) {
            b.x -= offsetX;
            b.y -= offsetY;
          }
        }
      }

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      ctx.beginPath();
      points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;

      points.forEach((p, i) => {
        if (i === 0 || i === points.length - 1 || i % 4 === 0) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, i === 0 ? 6 : 4, 0, Math.PI * 2);
          ctx.fillStyle = i === 0 ? '#94a3b8' : color;
          ctx.fill();
        }
      });
    };

    tick();

    return () => {
      cancelAnimationFrame(frameId);
      unbindVisibility();
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', onUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [color, gravity, height, segments, width]);

  return (
    <div className={styles.ropeChain} style={{ width, height }}>
      <canvas ref={canvasRef} className={styles.canvas} style={{ width, height }} />
    </div>
  );
};

export default RopeChain;
