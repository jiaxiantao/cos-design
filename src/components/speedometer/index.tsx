import React, { useMemo } from 'react';
import { clamp } from '@cos-design/shared';
import styles from './style/index.module.less';

export interface SpeedometerProps {
  value?: number;
  max?: number;
  label?: string;
  color?: string;
}

const polar = (cx: number, cy: number, r: number, deg: number) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

const Speedometer: React.FC<SpeedometerProps> = ({ value = 0, max = 100, label = 'SPEED', color = '#f97316' }) => {
  const pct = clamp(max > 0 ? value / max : 0, 0, 1);
  const angle = -120 + pct * 240;

  const arcPath = useMemo(() => {
    const start = polar(100, 100, 72, -120);
    const end = polar(100, 100, 72, 120);
    return `M ${start.x} ${start.y} A 72 72 0 1 1 ${end.x} ${end.y}`;
  }, []);

  const valueArc = useMemo(() => {
    const start = polar(100, 100, 72, -120);
    const end = polar(100, 100, 72, angle);
    const large = angle - -120 > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A 72 72 0 ${large} 1 ${end.x} ${end.y}`;
  }, [angle]);

  const needleEnd = polar(100, 100, 58, angle);

  return (
    <div className={styles.speedometer} style={{ '--gauge-color': color } as React.CSSProperties}>
      <svg viewBox="0 0 200 130" className={styles.svg}>
        <path d={arcPath} className={styles.track} fill="none" strokeWidth="12" strokeLinecap="round" />
        <path d={valueArc} className={styles.valueArc} fill="none" strokeWidth="12" strokeLinecap="round" />
        {[-120, -60, 0, 60, 120].map((deg) => {
          const inner = polar(100, 100, 58, deg);
          const outer = polar(100, 100, 66, deg);
          return <line key={deg} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} className={styles.tick} />;
        })}
        <line x1="100" y1="100" x2={needleEnd.x} y2={needleEnd.y} className={styles.needle} />
        <circle cx="100" cy="100" r="6" className={styles.hub} />
        <text x="100" y="118" className={styles.valueText}>
          {Math.round(value)}
        </text>
      </svg>
      <span className={styles.label}>{label}</span>
    </div>
  );
};

export default Speedometer;
