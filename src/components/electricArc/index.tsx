import React, { useEffect, useRef } from 'react';
import { bindVisibilityPause } from '@cos-design/shared';
import styles from './style/index.module.less';

export interface ElectricArcProps {
  width?: number;
  height?: number;
  color?: string;
}

const displace = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  roughness: number,
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
  const offset = (Math.random() - 0.5) * roughness;
  const nx = (-dy / len) * offset;
  const ny = (dx / len) * offset;
  const left = displace(x1, y1, mx + nx, my + ny, roughness * 0.6, depth - 1);
  const right = displace(mx + nx, my + ny, x2, y2, roughness * 0.6, depth - 1);
  return [...left.slice(0, -1), ...right];
};

const ElectricArc: React.FC<ElectricArcProps> = ({ width = 320, height = 160, color = '#67e8f9' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const x1 = 40;
    const y1 = height / 2;
    const x2 = width - 40;
    const y2 = height / 2;

    let frameId = 0;
    let paused = document.hidden;
    const unbindVisibility = bindVisibilityPause((hidden) => {
      paused = hidden;
    });

    const draw = () => {
      frameId = requestAnimationFrame(draw);
      if (paused) return;

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      const points = displace(x1, y1, x2, y2, 40, 5);

      ctx.beginPath();
      points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.beginPath();
      points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 0.8;
      ctx.globalAlpha = 0.6;
      ctx.stroke();
      ctx.globalAlpha = 1;

      [
        [x1, y1],
        [x2, y2]
      ].forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });
    };

    draw();
    return () => {
      cancelAnimationFrame(frameId);
      unbindVisibility();
    };
  }, [color, height, width]);

  return (
    <div className={styles.electricArc} style={{ width, height }}>
      <canvas ref={canvasRef} className={styles.canvas} style={{ width, height }} />
    </div>
  );
};

export default ElectricArc;
