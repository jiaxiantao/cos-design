import React, { useEffect, useId, useRef } from 'react';
import { bindVisibilityPause, clamp } from '@cos-design/shared';
import styles from './style/index.module.less';

export interface LiquidProgressProps {
  value?: number;
  max?: number;
  size?: number;
  color?: string;
}

const LiquidProgress: React.FC<LiquidProgressProps> = ({ value = 0, max = 100, size = 160, color = '#38bdf8' }) => {
  const waveRef = useRef<SVGPathElement>(null);
  const id = useId().replace(/:/g, '');
  const pct = clamp(max > 0 ? (value / max) * 100 : 0, 0, 100);
  const fillY = 100 - pct;

  useEffect(() => {
    let frame = 0;
    let t = 0;
    let paused = document.hidden;
    const unbindVisibility = bindVisibilityPause((hidden) => {
      paused = hidden;
    });

    const animate = () => {
      if (!paused) {
        t += 0.04;
        const wave = waveRef.current;
        if (wave) {
          const y = fillY + Math.sin(t) * 2;
          wave.setAttribute('d', `M0,${y} Q25,${y - 4 + Math.sin(t * 1.3) * 3} 50,${y} T100,${y} V100 H0 Z`);
        }
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frame);
      unbindVisibility();
    };
  }, [fillY]);

  const stroke = 10;
  const r = 50 - stroke / 2;

  return (
    <div
      className={styles.liquidProgress}
      style={{ width: size, height: size, '--liquid-color': color } as React.CSSProperties}
    >
      <svg viewBox="0 0 100 100" className={styles.svg}>
        <defs>
          <clipPath id={`clip-${id}`}>
            <circle cx="50" cy="50" r={r} />
          </clipPath>
        </defs>
        <circle cx="50" cy="50" r={r} className={styles.track} strokeWidth={stroke} fill="none" />
        <g clipPath={`url(#clip-${id})`}>
          <rect x="0" y="0" width="100" height="100" className={styles.fillBg} />
          <path
            ref={waveRef}
            className={styles.wave}
            d={`M0,${fillY} Q25,${fillY - 4} 50,${fillY} T100,${fillY} V100 H0 Z`}
          />
        </g>
        <circle cx="50" cy="50" r={r} className={styles.ring} strokeWidth={stroke} fill="none" />
      </svg>
      <span className={styles.label}>{Math.round(pct)}%</span>
    </div>
  );
};

export default LiquidProgress;
