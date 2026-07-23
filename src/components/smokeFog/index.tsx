import React, { useCallback, useEffect, useRef } from 'react';
import { bindVisibilityPause } from '@cos-design/shared';
import styles from './style/index.module.less';

export interface SmokeFogProps {
  width?: number;
  height?: number;
  /** 雾气密度 0~1，默认 0.5；点击/触摸画面可使雾气向外散开 */
  density?: number;
}

interface FogBlob {
  x: number;
  y: number;
  radius: number;
  baseRadius: number;
  vx: number;
  vy: number;
  baseVx: number;
  baseVy: number;
  alpha: number;
  baseAlpha: number;
  /** 个体惯量：越大越难被吹动 */
  mass: number;
  /** 对扰动的敏感度，避免同步反应 */
  receptivity: number;
  phase: number;
}

interface Gust {
  x: number;
  y: number;
  life: number;
  /** 主风向（手挥过空气的偏置，而非完美径向） */
  windAngle: number;
  /** 涡旋方向 */
  swirl: number;
  /** 影响范围沿风向拉长的比例 */
  stretch: number;
  radius: number;
}

const makeBlob = (width: number, height: number): FogBlob => {
  const radius = Math.random() * 80 + 40;
  const vx = (Math.random() - 0.5) * 0.4;
  const vy = (Math.random() - 0.5) * 0.3 - 0.1;
  const alpha = Math.random() * 0.15 + 0.05;
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    radius,
    baseRadius: radius,
    vx,
    vy,
    baseVx: vx,
    baseVy: vy,
    alpha,
    baseAlpha: alpha,
    mass: 0.55 + ((radius - 40) / 80) * 0.9,
    receptivity: 0.45 + Math.random() * 0.9,
    phase: Math.random() * Math.PI * 2
  };
};

/** 椭圆距离：沿风向更易被吹开，侧向衰减更快 */
const ellipticalDist = (dx: number, dy: number, windAngle: number, stretch: number) => {
  const cos = Math.cos(-windAngle);
  const sin = Math.sin(-windAngle);
  const lx = dx * cos - dy * sin;
  const ly = dx * sin + dy * cos;
  return Math.hypot(lx / stretch, ly * stretch);
};

const SmokeFog: React.FC<SmokeFogProps> = ({ width = 800, height = 500, density = 0.5 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blobsRef = useRef<FogBlob[]>([]);
  const gustsRef = useRef<Gust[]>([]);
  const frameRef = useRef(0);

  useEffect(() => {
    const count = Math.floor(20 + density * 40);
    blobsRef.current = Array.from({ length: count }, () => makeBlob(width, height));
  }, [density, height, width]);

  const disperseAt = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * width;
      const y = ((clientY - rect.top) / rect.height) * height;
      gustsRef.current.push({
        x,
        y,
        life: 1,
        windAngle: Math.random() * Math.PI * 2,
        swirl: Math.random() < 0.5 ? -1 : 1,
        stretch: 1.15 + Math.random() * 0.55,
        radius: Math.min(width, height) * (0.28 + Math.random() * 0.12)
      });
    },
    [height, width]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleClick = (e: MouseEvent) => disperseAt(e.clientX, e.clientY);
    const handleTouch = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) disperseAt(touch.clientX, touch.clientY);
    };

    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchstart', handleTouch, { passive: true });

    return () => {
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('touchstart', handleTouch);
    };
  }, [disperseAt]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let time = 0;
    let paused = document.hidden;
    const unbindVisibility = bindVisibilityPause((hidden) => {
      paused = hidden;
    });

    const tick = () => {
      frameRef.current = requestAnimationFrame(tick);
      if (paused) return;

      time += 0.008;
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, width, height);

      const bgGrad = ctx.createRadialGradient(width * 0.5, height * 0.3, 0, width * 0.5, height * 0.5, width * 0.7);
      bgGrad.addColorStop(0, '#2d2d44');
      bgGrad.addColorStop(1, '#1a1a2e');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      const blobs = blobsRef.current;
      const gusts = gustsRef.current;

      for (let g = gusts.length - 1; g >= 0; g--) {
        const gust = gusts[g];
        const pulse = gust.life * gust.life;
        // 首帧冲量大，后续只剩衰减的涡流余波
        const frameScale = gust.life > 0.92 ? 1 : 0.22;

        for (const blob of blobs) {
          const dx = blob.x - gust.x;
          const dy = blob.y - gust.y;
          const ed = ellipticalDist(dx, dy, gust.windAngle, gust.stretch);
          if (ed > gust.radius) continue;

          const falloff = Math.pow(1 - ed / gust.radius, 1.6);
          const jitter = 0.55 + 0.7 * Math.sin(blob.phase * 3.1 + ed * 0.05 + time * 1.7);
          const response = falloff * blob.receptivity * jitter * frameScale;
          if (response < 0.06) continue;

          const dist = Math.hypot(dx, dy) || 1;
          const nx = dx / dist;
          const ny = dy / dist;
          const tx = -ny * gust.swirl;
          const ty = nx * gust.swirl;
          const wx = Math.cos(gust.windAngle);
          const wy = Math.sin(gust.windAngle);

          const inertia = 1 / blob.mass;
          const noise = Math.sin(blob.phase * 5.3 + time * 3.2 + ed * 0.03);
          const noise2 = Math.cos(blob.phase * 2.7 - time * 2.1 + ed * 0.02);
          const radial = response * pulse * (2.4 + noise * 0.8) * inertia;
          const tangential = response * pulse * (1.6 + noise2 * 1.1) * inertia;
          const drift = response * pulse * (1.2 + noise * 0.6) * inertia;
          const turbX = noise * response * pulse * 1.2 * inertia;
          const turbY = noise2 * response * pulse * 1.2 * inertia;

          blob.vx += nx * radial + tx * tangential + wx * drift + turbX;
          blob.vy += ny * radial + ty * tangential + wy * drift + turbY;
          blob.alpha *= 1 - response * pulse * (0.28 + Math.abs(noise) * 0.18);
          blob.radius += blob.baseRadius * response * pulse * (0.1 + Math.abs(noise2) * 0.16);
        }

        gust.life *= 0.88;
        gust.radius *= 1.01;
        if (gust.life < 0.05) gusts.splice(g, 1);
      }

      blobs.forEach((blob, i) => {
        blob.x += blob.vx + Math.sin(time + i + blob.phase) * 0.15;
        blob.y += blob.vy + Math.cos(time * 0.7 + i * 0.5 + blob.phase) * 0.1;

        // 大雾团更快回落到缓慢飘动，小雾团拖尾更久
        const settle = 0.014 + blob.mass * 0.01;
        blob.vx += (blob.baseVx - blob.vx) * settle;
        blob.vy += (blob.baseVy - blob.vy) * settle;
        blob.alpha += (blob.baseAlpha - blob.alpha) * 0.01;
        blob.radius += (blob.baseRadius - blob.radius) * 0.012;

        if (blob.x < -blob.radius) blob.x = width + blob.radius;
        if (blob.x > width + blob.radius) blob.x = -blob.radius;
        if (blob.y < -blob.radius) blob.y = height + blob.radius;
        if (blob.y > height + blob.radius) blob.y = -blob.radius;

        const grad = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.radius);
        grad.addColorStop(0, `rgb(200 200 210 / ${blob.alpha})`);
        grad.addColorStop(0.5, `rgb(160 160 175 / ${blob.alpha * 0.5})`);
        grad.addColorStop(1, 'rgb(160 160 175 / 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    tick();
    return () => {
      cancelAnimationFrame(frameRef.current);
      unbindVisibility();
    };
  }, [height, width]);

  return (
    <div className={styles.smokeFog} style={{ width, height }}>
      <canvas ref={canvasRef} className={styles.canvas} style={{ width, height }} />
    </div>
  );
};

export default SmokeFog;
