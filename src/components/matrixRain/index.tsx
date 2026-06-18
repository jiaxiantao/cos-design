import React, { useEffect, useRef } from 'react';
import styles from './style/index.module.less';

export interface MatrixRainProps {
  width?: number;
  height?: number;
  /** 列密度 0~1，默认 0.6 */
  density?: number;
  /** 主色调 */
  color?: string;
}

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*アイウエオカキクケコ';

const MatrixRain: React.FC<MatrixRainProps> = ({ width = 800, height = 500, density = 0.6, color = '#00ff41' }) => {
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
    const draw = () => {
      ctx.fillStyle = 'rgb(0 0 0 / 8%)';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = color;
      ctx.font = `${fontSize}px monospace`;

      drops.forEach((y, i) => {
        const char = CHARSET[Math.floor(Math.random() * CHARSET.length)];
        const x = (i / density) * fontSize;
        ctx.fillStyle = color;
        ctx.fillText(char, x, y * fontSize);

        if (y * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 1;
      });

      frameId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(frameId);
  }, [color, density, height, width]);

  return (
    <div className={styles.matrixRain} style={{ width, height }}>
      <canvas ref={canvasRef} className={styles.canvas} style={{ width, height }} />
      <div className={styles.overlay}>
        <h2 className={styles.title}>MATRIX</h2>
        <p className={styles.subtitle}>数字雨效果</p>
      </div>
    </div>
  );
};

export default MatrixRain;
