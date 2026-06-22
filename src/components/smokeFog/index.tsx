import React, { useEffect, useRef } from 'react';
import { bindVisibilityPause } from '../_shared/visibility';
import styles from './style/index.module.less';

export interface SmokeFogProps {
  width?: number;
  height?: number;
  /** 雾气密度 0~1，默认 0.5 */
  density?: number;
}

interface FogBlob {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  alpha: number;
}

const SmokeFog: React.FC<SmokeFogProps> = ({ width = 800, height = 500, density = 0.5 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blobsRef = useRef<FogBlob[]>([]);
  const frameRef = useRef(0);

  useEffect(() => {
    const count = Math.floor(20 + density * 40);
    blobsRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 80 + 40,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.3 - 0.1,
      alpha: Math.random() * 0.15 + 0.05
    }));
  }, [density, height, width]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let time = 0;
    let paused = document.hidden;
    const unbindVisibility = bindVisibilityPause((hidden) => {
      paused = hidden;
    });

    const tick = () => {
      frameRef.current = requestAnimationFrame(tick);
      if (paused) return;

      time += 0.008;
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, width, height);

      const bgGrad = ctx.createRadialGradient(width * 0.5, height * 0.3, 0, width * 0.5, height * 0.5, width * 0.7);
      bgGrad.addColorStop(0, '#2d2d44');
      bgGrad.addColorStop(1, '#1a1a2e');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      blobsRef.current.forEach((blob, i) => {
        blob.x += blob.vx + Math.sin(time + i) * 0.15;
        blob.y += blob.vy + Math.cos(time * 0.7 + i * 0.5) * 0.1;

        if (blob.x < -blob.radius) blob.x = width + blob.radius;
        if (blob.x > width + blob.radius) blob.x = -blob.radius;
        if (blob.y < -blob.radius) blob.y = height + blob.radius;
        if (blob.y > height + blob.radius) blob.y = -blob.radius;

        const grad = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.radius);
        grad.addColorStop(0, `rgb(200 200 210 / ${blob.alpha})`);
        grad.addColorStop(0.5, `rgb(160 160 175 / ${blob.alpha * 0.5})`);
        grad.addColorStop(1, 'rgb(160 160 175 / 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    tick();
    return () => {
      cancelAnimationFrame(frameRef.current);
      unbindVisibility();
    };
  }, [height, width]);

  return (
    <div className={styles.smokeFog} style={{ width, height }}>
      <canvas ref={canvasRef} className={styles.canvas} style={{ width, height }} />
    </div>
  );
};

export default SmokeFog;
