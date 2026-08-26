import React, { useEffect, useRef } from 'react';
import {
  bindPrefersReducedMotion,
  bindVisibilityPause,
  prefersReducedMotion,
  resolveCanvasBoxSize,
  useElementSize
} from '@cos-design/shared';
import styles from './style/index.module.less';

export interface MatrixRainProps {
  width?: number;
  height?: number;
  /** 为 true 时铺满父容器（父级需有明确高度） */
  fill?: boolean;
  /** 列密度 0~1，默认 0.6 */
  density?: number;
  /** 主色调 */
  color?: string;
  /** 是否显示标题叠层，默认 true */
  showOverlay?: boolean;
  /** 叠层标题 */
  title?: string;
  /** 叠层副标题 */
  subtitle?: string;
}

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*アイウエオカキクケコ';

const MatrixRain: React.FC<MatrixRainProps> = ({
  width: widthProp,
  height: heightProp,
  fill = false,
  density = 0.6,
  color = '#00ff41',
  showOverlay = true,
  title = 'MATRIX',
  subtitle = '数字雨效果'
}) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const measured = useElementSize(hostRef, { enabled: fill });
  const { width, height } = resolveCanvasBoxSize({
    fill,
    width: widthProp,
    height: heightProp,
    defaultWidth: 800,
    defaultHeight: 500,
    measured
  });
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

    const fontSize = 16;
    const columns = Math.floor((width / fontSize) * density);
    const drops = Array.from({ length: columns }, () => Math.random() * -50);

    let frameId = 0;
    let paused = document.hidden;
    let reduced = prefersReducedMotion();
    const unbindVisibility = bindVisibilityPause((hidden) => {
      paused = hidden;
    });
    const unbindMotion = bindPrefersReducedMotion((value) => {
      reduced = value;
    });

    const paintFrame = (animate: boolean) => {
      if (animate) {
        ctx.fillStyle = 'rgb(0 0 0 / 8%)';
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);
      }
      ctx.font = `${fontSize}px monospace`;

      drops.forEach((y, i) => {
        const char = CHARSET[Math.floor(Math.random() * CHARSET.length)];
        const x = (i / density) * fontSize;
        ctx.fillStyle = color;
        ctx.fillText(char, x, y * fontSize);

        if (animate) {
          if (y * fontSize > height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i] += 1;
        }
      });
    };

    if (reduced) {
      for (let i = 0; i < drops.length; i++) {
        drops[i] = Math.random() * (height / fontSize);
      }
      paintFrame(false);
      return () => {
        unbindVisibility();
        unbindMotion();
      };
    }

    const draw = () => {
      frameId = requestAnimationFrame(draw);
      if (paused) return;
      if (reduced) return;
      paintFrame(true);
    };

    draw();
    return () => {
      cancelAnimationFrame(frameId);
      unbindVisibility();
      unbindMotion();
    };
  }, [color, density, height, width]);

  return (
    <div
      ref={hostRef}
      className={styles.matrixRain}
      style={fill ? { width: '100%', height: '100%' } : { width, height }}
    >
      <canvas ref={canvasRef} className={styles.canvas} style={{ width, height }} />
      {showOverlay && (
        <div className={styles.overlay}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
      )}
    </div>
  );
};

export default MatrixRain;
