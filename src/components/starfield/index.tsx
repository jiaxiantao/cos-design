import React, { useEffect, useRef } from 'react';
import { bindPrefersReducedMotion, bindVisibilityPause, prefersReducedMotion, useCanvasBox } from '@cos-design/shared';
import styles from './style/index.module.less';

export interface StarfieldProps {
  width?: number;
  height?: number;
  /** 为 true 时铺满父容器（父级需有明确高度） */
  fill?: boolean;
  /** 星星数量 */
  starCount?: number;
  /** 飞行速度，默认 1 */
  speed?: number;
}

interface Star {
  x: number;
  y: number;
  z: number;
}

const Starfield: React.FC<StarfieldProps> = ({
  width: widthProp,
  height: heightProp,
  fill: fillProp = false,
  starCount = 400,
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
  const starsRef = useRef<Star[]>([]);
  const frameRef = useRef(0);

  useEffect(() => {
    starsRef.current = Array.from({ length: starCount }, () => ({
      x: (Math.random() - 0.5) * width,
      y: (Math.random() - 0.5) * height,
      z: Math.random() * width
    }));
  }, [height, starCount, width]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const centerX = width / 2;
    const centerY = height / 2;
    let paused = document.hidden;
    let reduced = prefersReducedMotion();
    const unbindVisibility = bindVisibilityPause((hidden) => {
      paused = hidden;
    });
    const unbindMotion = bindPrefersReducedMotion((value) => {
      reduced = value;
    });

    const drawStars = (animateZ: boolean) => {
      ctx.fillStyle = 'rgb(0 0 0 / 25%)';
      ctx.fillRect(0, 0, width, height);

      starsRef.current.forEach((star) => {
        if (animateZ) {
          star.z -= speed * 2;

          if (star.z <= 0) {
            star.x = (Math.random() - 0.5) * width;
            star.y = (Math.random() - 0.5) * height;
            star.z = width;
          }
        }

        const k = 128 / star.z;
        const px = star.x * k + centerX;
        const py = star.y * k + centerY;

        if (px < 0 || px >= width || py < 0 || py >= height) return;

        const size = (1 - star.z / width) * 3;
        const brightness = (1 - star.z / width) * 255;

        if (animateZ && size > 0.5) {
          const prevK = 128 / (star.z + speed * 4);
          const prevPx = star.x * prevK + centerX;
          const prevPy = star.y * prevK + centerY;

          ctx.beginPath();
          ctx.strokeStyle = `rgb(${brightness} ${brightness} ${brightness + 30})`;
          ctx.lineWidth = size;
          ctx.moveTo(prevPx, prevPy);
          ctx.lineTo(px, py);
          ctx.stroke();
        } else {
          ctx.fillStyle = `rgb(${brightness} ${brightness} ${brightness + 30})`;
          ctx.fillRect(px, py, Math.max(size, 0.5), Math.max(size, 0.5));
        }
      });
    };

    if (reduced) {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);
      drawStars(false);
      return () => {
        unbindVisibility();
        unbindMotion();
      };
    }

    const tick = () => {
      frameRef.current = requestAnimationFrame(tick);
      if (paused) return;
      if (reduced) return;
      drawStars(true);
    };

    tick();
    return () => {
      cancelAnimationFrame(frameRef.current);
      unbindVisibility();
      unbindMotion();
    };
  }, [height, speed, starCount, width]);

  return (
    <div ref={hostRef} className={styles.starfield} style={hostStyle}>
      <canvas ref={canvasRef} className={styles.canvas} style={{ width, height }} />
    </div>
  );
};

export default Starfield;
