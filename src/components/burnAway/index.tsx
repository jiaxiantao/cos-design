import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './style/index.module.less';

export interface BurnAwayProps {
  /** 显示文字 */
  text?: string;
  /** 字号 */
  fontSize?: number;
  /** 燃烧完成回调 */
  onComplete?: () => void;
}

const BurnAway: React.FC<BurnAwayProps> = ({ text = 'BURN', fontSize = 64, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [burning, setBurning] = useState(false);
  const [done, setDone] = useState(false);
  const completedRef = useRef(false);

  const startBurn = useCallback(() => {
    if (burning || done) return;
    setBurning(true);
  }, [burning, done]);

  useEffect(() => {
    if (!burning || done) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.ceil(rect.width);
    const h = Math.ceil(rect.height);

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);

    const offscreen = document.createElement('canvas');
    offscreen.width = w * dpr;
    offscreen.height = h * dpr;
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) return;
    offCtx.scale(dpr, dpr);
    offCtx.font = `900 ${fontSize}px system-ui, sans-serif`;
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    offCtx.fillStyle = '#f8fafc';
    offCtx.fillText(text, w / 2, h / 2);

    const imageData = offCtx.getImageData(0, 0, w * dpr, h * dpr);
    const pixels = imageData.data;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      size: number;
    }

    const particles: Particle[] = [];
    const step = 4;

    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const idx = (Math.floor(y * dpr) * w * dpr + Math.floor(x * dpr)) * 4;
        if (pixels[idx + 3] > 128) {
          particles.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 2,
            vy: -Math.random() * 3 - 1,
            life: 1,
            maxLife: 0.6 + Math.random() * 0.6,
            size: 2 + Math.random() * 3
          });
        }
      }
    }

    let frameId = 0;
    let elapsed = 0;
    const duration = 2500;

    const animate = (now: number, prev: number) => {
      const dt = Math.min((now - prev) / 16, 2);
      elapsed += dt * 16;
      ctx.clearRect(0, 0, w, h);

      let alive = 0;
      for (const p of particles) {
        p.life -= (dt * 0.012) / p.maxLife;
        if (p.life <= 0) continue;
        alive++;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 0.04 * dt;

        const alpha = p.life;
        const heat = 1 - p.life;
        const r = Math.min(255, 255);
        const g = Math.max(0, 200 - heat * 200);
        const b = Math.max(0, 80 - heat * 80);

        ctx.globalAlpha = alpha;
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;

      if (elapsed < duration && alive > 0) {
        frameId = requestAnimationFrame((t) => animate(t, now));
      } else {
        setDone(true);
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete?.();
        }
      }
    };

    frameId = requestAnimationFrame((t) => animate(t, t));
    return () => cancelAnimationFrame(frameId);
  }, [burning, done, text, fontSize, onComplete]);

  return (
    <div className={styles.burnAway}>
      <div ref={containerRef} className={styles.stage}>
        {!done && (
          <span className={styles.text} style={{ fontSize, opacity: burning ? 0 : 1 }}>
            {text}
          </span>
        )}
        <canvas ref={canvasRef} className={styles.canvas} />
      </div>
      {!burning && !done && (
        <button type="button" className={styles.trigger} onClick={startBurn}>
          Ignite
        </button>
      )}
      {done && <p className={styles.hint}>Gone.</p>}
    </div>
  );
};

export default BurnAway;
