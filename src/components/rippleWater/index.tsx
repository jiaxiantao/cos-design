import React, { useCallback, useEffect, useRef } from 'react';
import { bindVisibilityPause } from '@cos-design/shared';
import styles from './style/index.module.less';

export interface RippleWaterProps {
  width?: number;
  height?: number;
  /** 涟漪颜色 */
  color?: string;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

const RippleWater: React.FC<RippleWaterProps> = ({ width = 800, height = 500, color = '#38bdf8' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ripplesRef = useRef<Ripple[]>([]);
  const frameRef = useRef(0);

  const addRipple = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const maxRadius = Math.max(width, height) * 0.45;
      ripplesRef.current.push({ x, y, radius: 0, maxRadius, alpha: 0.7 });
    },
    [height, width]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleClick = (e: MouseEvent) => addRipple(e.clientX, e.clientY);
    const handleTouch = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) addRipple(touch.clientX, touch.clientY);
    };

    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchstart', handleTouch, { passive: true });

    return () => {
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('touchstart', handleTouch);
    };
  }, [addRipple]);

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

    const tick = () => {
      frameRef.current = requestAnimationFrame(tick);
      if (paused) return;

      ctx.fillStyle = '#0c1929';
      ctx.fillRect(0, 0, width, height);

      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#0f2744');
      gradient.addColorStop(1, '#061018');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      ripplesRef.current = ripplesRef.current.filter((ripple) => {
        ripple.radius += 2.5;
        ripple.alpha -= 0.012;

        if (ripple.alpha <= 0) return false;

        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.globalAlpha = ripple.alpha * (1 - ripple.radius / ripple.maxRadius);
        ctx.lineWidth = 2;
        ctx.stroke();

        if (ripple.radius > 8) {
          ctx.beginPath();
          ctx.arc(ripple.x, ripple.y, ripple.radius * 0.6, 0, Math.PI * 2);
          ctx.strokeStyle = color;
          ctx.globalAlpha = ripple.alpha * 0.4;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        ctx.globalAlpha = 1;
        return true;
      });
    };

    tick();
    return () => {
      cancelAnimationFrame(frameRef.current);
      unbindVisibility();
    };
  }, [color, height, width]);

  return (
    <div className={styles.rippleWater} style={{ width, height }}>
      <canvas ref={canvasRef} className={styles.canvas} style={{ width, height }} />
      <span className={styles.hint}>点击水面产生涟漪</span>
    </div>
  );
};

export default RippleWater;
