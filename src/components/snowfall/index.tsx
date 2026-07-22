import React, { useCallback, useEffect, useRef } from 'react';
import { bindVisibilityPause } from '@cos-design/shared';
import styles from './style/index.module.less';

export interface SnowfallProps {
  width?: number;
  height?: number;
  /** 飘落模式 */
  mode?: 'snow' | 'sakura';
  /** 粒子数量 */
  count?: number;
}

interface Flake {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

const Snowfall: React.FC<SnowfallProps> = ({ width = 800, height = 500, mode = 'snow', count = 120 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flakesRef = useRef<Flake[]>([]);
  const frameRef = useRef(0);

  const createFlake = useCallback(
    (y?: number): Flake => ({
      x: Math.random() * width,
      y: y ?? Math.random() * height,
      size: mode === 'sakura' ? Math.random() * 6 + 4 : Math.random() * 3 + 1,
      speed: Math.random() * 1.5 + 0.5,
      drift: (Math.random() - 0.5) * 0.8,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.04,
      opacity: Math.random() * 0.6 + 0.4
    }),
    [height, mode, width]
  );

  useEffect(() => {
    flakesRef.current = Array.from({ length: count }, () => createFlake());
  }, [count, createFlake]);

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

    const drawSnowflake = (flake: Flake) => {
      ctx.globalAlpha = flake.opacity;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawPetal = (flake: Flake) => {
      ctx.save();
      ctx.translate(flake.x, flake.y);
      ctx.rotate(flake.rotation);
      ctx.globalAlpha = flake.opacity;

      const s = flake.size;
      ctx.fillStyle = '#ffb7c5';
      ctx.beginPath();
      ctx.ellipse(0, 0, s, s * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ff8fa3';
      ctx.beginPath();
      ctx.ellipse(s * 0.3, 0, s * 0.5, s * 0.35, 0.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const tick = () => {
      frameRef.current = requestAnimationFrame(tick);
      if (paused) return;

      ctx.fillStyle = mode === 'sakura' ? '#1a1020' : '#0f172a';
      ctx.fillRect(0, 0, width, height);

      flakesRef.current.forEach((flake) => {
        flake.y += flake.speed;
        flake.x += flake.drift + Math.sin(flake.y * 0.02) * 0.3;
        flake.rotation += flake.rotationSpeed;

        if (flake.y > height + 10) {
          Object.assign(flake, createFlake(-10));
        }

        if (mode === 'sakura') {
          drawPetal(flake);
        } else {
          drawSnowflake(flake);
        }
      });

      ctx.globalAlpha = 1;
    };

    tick();
    return () => {
      cancelAnimationFrame(frameRef.current);
      unbindVisibility();
    };
  }, [createFlake, height, mode, width]);

  return (
    <div className={styles.snowfall} style={{ width, height }}>
      <canvas ref={canvasRef} className={styles.canvas} style={{ width, height }} />
    </div>
  );
};

export default Snowfall;
