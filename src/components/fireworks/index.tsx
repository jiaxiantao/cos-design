import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import {
  bindPrefersReducedMotion,
  bindVisibilityPause,
  getRelativePointerPosition,
  prefersReducedMotion,
  resolveCanvasBoxSize,
  useElementSize
} from '@cos-design/shared';
import styles from './style/index.module.less';

export interface FireworksProps {
  width?: number;
  height?: number;
  /** 为 true 时铺满父容器（父级需有明确高度） */
  fill?: boolean;
  /** 是否自动燃放，默认 true */
  auto?: boolean;
  /** 画布操作提示 */
  hint?: string;
  /** 画面空闲（无火箭/粒子）时回调 */
  onComplete?: () => void;
}

export interface FireworksHandle {
  /** 手动燃放烟花，可指定 x 坐标 */
  launch: (x?: number) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  decay: number;
}

interface Rocket {
  x: number;
  y: number;
  vy: number;
  targetY: number;
  color: string;
  exploded: boolean;
  particles: Particle[];
  age: number;
}

const COLORS = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#a66cff', '#ff85c0'];
const GRAVITY = 0.12;
const MAX_ROCKET_AGE = 240;

const randomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

const createExplosion = (x: number, y: number, color: string): Particle[] => {
  const count = 60 + Math.floor(Math.random() * 30);
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 4 + 2;
    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      alpha: 1,
      color: Math.random() > 0.3 ? color : randomColor(),
      decay: Math.random() * 0.015 + 0.01
    };
  });
};

const Fireworks = forwardRef<FireworksHandle, FireworksProps>((props, ref) => {
  const {
    width: widthProp,
    height: heightProp,
    fill = false,
    auto = true,
    hint = '点击画布燃放烟花',
    onComplete
  } = props;
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
  const rocketsRef = useRef<Rocket[]>([]);
  const frameRef = useRef(0);
  const activeRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const launch = useCallback(
    (x?: number) => {
      const startX = x ?? Math.random() * width * 0.6 + width * 0.2;
      rocketsRef.current.push({
        x: startX,
        y: height,
        vy: -(Math.random() * 4 + 6),
        targetY: Math.random() * height * 0.35 + height * 0.15,
        color: randomColor(),
        exploded: false,
        particles: [],
        age: 0
      });
      activeRef.current = true;
    },
    [height, width]
  );

  useImperativeHandle(ref, () => ({ launch }), [launch]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let timer = 0;
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

      ctx.fillStyle = 'rgb(15 23 42 / 25%)';
      ctx.fillRect(0, 0, width, height);

      if (reduced) {
        if (activeRef.current && rocketsRef.current.length === 0) {
          activeRef.current = false;
          onCompleteRef.current?.();
        }
        return;
      }

      rocketsRef.current = rocketsRef.current.filter((rocket) => {
        if (!rocket.exploded) {
          rocket.age += 1;
          rocket.y += rocket.vy;
          rocket.vy += GRAVITY;
          ctx.beginPath();
          ctx.arc(rocket.x, rocket.y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = rocket.color;
          ctx.fill();

          const atApex = rocket.vy >= 0;
          const reachedTarget = rocket.y <= rocket.targetY;
          const outOfBounds = rocket.y < 0;
          const timedOut = rocket.age >= MAX_ROCKET_AGE;

          if (atApex || reachedTarget || outOfBounds || timedOut) {
            rocket.exploded = true;
            rocket.particles = createExplosion(rocket.x, rocket.y, rocket.color);
          }
          return true;
        }

        rocket.particles = rocket.particles.filter((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.06;
          p.alpha -= p.decay;
          if (p.alpha <= 0) return false;

          ctx.beginPath();
          ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.fill();
          ctx.globalAlpha = 1;
          return true;
        });

        return rocket.particles.length > 0;
      });

      if (activeRef.current && rocketsRef.current.length === 0) {
        activeRef.current = false;
        onCompleteRef.current?.();
      }
    };

    tick();
    if (auto && !reduced) {
      timer = window.setInterval(() => launch(), 1200);
    } else if (auto && reduced) {
      launch();
    }

    return () => {
      cancelAnimationFrame(frameRef.current);
      clearInterval(timer);
      unbindVisibility();
      unbindMotion();
    };
  }, [auto, height, launch, width]);

  const handlePointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pos = getRelativePointerPosition(e.currentTarget, e.nativeEvent);
    if (pos) launch(pos.x);
  };

  return (
    <div
      ref={hostRef}
      className={styles.fireworks}
      style={fill ? { width: '100%', height: '100%' } : { width, height }}
    >
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        style={{ width, height, touchAction: 'none' }}
        onPointerDown={handlePointer}
      />
      <p className={styles.hint}>{hint}</p>
    </div>
  );
});

Fireworks.displayName = 'Fireworks';

export default Fireworks;
