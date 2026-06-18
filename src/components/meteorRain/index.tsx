import React, { useEffect, useRef } from 'react';
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

    const tick = () => {
      frameRef.current = requestAnimationFrame(tick);
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

        const gradient = ctx.createLinearGradient(
          meteor.x,
          meteor.y,
          meteor.x - meteor.length,
          meteor.y - meteor.length * 0.6
        );
        gradient.addColorStop(0, `rgb(255 255 255 / ${meteor.opacity})`);
        gradient.addColorStop(1, 'rgb(255 255 255 / 0)');

        ctx.beginPath();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.moveTo(meteor.x, meteor.y);
        ctx.lineTo(meteor.x - meteor.length, meteor.y - meteor.length * 0.6);
        ctx.stroke();
      });
    };

    tick();
    return () => cancelAnimationFrame(frameRef.current);
  }, [height, width]);

  return (
    <div className={styles.meteorRain} style={{ width, height }}>
      <canvas ref={canvasRef} className={styles.canvas} style={{ width, height }} />
    </div>
  );
};

export default MeteorRain;
