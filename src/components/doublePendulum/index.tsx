import React, { useEffect, useRef } from 'react';
import { bindVisibilityPause } from '@cos-design/shared';
import styles from './style/index.module.less';

export interface DoublePendulumProps {
  width?: number;
  height?: number;
  trailLength?: number;
  color?: string;
  color2?: string;
}

const DoublePendulum: React.FC<DoublePendulumProps> = ({
  width = 400,
  height = 400,
  trailLength = 120,
  color = '#38bdf8',
  color2 = '#a78bfa'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    theta1: Math.PI / 2 + 0.1,
    theta2: Math.PI / 2 - 0.2,
    omega1: 0,
    omega2: 0
  });
  const trailRef = useRef<{ x: number; y: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cx = width / 2;
    const cy = height * 0.28;
    const L1 = height * 0.28;
    const L2 = height * 0.26;
    const m1 = 1;
    const m2 = 1;
    const g = 9.8;
    const dt = 0.016;

    let frameId = 0;
    let paused = document.hidden;
    const unbindVisibility = bindVisibilityPause((hidden) => {
      paused = hidden;
    });

    const tick = () => {
      frameId = requestAnimationFrame(tick);
      if (paused) return;

      const s = stateRef.current;
      const { theta1, theta2, omega1, omega2 } = s;
      const sin1 = Math.sin(theta1);
      const sin12 = Math.sin(theta1 - theta2);
      const cos12 = Math.cos(theta1 - theta2);
      const cos1 = Math.cos(theta1);

      const den = L1 * (2 * m1 + m2 - m2 * Math.cos(2 * theta1 - 2 * theta2));
      const num1 =
        -g * (2 * m1 + m2) * sin1 -
        m2 * g * Math.sin(theta1 - 2 * theta2) -
        2 * sin12 * m2 * (omega2 * omega2 * L2 + omega1 * omega1 * L1 * cos12);
      const alpha1 = num1 / den;

      const num2 =
        2 * sin12 * (omega1 * omega1 * L1 * (m1 + m2) + g * (m1 + m2) * cos1 + omega2 * omega2 * L2 * m2 * cos12);
      const alpha2 = num2 / (L2 * (2 * m1 + m2 - m2 * Math.cos(2 * theta1 - 2 * theta2)));

      s.omega1 += alpha1 * dt;
      s.omega2 += alpha2 * dt;
      s.theta1 += s.omega1 * dt;
      s.theta2 += s.omega2 * dt;

      const x1 = cx + L1 * Math.sin(s.theta1);
      const y1 = cy + L1 * Math.cos(s.theta1);
      const x2 = x1 + L2 * Math.sin(s.theta2);
      const y2 = y1 + L2 * Math.cos(s.theta2);

      const trail = trailRef.current;
      trail.push({ x: x2, y: y2 });
      if (trail.length > trailLength) trail.shift();

      ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
      ctx.fillRect(0, 0, width, height);

      if (trail.length > 1) {
        ctx.beginPath();
        trail.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.strokeStyle = color2;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.7;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#94a3b8';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x1, y1, 10, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.beginPath();
      ctx.arc(x2, y2, 10, 0, Math.PI * 2);
      ctx.fillStyle = color2;
      ctx.shadowColor = color2;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);
    tick();

    return () => {
      cancelAnimationFrame(frameId);
      unbindVisibility();
    };
  }, [color, color2, height, trailLength, width]);

  return (
    <div className={styles.doublePendulum} style={{ width, height }}>
      <canvas ref={canvasRef} className={styles.canvas} style={{ width, height }} />
    </div>
  );
};

export default DoublePendulum;
