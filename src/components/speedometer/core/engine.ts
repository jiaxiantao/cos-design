import { clamp } from '@cos-design/shared';
import type { SpeedometerController, SpeedometerOptions } from './types';

const P = 'cos-speedometer';

const polar = (cx: number, cy: number, r: number, deg: number) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

export function createSpeedometer(
  container: HTMLElement,
  initial: SpeedometerOptions = {},
): SpeedometerController {
  let options: SpeedometerOptions = {
    value: 0,
    max: 100,
    label: 'SPEED',
    color: '#f97316',
    ...initial,
  };
  let destroyed = false;

  const root = document.createElement('div');
  root.className = P;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 200 130');
  svg.classList.add(`${P}__svg`);

  const track = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  track.classList.add(`${P}__track`);
  track.setAttribute('fill', 'none');
  track.setAttribute('stroke-width', '12');
  track.setAttribute('stroke-linecap', 'round');

  const valueArc = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  valueArc.classList.add(`${P}__value-arc`);
  valueArc.setAttribute('fill', 'none');
  valueArc.setAttribute('stroke-width', '12');
  valueArc.setAttribute('stroke-linecap', 'round');

  const needle = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  needle.classList.add(`${P}__needle`);

  const hub = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  hub.classList.add(`${P}__hub`);
  hub.setAttribute('cx', '100');
  hub.setAttribute('cy', '100');
  hub.setAttribute('r', '6');

  const valueText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  valueText.classList.add(`${P}__value-text`);
  valueText.setAttribute('x', '100');
  valueText.setAttribute('y', '118');

  const ticks: SVGLineElement[] = [];
  for (const deg of [-120, -60, 0, 60, 120]) {
    const inner = polar(100, 100, 58, deg);
    const outer = polar(100, 100, 66, deg);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.classList.add(`${P}__tick`);
    line.setAttribute('x1', String(inner.x));
    line.setAttribute('y1', String(inner.y));
    line.setAttribute('x2', String(outer.x));
    line.setAttribute('y2', String(outer.y));
    ticks.push(line);
  }

  svg.append(track, valueArc, ...ticks, needle, hub, valueText);
  const labelEl = document.createElement('span');
  labelEl.className = `${P}__label`;
  root.append(svg, labelEl);
  container.appendChild(root);

  const arcPath = () => {
    const start = polar(100, 100, 72, -120);
    const end = polar(100, 100, 72, 120);
    return `M ${start.x} ${start.y} A 72 72 0 1 1 ${end.x} ${end.y}`;
  };

  const render = () => {
    const value = options.value ?? 0;
    const max = options.max ?? 100;
    const pct = clamp(max > 0 ? value / max : 0, 0, 1);
    const angle = -120 + pct * 240;
    root.style.setProperty('--gauge-color', options.color ?? '#f97316');
    labelEl.textContent = options.label ?? 'SPEED';
    track.setAttribute('d', arcPath());
    const start = polar(100, 100, 72, -120);
    const end = polar(100, 100, 72, angle);
    const large = angle - -120 > 180 ? 1 : 0;
    valueArc.setAttribute('d', `M ${start.x} ${start.y} A 72 72 0 ${large} 1 ${end.x} ${end.y}`);
    const needleEnd = polar(100, 100, 58, angle);
    needle.setAttribute('x1', '100');
    needle.setAttribute('y1', '100');
    needle.setAttribute('x2', String(needleEnd.x));
    needle.setAttribute('y2', String(needleEnd.y));
    valueText.textContent = String(Math.round(value));
  };

  render();

  return {
    update(next) {
      options = { ...options, ...next };
      render();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      root.remove();
    },
  };
}
