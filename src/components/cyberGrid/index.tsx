import React, { useEffect, useRef } from 'react';
import { bindPrefersReducedMotion, bindVisibilityPause, prefersReducedMotion, useCanvasBox } from '@cos-design/shared';
import styles from './style/index.module.less';

export interface CyberGridProps {
  width?: number;
  height?: number;
  /** 为 true 时铺满父容器（父级需有明确高度） */
  fill?: boolean;
  /** 网格线颜色 */
  color?: string;
  /** 移动速度，默认 1 */
  speed?: number;
}

const CyberGrid: React.FC<CyberGridProps> = ({
  width: widthProp,
  height: heightProp,
  fill: fillProp = false,
  color = '#00f0ff',
  speed = 1
}) => {
  const { hostRef, width, height, hostStyle } = useCanvasBox({
    fill: fillProp,
    width: widthProp,
    height: heightProp,
    defaultWidth: 800,
    defaultHeight: 500
  });
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
    let reduced = prefersReducedMotion();
    const unbindVisibility = bindVisibilityPause((hidden) => {
      paused = hidden;
    });
    const unbindMotion = bindPrefersReducedMotion((value) => {
      reduced = value;
    });

    const paintGrid = (animate: boolean) => {
      if (animate) {
        offsetRef.current = (offsetRef.current + speed * 1.5) % gridSpacing;
      }

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

    if (reduced) {
      paintGrid(false);
      return () => {
        unbindVisibility();
        unbindMotion();
      };
    }

    const draw = () => {
      frameRef.current = requestAnimationFrame(draw);
      if (paused) return;
      if (reduced) return;
      paintGrid(true);
    };

    draw();
    return () => {
      cancelAnimationFrame(frameRef.current);
      unbindVisibility();
      unbindMotion();
    };
  }, [color, height, speed, width]);

  return (
    <div ref={hostRef} className={styles.cyberGrid} style={hostStyle}>
      <canvas ref={canvasRef} className={styles.canvas} style={{ width, height }} />
    </div>
  );
};

export default CyberGrid;
