import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { bindPrefersReducedMotion, bindVisibilityPause, prefersReducedMotion } from '@cos-design/shared';
import styles from './style/index.module.less';

export interface ConfettiProps {
  width?: number;
  height?: number;
  /** 挂载后自动播放，默认 true */
  auto?: boolean;
  /** 每次喷射粒子数，默认 120 */
  particleCount?: number;
  /** 画布操作提示 */
  hint?: string;
  /** 粒子全部消散后回调 */
  onComplete?: () => void;
}

export interface ConfettiHandle {
  /** 手动触发彩纸喷射 */
  burst: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  width: number;
  height: number;
  alpha: number;
  gravity: number;
}

const COLORS = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#a66cff', '#ff85c0', '#38bdf8'];

const randomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

const createParticles = (width: number, height: number, count: number): Particle[] => {
  const originX = width / 2;
  const originY = height * 0.6;

  return Array.from({ length: count }, () => {
    const angle = (Math.random() - 0.5) * Math.PI;
    const speed = Math.random() * 12 + 6;
    return {
      x: originX + (Math.random() - 0.5) * 40,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - Math.random() * 8,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      color: randomColor(),
      width: Math.random() * 8 + 4,
      height: Math.random() * 6 + 3,
      alpha: 1,
      gravity: Math.random() * 0.15 + 0.12
    };
  });
};

const Confetti = forwardRef<ConfettiHandle, ConfettiProps>(
  ({ width = 800, height = 400, auto = true, particleCount = 120, hint = '点击画布再次喷射', onComplete }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const frameRef = useRef(0);
    const activeRef = useRef(false);
    const onCompleteRef = useRef(onComplete);
    const sizeRef = useRef({ width, height, particleCount });
    sizeRef.current = { width, height, particleCount };

    useEffect(() => {
      onCompleteRef.current = onComplete;
    }, [onComplete]);

    const burst = useCallback(() => {
      const { width: w, height: h, particleCount: count } = sizeRef.current;
      const reduced = prefersReducedMotion();
      particlesRef.current.push(...createParticles(w, h, reduced ? Math.min(24, count) : count));
      activeRef.current = true;
    }, []);

    useImperativeHandle(ref, () => ({ burst }), [burst]);

    useEffect(() => {
      if (auto) burst();
    }, [auto, burst]);

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

      const tick = () => {
        frameRef.current = requestAnimationFrame(tick);
        if (paused) return;

        ctx.clearRect(0, 0, width, height);

        const fade = reduced ? 0.03 : 0.008;
        particlesRef.current = particlesRef.current.filter((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += p.gravity;
          p.vx *= 0.99;
          p.rotation += p.rotationSpeed;
          p.alpha -= fade;

          if (p.alpha <= 0 || p.y > height + 20) return false;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
          ctx.restore();
          return true;
        });

        if (activeRef.current && particlesRef.current.length === 0) {
          activeRef.current = false;
          onCompleteRef.current?.();
        }
      };

      tick();
      return () => {
        cancelAnimationFrame(frameRef.current);
        unbindVisibility();
        unbindMotion();
      };
    }, [height, width]);

    return (
      <div className={styles.confetti} style={{ width, height }}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          style={{ width, height, touchAction: 'none' }}
          onPointerDown={burst}
        />
        <p className={styles.hint}>{hint}</p>
      </div>
    );
  }
);

Confetti.displayName = 'Confetti';

export default Confetti;
