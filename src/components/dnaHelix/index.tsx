import React, { useEffect, useRef } from 'react';
import { bindVisibilityPause } from '../_shared/visibility';
import styles from './style/index.module.less';

export interface DnaHelixProps {
  width?: number;
  height?: number;
  speed?: number;
  color?: string;
}

const DnaHelix: React.FC<DnaHelixProps> = ({ width = 200, height = 360, speed = 1, color = '#38bdf8' }) => {
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

    const pairs = 18;
    let t = 0;
    let frameId = 0;
    let paused = document.hidden;
    const unbindVisibility = bindVisibilityPause((hidden) => {
      paused = hidden;
    });

    const draw = () => {
      frameId = requestAnimationFrame(draw);
      if (paused) return;
      t += 0.03 * speed;

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const amp = width * 0.32;

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

    draw();
    return () => {
      cancelAnimationFrame(frameId);
      unbindVisibility();
    };
  }, [color, height, speed, width]);

  return (
    <div className={styles.dnaHelix} style={{ width, height }}>
      <canvas ref={canvasRef} className={styles.canvas} style={{ width, height }} />
    </div>
  );
};

export default DnaHelix;
