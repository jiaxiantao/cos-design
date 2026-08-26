import React, { useEffect, useRef } from 'react';
import { bindPrefersReducedMotion, bindVisibilityPause, prefersReducedMotion, useCanvasBox } from '@cos-design/shared';
import styles from './style/index.module.less';

export interface MeteorRainProps {
  width?: number;
  height?: number;
  /** 为 true 时铺满父容器（父级需有明确高度） */
  fill?: boolean;
  /** 流星数量，默认 8 */
  meteorCount?: number;
}

interface Meteor {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
}

const MeteorRain: React.FC<MeteorRainProps> = ({
  width: widthProp,
  height: heightProp,
  fill: fillProp = false,
  meteorCount = 8
}) => {
  const { hostRef, width, height, hostStyle } = useCanvasBox({
    fill: fillProp,
    width: widthProp,
    height: heightProp,
    defaultWidth: 800,
    defaultHeight: 500
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const meteorsRef = useRef<Meteor[]>([]);
  const frameRef = useRef(0);

  useEffect(() => {
    meteorsRef.current = Array.from({ length: meteorCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height * 0.5,
      length: Math.random() * 60 + 40,
      speed: Math.random() * 6 + 4,
      opacity: Math.random() * 0.5 + 0.3
    }));
  }, [height, meteorCount, width]);

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
    let reduced = prefersReducedMotion();
    const unbindVisibility = bindVisibilityPause((hidden) => {
      paused = hidden;
    });
    const unbindMotion = bindPrefersReducedMotion((value) => {
      reduced = value;
    });

    const drawMeteors = (animate: boolean) => {
      if (animate) {
        ctx.fillStyle = 'rgb(15 23 42 / 15%)';
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);
      }

      meteorsRef.current.forEach((meteor) => {
        if (animate) {
          meteor.x += meteor.speed;
          meteor.y += meteor.speed * 0.6;

          if (meteor.x > width + meteor.length || meteor.y > height + meteor.length) {
            meteor.x = -meteor.length;
            meteor.y = Math.random() * height * 0.4;
            meteor.length = Math.random() * 60 + 40;
            meteor.speed = Math.random() * 6 + 4;
            meteor.opacity = Math.random() * 0.5 + 0.3;
          }
        }

        const tailX = meteor.x - meteor.length;
        const tailY = meteor.y - meteor.length * 0.6;

        ctx.beginPath();
        ctx.strokeStyle = `rgb(255 255 255 / ${meteor.opacity})`;
        ctx.lineWidth = 2;
        ctx.moveTo(meteor.x, meteor.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = `rgb(255 255 255 / ${Math.min(1, meteor.opacity + 0.2)})`;
        ctx.arc(meteor.x, meteor.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    if (reduced) {
      drawMeteors(false);
      return () => {
        unbindVisibility();
        unbindMotion();
      };
    }

    const tick = () => {
      frameRef.current = requestAnimationFrame(tick);
      if (paused) return;
      if (reduced) return;
      drawMeteors(true);
    };

    tick();
    return () => {
      cancelAnimationFrame(frameRef.current);
      unbindVisibility();
      unbindMotion();
    };
  }, [height, width]);

  return (
    <div ref={hostRef} className={styles.meteorRain} style={hostStyle}>
      <canvas ref={canvasRef} className={styles.canvas} style={{ width, height }} />
    </div>
  );
};

export default MeteorRain;
