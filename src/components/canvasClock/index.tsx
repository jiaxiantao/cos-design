import React, { useCallback, useEffect, useRef } from 'react';
import { bindVisibilityPause } from '../_shared/visibility';
import styles from './style/index.module.less';

export interface CanvasClockProps {
  width?: number;
  height?: number;
}

const CanvasClock: React.FC<CanvasClockProps> = ({ width = 400, height = 400 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = Math.min(width, height);
  const radius = size / 2 - 16;
  const center = size / 2;

  const drawClock = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.clearRect(0, 0, size, size);

      ctx.save();
      ctx.translate(center, center);

      // 外圈
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 分钟刻度
      for (let i = 0; i < 60; i++) {
        const angle = (i / 60) * Math.PI * 2;
        const inner = radius - (i % 5 === 0 ? 14 : 8);
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
        ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
        ctx.strokeStyle = i % 5 === 0 ? '#374151' : '#9ca3af';
        ctx.lineWidth = i % 5 === 0 ? 2 : 1;
        ctx.stroke();
      }

      // 小时数字
      ctx.fillStyle = '#111827';
      ctx.font = `bold ${Math.floor(size / 22)}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 1; i <= 12; i++) {
        const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const textRadius = radius - 32;
        ctx.fillText(String(i), Math.cos(angle) * textRadius, Math.sin(angle) * textRadius);
      }

      const now = new Date();
      const hour = now.getHours() % 12;
      const min = now.getMinutes();
      const sec = now.getSeconds();
      const ms = now.getMilliseconds();

      const drawHand = (angle: number, length: number, width: number, color: string, shadow: string) => {
        ctx.save();
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, width);
        ctx.lineTo(length, 0);
        ctx.lineTo(0, -width);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.shadowColor = shadow;
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.restore();
      };

      const hourAngle = ((hour + min / 60) / 12) * Math.PI * 2 - Math.PI / 2;
      const minAngle = ((min + sec / 60) / 60) * Math.PI * 2 - Math.PI / 2;
      const secAngle = ((sec + ms / 1000) / 60) * Math.PI * 2 - Math.PI / 2;

      drawHand(hourAngle, radius * 0.5, 4, '#111827', 'rgb(0 0 0 / 40%)');
      drawHand(minAngle, radius * 0.72, 3, '#1e80ff', 'rgb(30 128 255 / 40%)');
      drawHand(secAngle, radius * 0.85, 2, '#e9686b', 'rgb(233 104 107 / 40%)');

      // 中心圆点
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#111827';
      ctx.fill();

      ctx.restore();
    },
    [center, radius, size]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let frameId = 0;
    let paused = document.hidden;
    const unbindVisibility = bindVisibilityPause((hidden) => {
      paused = hidden;
    });

    const tick = () => {
      if (!paused) {
        drawClock(ctx);
      }
      frameId = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(frameId);
      unbindVisibility();
    };
  }, [drawClock, size]);

  return (
    <div className={styles.canvasClock} style={{ width: size, height: size }}>
      <canvas ref={canvasRef} className={styles.canvasTarget} style={{ width: size, height: size }} />
    </div>
  );
};

export default CanvasClock;
