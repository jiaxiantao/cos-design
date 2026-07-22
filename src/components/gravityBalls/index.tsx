import React, { useEffect, useRef } from 'react';
import { bindVisibilityPause } from '@cos-design/shared';
import styles from './style/index.module.less';

export interface GravityBallsProps {
  width?: number;
  height?: number;
  ballCount?: number;
}

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
}

const COLORS = ['#38bdf8', '#a78bfa', '#f472b6', '#4ade80', '#fbbf24'];

const GravityBalls: React.FC<GravityBallsProps> = ({ width = 400, height = 300, ballCount = 12 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ballsRef = useRef<Ball[]>([]);

  useEffect(() => {
    ballsRef.current = Array.from({ length: ballCount }, () => ({
      x: Math.random() * (width - 40) + 20,
      y: Math.random() * (height * 0.5) + 10,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 2,
      r: Math.random() * 10 + 8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    }));
  }, [ballCount, height, width]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const gravity = 0.25;
    const damping = 0.99;
    let frameId = 0;
    let paused = document.hidden;
    const unbindVisibility = bindVisibilityPause((hidden) => {
      paused = hidden;
    });

    const tick = () => {
      frameId = requestAnimationFrame(tick);
      if (paused) return;

      const balls = ballsRef.current;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      for (const b of balls) {
        b.vy += gravity;
        b.x += b.vx;
        b.y += b.vy;

        if (b.x - b.r < 0) {
          b.x = b.r;
          b.vx *= -damping;
        } else if (b.x + b.r > width) {
          b.x = width - b.r;
          b.vx *= -damping;
        }
        if (b.y + b.r > height) {
          b.y = height - b.r;
          b.vy *= -damping;
          b.vx *= damping;
        }
        if (b.y - b.r < 0) {
          b.y = b.r;
          b.vy *= -damping;
        }
      }

      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          const a = balls[i];
          const b = balls[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 0.001;
          const minDist = a.r + b.r;
          if (dist < minDist) {
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = minDist - dist;
            a.x -= nx * overlap * 0.5;
            a.y -= ny * overlap * 0.5;
            b.x += nx * overlap * 0.5;
            b.y += ny * overlap * 0.5;
            const dvn = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
            if (dvn > 0) {
              a.vx -= dvn * nx;
              a.vy -= dvn * ny;
              b.vx += dvn * nx;
              b.vy += dvn * ny;
            }
          }
        }
      }

      for (const b of balls) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(b.x - b.r * 0.3, b.y - b.r * 0.3, 0, b.x, b.y, b.r);
        grad.addColorStop(0, '#fff');
        grad.addColorStop(0.3, b.color);
        grad.addColorStop(1, b.color);
        ctx.fillStyle = grad;
        ctx.fill();
      }
    };

    tick();
    return () => {
      cancelAnimationFrame(frameId);
      unbindVisibility();
    };
  }, [height, width]);

  return (
    <div className={styles.gravityBalls} style={{ width, height }}>
      <canvas ref={canvasRef} className={styles.canvas} style={{ width, height }} />
    </div>
  );
};

export default GravityBalls;
