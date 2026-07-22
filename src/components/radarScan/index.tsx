import React, { useEffect, useRef } from 'react';
import { bindVisibilityPause } from '@cos-design/shared';
import styles from './style/index.module.less';

export interface RadarScanProps {
  size?: number;
  color?: string;
  /** 光点数量，默认 5 */
  blipCount?: number;
}

interface Blip {
  angle: number;
  dist: number;
  alpha: number;
}

const RadarScan: React.FC<RadarScanProps> = ({ size = 300, color = '#22d3ee', blipCount = 5 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef(0);
  const blipsRef = useRef<Blip[]>([]);
  const frameRef = useRef(0);

  useEffect(() => {
    blipsRef.current = Array.from({ length: blipCount }, () => ({
      angle: Math.random() * Math.PI * 2,
      dist: Math.random() * 0.7 + 0.15,
      alpha: Math.random() * 0.5 + 0.5
    }));
  }, [blipCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 10;

    let paused = document.hidden;
    const unbind = bindVisibilityPause((hidden) => {
      paused = hidden;
    });

    const tick = () => {
      frameRef.current = requestAnimationFrame(tick);
      if (paused) return;

      angleRef.current += 0.03;

      ctx.fillStyle = 'rgb(15 23 42 / 25%)';
      ctx.fillRect(0, 0, size, size);

      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, (radius / 4) * i, 0, Math.PI * 2);
        ctx.strokeStyle = `${color}33`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.moveTo(cx, cy - radius);
      ctx.lineTo(cx, cy + radius);
      ctx.moveTo(cx - radius, cy);
      ctx.lineTo(cx + radius, cy);
      ctx.strokeStyle = `${color}44`;
      ctx.stroke();

      const sweepAngle = angleRef.current;
      const gradient = ctx.createConicGradient(sweepAngle - 0.5, cx, cy);
      gradient.addColorStop(0, 'transparent');
      gradient.addColorStop(0.15, `${color}66`);
      gradient.addColorStop(0.3, 'transparent');

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, sweepAngle - 0.5, sweepAngle);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sweepAngle) * radius, cy + Math.sin(sweepAngle) * radius);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      blipsRef.current.forEach((blip) => {
        const ba = blip.angle;
        const bx = cx + Math.cos(ba) * radius * blip.dist;
        const by = cy + Math.sin(ba) * radius * blip.dist;

        const diff = Math.abs(((sweepAngle - ba + Math.PI) % (Math.PI * 2)) - Math.PI);
        if (diff < 0.3) {
          blip.alpha = Math.min(1, blip.alpha + 0.05);
        } else {
          blip.alpha = Math.max(0.2, blip.alpha - 0.01);
        }

        ctx.beginPath();
        ctx.arc(bx, by, 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = blip.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    tick();

    return () => {
      cancelAnimationFrame(frameRef.current);
      unbind();
    };
  }, [blipCount, color, size]);

  return (
    <div className={styles.radarScan} style={{ width: size, height: size }}>
      <canvas ref={canvasRef} className={styles.canvas} style={{ width: size, height: size }} />
    </div>
  );
};

export default RadarScan;
