import React, { useEffect, useRef } from 'react';
import { bindVisibilityPause, clamp } from '../_shared/visibility';
import styles from './style/index.module.less';

export interface OrbitalChartItem {
  label: string;
  value: number;
  color: string;
}

export interface OrbitalChartProps {
  data?: OrbitalChartItem[];
  size?: number;
}

const DEFAULT_DATA: OrbitalChartItem[] = [
  { label: 'A', value: 30, color: '#38bdf8' },
  { label: 'B', value: 25, color: '#a78bfa' },
  { label: 'C', value: 20, color: '#f472b6' },
  { label: 'D', value: 25, color: '#4ade80' }
];

const OrbitalChart: React.FC<OrbitalChartProps> = ({ data = DEFAULT_DATA, size = 240 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const total = data.reduce((s, d) => s + d.value, 0) || 1;
    const cx = size / 2;
    const cy = size / 2;
    const maxR = size / 2 - 20;
    const ringGap = maxR / (data.length + 1);

    let frameId = 0;
    let t = 0;
    let paused = document.hidden;
    const unbindVisibility = bindVisibilityPause((hidden) => {
      paused = hidden;
    });

    const draw = () => {
      frameId = requestAnimationFrame(draw);
      if (paused) return;
      t += 0.012;

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, size, size);

      data.forEach((item, i) => {
        const r = ringGap * (i + 1);
        const share = item.value / total;
        const dotCount = clamp(Math.round(share * 12) + 1, 1, 16);
        const speed = 0.4 + i * 0.15;

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgb(148 163 184 / 15%)';
        ctx.lineWidth = 1;
        ctx.stroke();

        for (let j = 0; j < dotCount; j++) {
          const angle = t * speed + (j / dotCount) * Math.PI * 2;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fillStyle = item.color;
          ctx.shadowColor = item.color;
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '12px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.round((data[0]?.value / total) * 100) || 0}%`, cx, cy + 4);
    };

    draw();
    return () => {
      cancelAnimationFrame(frameId);
      unbindVisibility();
    };
  }, [data, size]);

  return (
    <div className={styles.orbitalChart} style={{ width: size, height: size }}>
      <canvas ref={canvasRef} className={styles.canvas} style={{ width: size, height: size }} />
      <ul className={styles.legend}>
        {data.map((d) => (
          <li key={d.label}>
            <span className={styles.swatch} style={{ background: d.color }} />
            {d.label} ({d.value})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrbitalChart;
