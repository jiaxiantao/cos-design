import React, { useCallback, useEffect, useRef } from 'react';
import {
  bindPrefersReducedMotion,
  bindVisibilityPause,
  prefersReducedMotion,
  resolveCanvasBoxSize,
  useElementSize
} from '@cos-design/shared';
import styles from './style/index.module.less';

export interface ParticleNetworkProps {
  width?: number;
  height?: number;
  /** 为 true 时铺满父容器（父级需有明确高度） */
  fill?: boolean;
  /** 粒子数量 */
  particleCount?: number;
  /** 连线距离 */
  linkDistance?: number;
  /** 鼠标排斥半径 */
  repelRadius?: number;
  /** 粒子颜色 */
  color?: string;
  /** 操作提示 */
  hint?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

const ParticleNetwork: React.FC<ParticleNetworkProps> = ({
  width: widthProp,
  height: heightProp,
  fill = false,
  particleCount = 60,
  linkDistance = 120,
  repelRadius = 150,
  color = '#38bdf8',
  hint = '移动鼠标或手指与粒子互动'
}) => {
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
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  const initParticles = useCallback(() => {
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      radius: Math.random() * 2 + 1
    }));
  }, [height, particleCount, width]);

  useEffect(() => {
    initParticles();
  }, [initParticles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let frameId = 0;
    let paused = document.hidden;
    let reduced = prefersReducedMotion();
    const unbindVisibility = bindVisibilityPause((hidden) => {
      paused = hidden;
    });
    const unbindMotion = bindPrefersReducedMotion((value) => {
      reduced = value;
    });

    const paintFrame = (animate: boolean) => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      const particles = particlesRef.current;
      const mouse = mouseRef.current;
      const repelRadiusSq = repelRadius * repelRadius;

      if (animate) {
        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;

          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < repelRadiusSq && distSq > 0) {
            const dist = Math.sqrt(distSq);
            p.vx -= (dx / dist) * 0.15;
            p.vy -= (dy / dist) * 0.15;
          }
        });
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distSq = dx * dx + dy * dy;
          if (distSq < linkDistance * linkDistance) {
            const dist = Math.sqrt(distSq);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = color;
            ctx.globalAlpha = 1 - dist / linkDistance;
            ctx.lineWidth = 0.8;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });
    };

    if (reduced) {
      paintFrame(false);
      return () => {
        unbindVisibility();
        unbindMotion();
      };
    }

    const draw = () => {
      frameId = requestAnimationFrame(draw);
      if (paused) return;
      if (reduced) return;
      paintFrame(true);
    };

    draw();
    return () => {
      cancelAnimationFrame(frameId);
      unbindVisibility();
      unbindMotion();
    };
  }, [color, height, initParticles, linkDistance, repelRadius, width]);

  const updatePointer = (clientX: number, clientY: number, rect: DOMRect) => {
    mouseRef.current = { x: clientX - rect.left, y: clientY - rect.top };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    updatePointer(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect());
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    updatePointer(touch.clientX, touch.clientY, e.currentTarget.getBoundingClientRect());
  };

  const resetPointer = () => {
    mouseRef.current = { x: -1000, y: -1000 };
  };

  return (
    <div
      ref={hostRef}
      className={styles.particleNetwork}
      style={fill ? { width: '100%', height: '100%' } : { width, height }}
    >
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        style={{ width, height }}
        onMouseMove={handleMouseMove}
        onMouseLeave={resetPointer}
        onTouchMove={handleTouchMove}
        onTouchEnd={resetPointer}
      />
      <p className={styles.hint}>{hint}</p>
    </div>
  );
};

export default ParticleNetwork;
