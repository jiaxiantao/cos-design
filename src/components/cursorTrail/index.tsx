import React, { useEffect, useRef } from 'react';
import { bindVisibilityPause } from '@cos-design/shared';
import styles from './style/index.module.less';

export interface CursorTrailProps {
  /** 轨迹颜色 */
  color?: string;
  /** 轨迹长度，默认 20 */
  length?: number;
  width?: number;
  height?: number;
}

interface TrailPoint {
  x: number;
  y: number;
  life: number;
}

const CursorTrail: React.FC<CursorTrailProps> = ({ color = '#38bdf8', length = 20, width = 800, height = 400 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailRef = useRef<TrailPoint[]>([]);
  const mouseRef = useRef({ x: width / 2, y: height / 2 });
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let paused = document.hidden;
    const unbind = bindVisibilityPause((hidden) => {
      paused = hidden;
    });

    const tick = () => {
      frameRef.current = requestAnimationFrame(tick);
      if (paused) return;

      const { x, y } = mouseRef.current;
      trailRef.current.unshift({ x, y, life: 1 });
      if (trailRef.current.length > length) {
        trailRef.current.length = length;
      }

      ctx.fillStyle = 'rgb(15 23 42 / 15%)';
      ctx.fillRect(0, 0, width, height);

      const points = trailRef.current;
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const alpha = 1 - i / points.length;
        const size = (1 - i / points.length) * 8 + 2;

        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha * 0.8;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    tick();

    return () => {
      cancelAnimationFrame(frameRef.current);
      unbind();
    };
  }, [color, height, length, width]);

  const handleMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  return (
    <div className={styles.cursorTrail} style={{ width, height }}>
      <canvas ref={canvasRef} className={styles.canvas} style={{ width, height }} onMouseMove={handleMove} />
      <p className={styles.hint}>移动鼠标查看粒子轨迹</p>
    </div>
  );
};

export default CursorTrail;
