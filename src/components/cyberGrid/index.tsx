import React, { useEffect, useRef } from 'react';
import { bindVisibilityPause } from '@cos-design/shared';
import styles from './style/index.module.less';

export interface CyberGridProps {
  width?: number;
  height?: number;
  /** 网格线颜色 */
  color?: string;
  /** 移动速度，默认 1 */
  speed?: number;
}

const CyberGrid: React.FC<CyberGridProps> = ({ width = 800, height = 500, color = '#00f0ff', speed = 1 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const offsetRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const horizonY = height * 0.45;
    const gridSpacing = 40;
    let paused = document.hidden;
    const unbindVisibility = bindVisibilityPause((hidden) => {
      paused = hidden;
    });

    const draw = () => {
      frameRef.current = requestAnimationFrame(draw);
      if (paused) return;

      offsetRef.current = (offsetRef.current + speed * 1.5) % gridSpacing;

      ctx.fillStyle = '#050510';
      ctx.fillRect(0, 0, width, height);

      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGrad.addColorStop(0, '#0a0a20');
      skyGrad.addColorStop(1, '#050510');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, horizonY);

      const vanishX = width / 2;

      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.lineWidth = 1;

      const lineCount = 12;
      for (let i = -lineCount; i <= lineCount; i++) {
        const spread = (i / lineCount) * width * 1.2;
        ctx.beginPath();
        ctx.moveTo(vanishX + spread * 0.05, horizonY);
        ctx.lineTo(vanishX + spread, height);
        ctx.globalAlpha = 0.3 + (1 - Math.abs(i) / lineCount) * 0.5;
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      const rows = Math.ceil(height / gridSpacing) + 2;
      for (let row = 0; row < rows; row++) {
        const progress = (row * gridSpacing + offsetRef.current) / (height - horizonY);
        const y = horizonY + ((progress * (height - horizonY)) % (height - horizonY));
        const perspective = (y - horizonY) / (height - horizonY);
        const alpha = perspective * 0.8;

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.globalAlpha = alpha;
        ctx.stroke();
      }

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      const glowGrad = ctx.createRadialGradient(vanishX, horizonY, 0, vanishX, horizonY, width * 0.4);
      glowGrad.addColorStop(0, `${color}33`);
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);
    };

    draw();
    return () => {
      cancelAnimationFrame(frameRef.current);
      unbindVisibility();
    };
  }, [color, height, speed, width]);

  return (
    <div className={styles.cyberGrid} style={{ width, height }}>
      <canvas ref={canvasRef} className={styles.canvas} style={{ width, height }} />
    </div>
  );
};

export default CyberGrid;
