import { clamp } from '@cos-design/shared';
import type { TimelinePulseController, TimelinePulseOptions } from './types';
const P = 'cos-timeline-pulse';
export function createTimelinePulse(
  container: HTMLElement,
  initial: TimelinePulseOptions = {},
): TimelinePulseController {
  let opts: TimelinePulseOptions = {
    steps: ['Start', 'Process', 'Review', 'Done'],
    current: 0,
    color: '#22d3ee',
    ...initial,
  };
  const root = document.createElement('div');
  root.className = P;
  const axis = document.createElement('div');
  axis.className = `${P}__axis`;
  const track = document.createElement('div');
  track.className = `${P}__track`;
  const progress = document.createElement('div');
  progress.className = `${P}__progress`;
  const ul = document.createElement('ul');
  ul.className = `${P}__steps`;
  axis.append(track, progress, ul);
  root.appendChild(axis);
  container.appendChild(root);
  const render = () => {
    const steps = opts.steps ?? ['Start', 'Process', 'Review', 'Done'];
    const active = clamp(opts.current ?? 0, 0, Math.max(0, steps.length - 1));
    const ratio = steps.length > 1 ? active / (steps.length - 1) : 0;
    root.style.setProperty('--pulse-color', opts.color ?? '#22d3ee');
    root.style.setProperty('--step-count', String(steps.length));
    root.style.setProperty('--progress-ratio', String(ratio));
    ul.replaceChildren();
    steps.forEach((step, i) => {
      const li = document.createElement('li');
      li.className = `${P}__step`;
      li.dataset.state = i < active ? 'done' : i === active ? 'current' : 'pending';
      const dot = document.createElement('span');
      dot.className = `${P}__dot`;
      const name = document.createElement('span');
      name.className = `${P}__name`;
      name.textContent = step;
      li.append(dot, name);
      ul.appendChild(li);
    });
  };
  render();
  return {
    update(n) {
      opts = { ...opts, ...n };
      render();
    },
    destroy() {
      root.remove();
    },
  };
}
