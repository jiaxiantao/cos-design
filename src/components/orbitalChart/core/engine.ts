import { bindVisibilityPause, clamp } from '@cos-design/shared';
import type { OrbitalChartController, OrbitalChartItem, OrbitalChartOptions } from './types';

const P = 'cos-orbital-chart';

const DEFAULT_DATA: OrbitalChartItem[] = [
  { label: 'A', value: 30, color: '#38bdf8' },
  { label: 'B', value: 25, color: '#a78bfa' },
  { label: 'C', value: 20, color: '#f472b6' },
  { label: 'D', value: 25, color: '#4ade80' }
];

export function createOrbitalChart(container: HTMLElement, initial: OrbitalChartOptions = {}): OrbitalChartController {
  let options: OrbitalChartOptions = { data: DEFAULT_DATA, size: 240, ...initial };
  let destroyed = false;
  let frameId = 0;
  let t = 0;
  let paused = typeof document !== 'undefined' ? document.hidden : false;
  let unbindVisibility: (() => void) | null = null;

  const root = document.createElement('div');
  root.className = P;
  const canvas = document.createElement('canvas');
  canvas.className = `${P}__canvas`;
  const legend = document.createElement('ul');
  legend.className = `${P}__legend`;
  root.append(canvas, legend);
  container.appendChild(root);

  const dataOf = () => (options.data && options.data.length ? options.data : DEFAULT_DATA);

  const syncLegend = () => {
    legend.replaceChildren();
    for (const d of dataOf()) {
      const li = document.createElement('li');
      const swatch = document.createElement('span');
      swatch.className = `${P}__swatch`;
      swatch.style.background = d.color;
      li.append(swatch, document.createTextNode(` ${d.label} (${d.value})`));
      legend.appendChild(li);
    }
  };

  const applyLayout = () => {
    const size = options.size ?? 240;
    root.style.width = `${size}px`;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const draw = () => {
    if (destroyed) return;
    frameId = requestAnimationFrame(draw);
    if (paused) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const data = dataOf();
    if (data.length === 0) return;
    const size = options.size ?? 240;
    t += 0.012;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, size, size);

    const total = data.reduce((s, d) => s + d.value, 0) || 1;
    const cx = size / 2;
    const cy = size / 2;
    const maxR = size / 2 - 20;
    const ringGap = maxR / (data.length + 1);

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

    const dominant = data.reduce((best, item) => (item.value > best.value ? item : best), data[0]);
    const dominantPct = Math.round((dominant.value / total) * 100);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`${dominantPct}%`, cx, cy + 2);
    ctx.font = '10px system-ui';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(dominant.label, cx, cy + 16);
  };

  applyLayout();
  syncLegend();
  unbindVisibility = bindVisibilityPause((hidden) => {
    paused = hidden;
  });
  draw();

  return {
    update(next) {
      options = { ...options, ...next };
      applyLayout();
      syncLegend();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancelAnimationFrame(frameId);
      unbindVisibility?.();
      root.remove();
    }
  };
}
