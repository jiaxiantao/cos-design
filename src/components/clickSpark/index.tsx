import React, { useCallback, useEffect, useRef } from 'react';
import { bindVisibilityPause } from '@cos-design/shared';
import styles from './style/index.module.less';

export interface ClickSparkProps {
  children?: React.ReactNode;
  /** 火花颜色 */
  color?: string;
  /** 每次点击粒子数，默认 16 */
  count?: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
}

const ClickSpark: React.FC<ClickSparkProps> = ({ children, color = '#fbbf24', count = 16 }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<Spark[]>([]);
  const frameRef = useRef(0);

  const spawnSparks = useCallback(
    (x: number, y: number) => {
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
        const speed = Math.random() * 4 + 2;
        sparksRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          size: Math.random() * 3 + 2
        });
      }
    },
    [count]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const { width, height } = wrap.getBoundingClientRect();
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(wrap);

    let paused = document.hidden;
    const unbind = bindVisibilityPause((hidden) => {
      paused = hidden;
    });

    const tick = () => {
      frameRef.current = requestAnimationFrame(tick);
      if (paused) return;

      const { width, height } = wrap.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);

      sparksRef.current = sparksRef.current.filter((s) => {
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.15;
        s.alpha -= 0.03;
        if (s.alpha <= 0) return false;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = s.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
        return true;
      });
    };

    tick();

    return () => {
      cancelAnimationFrame(frameRef.current);
      observer.disconnect();
      unbind();
    };
  }, [color]);

  const handleClick = (e: React.MouseEvent) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    spawnSparks(e.clientX - rect.left, e.clientY - rect.top);
  };

  return (
    <div ref={wrapRef} className={styles.clickSpark} onClick={handleClick}>
      <canvas ref={canvasRef} className={styles.canvas} />
      {children && <div className={styles.content}>{children}</div>}
      {!children && <p className={styles.hint}>点击任意位置产生火花</p>}
    </div>
  );
};

export default ClickSpark;
