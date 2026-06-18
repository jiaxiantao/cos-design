import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import styles from './style/index.module.less';

export interface FireworksProps {
  width?: number;
  height?: number;
  /** 是否自动燃放，默认 true */
  auto?: boolean;
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

const Fireworks = forwardRef<FireworksHandle, FireworksProps>(({ width = 800, height = 500, auto = true }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rocketsRef = useRef<Rocket[]>([]);
  const frameRef = useRef(0);

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
    const tick = () => {
      frameRef.current = requestAnimationFrame(tick);
      ctx.fillStyle = 'rgb(15 23 42 / 25%)';
      ctx.fillRect(0, 0, width, height);

      if (auto && Math.random() < 0.03) {
        launch();
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
    };

    tick();
    if (auto) {
      timer = window.setInterval(() => launch(), 1200);
    }

    return () => {
      cancelAnimationFrame(frameRef.current);
      clearInterval(timer);
    };
  }, [auto, height, launch, width]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    launch(e.clientX - rect.left);
  };

  return (
    <div className={styles.fireworks} style={{ width, height }}>
      <canvas ref={canvasRef} className={styles.canvas} style={{ width, height }} onClick={handleClick} />
      <p className={styles.hint}>点击画布燃放烟花</p>
    </div>
  );
});

Fireworks.displayName = 'Fireworks';

export default Fireworks;
