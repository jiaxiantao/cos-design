import React, { useEffect, useRef } from 'react';
import { bindVisibilityPause } from '@cos-design/shared';
import styles from './style/index.module.less';

export interface MeteorRainProps {
  width?: number;
  height?: number;
  /** 流星数量，默认 8 */
  meteorCount?: number;
}

interface Meteor {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
}

const MeteorRain: React.FC<MeteorRainProps> = ({ width = 800, height = 500, meteorCount = 8 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const meteorsRef = useRef<Meteor[]>([]);
  const frameRef = useRef(0);

  useEffect(() => {
    meteorsRef.current = Array.from({ length: meteorCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height * 0.5,
      length: Math.random() * 60 + 40,
      speed: Math.random() * 6 + 4,
      opacity: Math.random() * 0.5 + 0.3
    }));
  }, [height, meteorCount, width]);

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
    const unbindVisibility = bindVisibilityPause((hidden) => {
      paused = hidden;
    });

    const tick = () => {
      frameRef.current = requestAnimationFrame(tick);
      if (paused) return;

      ctx.fillStyle = 'rgb(15 23 42 / 15%)';
      ctx.fillRect(0, 0, width, height);

      meteorsRef.current.forEach((meteor) => {
        meteor.x += meteor.speed;
        meteor.y += meteor.speed * 0.6;

        if (meteor.x > width + meteor.length || meteor.y > height + meteor.length) {
          meteor.x = -meteor.length;
          meteor.y = Math.random() * height * 0.4;
          meteor.length = Math.random() * 60 + 40;
          meteor.speed = Math.random() * 6 + 4;
          meteor.opacity = Math.random() * 0.5 + 0.3;
        }

        const tailX = meteor.x - meteor.length;
        const tailY = meteor.y - meteor.length * 0.6;

        ctx.beginPath();
        ctx.strokeStyle = `rgb(255 255 255 / ${meteor.opacity})`;
        ctx.lineWidth = 2;
        ctx.moveTo(meteor.x, meteor.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = `rgb(255 255 255 / ${Math.min(1, meteor.opacity + 0.2)})`;
        ctx.arc(meteor.x, meteor.y, 1.5, 0, Math.PI * 2);
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
    <div className={styles.meteorRain} style={{ width, height }}>
      <canvas ref={canvasRef} className={styles.canvas} style={{ width, height }} />
    </div>
  );
};

export default MeteorRain;
