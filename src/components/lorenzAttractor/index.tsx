import React, { useEffect, useRef } from 'react';
import { bindVisibilityPause } from '@cos-design/shared';
import styles from './style/index.module.less';

export interface LorenzAttractorProps {
  width?: number;
  height?: number;
  speed?: number;
  color?: string;
  pointCount?: number;
}

const LorenzAttractor: React.FC<LorenzAttractorProps> = ({
  width = 400,
  height = 360,
  speed = 1,
  color = '#f472b6',
  pointCount = 2000
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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

    let frameId = 0;
    let paused = document.hidden;
    const unbindVisibility = bindVisibilityPause((hidden) => {
      paused = hidden;
    });

    const project = (px: number, py: number, pz: number, rot: number) => {
      const cosR = Math.cos(rot);
      const sinR = Math.sin(rot);
      const rx = px * cosR - pz * sinR;
      const rz = px * sinR + pz * cosR;
      const ry = py;
      const scale = 6;
      return {
        x: width / 2 + rx * scale,
        y: height / 2 - ry * scale,
        depth: rz
      };
    };

    const draw = () => {
      frameId = requestAnimationFrame(draw);
      if (paused) return;

      rotRef.current += 0.004 * speed;
      const rot = rotRef.current;

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

    return () => {
      cancelAnimationFrame(frameId);
      unbindVisibility();
    };
  }, [color, height, pointCount, speed, width]);

  return (
    <div className={styles.lorenzAttractor} style={{ width, height }}>
      <canvas ref={canvasRef} className={styles.canvas} style={{ width, height }} />
    </div>
  );
};

export default LorenzAttractor;
