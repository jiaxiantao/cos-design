import type { CountdownController, CountdownOptions } from './types';

const P = 'cos-countdown';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

const DEFAULT_LABELS = { days: '天', hours: '时', minutes: '分', seconds: '秒' };
const UNITS = ['days', 'hours', 'minutes', 'seconds'] as const;

const parseTarget = (target: Date | string | number) => {
  if (target instanceof Date) return target.getTime();
  if (typeof target === 'number') return target;
  return new Date(target).getTime();
};

const calcTimeLeft = (targetMs: number): TimeLeft => {
  const total = Math.max(0, targetMs - Date.now());
  const seconds = Math.floor(total / 1000);
  return {
    total,
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60
  };
};

export function createCountdown(container: HTMLElement, initial: CountdownOptions): CountdownController {
  let options: CountdownOptions = {
    showLabels: true,
    color: '#f472b6',
    invalidText: '无效的目标时间',
    endedText: '时间到！',
    ...initial
  };
  let destroyed = false;
  let timer = 0;
  let ended = false;
  const onEndRef = { current: options.onEnd };

  const root = document.createElement('div');
  root.className = P;
  const unitEls = UNITS.map((key) => {
    const unit = document.createElement('div');
    unit.className = `${P}__unit`;
    const value = document.createElement('div');
    value.className = `${P}__value`;
    const label = document.createElement('span');
    label.className = `${P}__label`;
    unit.append(value, label);
    root.appendChild(unit);
    return { key, value, label };
  });
  const invalidEl = document.createElement('p');
  invalidEl.className = `${P}__invalid`;
  const endedEl = document.createElement('p');
  endedEl.className = `${P}__ended`;
  root.append(invalidEl, endedEl);
  container.appendChild(root);

  const targetMs = () => parseTarget(options.targetDate);
  const isValid = () => !Number.isNaN(targetMs());

  const render = () => {
    root.style.setProperty('--countdown-color', options.color ?? '#f472b6');
    if (!isValid()) {
      invalidEl.textContent = options.invalidText ?? '无效的目标时间';
      invalidEl.hidden = false;
      unitEls.forEach(({ value, label }) => {
        value.hidden = true;
        label.hidden = true;
      });
      endedEl.hidden = true;
      return;
    }
    invalidEl.hidden = true;
    const timeLeft = calcTimeLeft(targetMs());
    const showLabels = options.showLabels ?? true;
    unitEls.forEach(({ key, value, label }) => {
      value.hidden = false;
      value.textContent = String(timeLeft[key]).padStart(2, '0');
      label.hidden = !showLabels;
      label.textContent = options.labels?.[key] ?? DEFAULT_LABELS[key];
    });
    endedEl.textContent = options.endedText ?? '时间到！';
    endedEl.hidden = timeLeft.total > 0;
  };

  const startTimer = () => {
    window.clearInterval(timer);
    ended = false;
    if (!isValid()) {
      render();
      return;
    }
    if (Date.now() >= targetMs()) {
      ended = true;
      onEndRef.current?.();
      render();
      return;
    }
    timer = window.setInterval(() => {
      render();
      if (Date.now() >= targetMs() && !ended) {
        ended = true;
        onEndRef.current?.();
        window.clearInterval(timer);
      }
    }, 1000);
  };

  render();
  startTimer();

  return {
    update(next) {
      options = { ...options, ...next };
      onEndRef.current = options.onEnd;
      render();
      startTimer();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      window.clearInterval(timer);
      root.remove();
    }
  };
}
