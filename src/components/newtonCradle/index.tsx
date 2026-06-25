import React, { useEffect, useRef } from 'react';
import { bindVisibilityPause } from '../_shared/visibility';
import styles from './style/index.module.less';

export interface NewtonCradleProps {
  ballCount?: number;
  color?: string;
  width?: number;
  height?: number;
}

interface Pendulum {
  theta: number;
  omega: number;
}

const NewtonCradle: React.FC<NewtonCradleProps> = ({ ballCount = 5, color = '#38bdf8', width = 280, height = 200 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const count = Math.max(2, Math.min(ballCount, 7));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const ballR = 14;
    const stringLen = height - ballR * 2 - 28;
    const pivotY = 16;
    const spacing = ballR * 2;
    const totalWidth = (count - 1) * spacing;
    const startX = (width - totalWidth) / 2;
    const g = 980;
    const dt = 1 / 60;

    const pendulums: Pendulum[] = Array.from({ length: count }, () => ({ theta: 0, omega: 0 }));
    pendulums[0].theta = -0.52;
    let activeEnd: 'left' | 'right' = 'left';

    const pivotX = (i: number) => startX + i * spacing;

    const ballPos = (i: number) => {
      const p = pendulums[i];
      return {
        x: pivotX(i) + stringLen * Math.sin(p.theta),
        y: pivotY + stringLen * Math.cos(p.theta)
      };
    };

    const transferToRight = (omega: number) => {
      if (activeEnd !== 'left') return;
      activeEnd = 'right';
      pendulums[0].omega = 0;
      pendulums[0].theta = 0;
      pendulums[count - 1].omega = Math.abs(omega);
    };

    const transferToLeft = (omega: number) => {
      if (activeEnd !== 'right') return;
      activeEnd = 'left';
      pendulums[count - 1].omega = 0;
      pendulums[count - 1].theta = 0;
      pendulums[0].omega = -Math.abs(omega);
    };

    const checkCollisions = () => {
      const left = ballPos(0);
      const next = ballPos(1);
      if (left.x + ballR >= next.x - ballR - 0.5 && pendulums[0].omega > 0.02) {
        transferToRight(pendulums[0].omega);
        return;
      }

      const right = ballPos(count - 1);
      const prev = ballPos(count - 2);
      if (right.x - ballR <= prev.x + ballR + 0.5 && pendulums[count - 1].omega < -0.02) {
        transferToLeft(pendulums[count - 1].omega);
      }
    };

    let frameId = 0;
    let paused = document.hidden;
    const unbindVisibility = bindVisibilityPause((hidden) => {
      paused = hidden;
    });

    const tick = () => {
      frameId = requestAnimationFrame(tick);
      if (paused) return;

      for (let i = 0; i < count; i++) {
        const p = pendulums[i];
        if (Math.abs(p.omega) < 1e-5 && Math.abs(p.theta) < 1e-5) continue;

        const alpha = -(g / stringLen) * Math.sin(p.theta);
        p.omega += alpha * dt;
        p.omega *= 0.9998;
        p.theta += p.omega * dt;
      }

      checkCollisions();

      for (let i = 1; i < count - 1; i++) {
        pendulums[i].theta = 0;
        pendulums[i].omega = 0;
      }

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(startX - ballR, pivotY);
      ctx.lineTo(startX + totalWidth + ballR, pivotY);
      ctx.stroke();

      for (let i = 0; i < count; i++) {
        const px = pivotX(i);
        const { x, y } = ballPos(i);

        ctx.beginPath();
        ctx.moveTo(px, pivotY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x, y, ballR, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(x - ballR * 0.3, y - ballR * 0.3, 0, x, y, ballR);
        grad.addColorStop(0, '#fff');
        grad.addColorStop(0.35, color);
        grad.addColorStop(1, color);
        ctx.fillStyle = grad;
        ctx.shadowColor = color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    };

    tick();

    return () => {
      cancelAnimationFrame(frameId);
      unbindVisibility();
    };
  }, [color, count, height, width]);

  return (
    <div className={styles.newtonCradle} style={{ width, height, '--ball-color': color } as React.CSSProperties}>
      <canvas ref={canvasRef} className={styles.canvas} style={{ width, height }} />
    </div>
  );
};

export default NewtonCradle;
