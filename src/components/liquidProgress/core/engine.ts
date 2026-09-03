import { bindVisibilityPause, clamp } from '@cos-design/shared';
import type { LiquidProgressController, LiquidProgressOptions } from './types';

const P = 'cos-liquid-progress';

export function createLiquidProgress(
  container: HTMLElement,
  initial: LiquidProgressOptions = {},
): LiquidProgressController {
  let options: LiquidProgressOptions = {
    value: 0,
    max: 100,
    size: 160,
    color: '#38bdf8',
    ...initial,
  };
  let destroyed = false;
  let frame = 0;
  let t = 0;
  let paused = typeof document !== 'undefined' ? document.hidden : false;
  let unbindVisibility: (() => void) | null = null;
  const clipId = `lp-${Math.random().toString(36).slice(2, 9)}`;

  const root = document.createElement('div');
  root.className = P;
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('class', `${P}__svg`);
  const defs = document.createElementNS(svgNS, 'defs');
  const clipPath = document.createElementNS(svgNS, 'clipPath');
  clipPath.setAttribute('id', clipId);
  const clipCircle = document.createElementNS(svgNS, 'circle');
  clipCircle.setAttribute('cx', '50');
  clipCircle.setAttribute('cy', '50');
  clipPath.appendChild(clipCircle);
  defs.appendChild(clipPath);
  const track = document.createElementNS(svgNS, 'circle');
  track.setAttribute('cx', '50');
  track.setAttribute('cy', '50');
  track.setAttribute('class', `${P}__track`);
  track.setAttribute('fill', 'none');
  const g = document.createElementNS(svgNS, 'g');
  const fillBg = document.createElementNS(svgNS, 'rect');
  fillBg.setAttribute('x', '0');
  fillBg.setAttribute('y', '0');
  fillBg.setAttribute('width', '100');
  fillBg.setAttribute('height', '100');
  fillBg.setAttribute('class', `${P}__fill-bg`);
  const wave = document.createElementNS(svgNS, 'path');
  wave.setAttribute('class', `${P}__wave`);
  g.append(fillBg, wave);
  const ring = document.createElementNS(svgNS, 'circle');
  ring.setAttribute('cx', '50');
  ring.setAttribute('cy', '50');
  ring.setAttribute('class', `${P}__ring`);
  ring.setAttribute('fill', 'none');
  svg.append(defs, track, g, ring);
  const label = document.createElement('span');
  label.className = `${P}__label`;
  root.append(svg, label);
  container.appendChild(root);

  const pct = () => {
    const max = options.max ?? 100;
    const value = options.value ?? 0;
    return clamp(max > 0 ? (value / max) * 100 : 0, 0, 100);
  };

  const render = () => {
    const size = options.size ?? 160;
    const color = options.color ?? '#38bdf8';
    const p = pct();
    const fillY = 100 - p;
    const stroke = 10;
    const r = String(50 - stroke / 2);
    root.style.width = `${size}px`;
    root.style.height = `${size}px`;
    root.style.setProperty('--liquid-color', color);
    clipCircle.setAttribute('r', r);
    track.setAttribute('r', r);
    track.setAttribute('stroke-width', String(stroke));
    ring.setAttribute('r', r);
    ring.setAttribute('stroke-width', String(stroke));
    g.setAttribute('clip-path', `url(#${clipId})`);
    wave.setAttribute('d', `M0,${fillY} Q25,${fillY - 4} 50,${fillY} T100,${fillY} V100 H0 Z`);
    label.textContent = `${Math.round(p)}%`;
  };

  const animate = () => {
    if (destroyed) return;
    if (!paused) {
      t += 0.04;
      const fillY = 100 - pct();
      const y = fillY + Math.sin(t) * 2;
      wave.setAttribute(
        'd',
        `M0,${y} Q25,${y - 4 + Math.sin(t * 1.3) * 3} 50,${y} T100,${y} V100 H0 Z`,
      );
    }
    frame = requestAnimationFrame(animate);
  };

  render();
  unbindVisibility = bindVisibilityPause((hidden) => {
    paused = hidden;
  });
  frame = requestAnimationFrame(animate);

  return {
    update(next) {
      options = { ...options, ...next };
      render();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancelAnimationFrame(frame);
      unbindVisibility?.();
      root.remove();
    },
  };
}
