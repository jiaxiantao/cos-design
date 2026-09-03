import type { CountUpController, CountUpOptions } from './types';

const P = 'cos-count-up';

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

const formatValue = (value: number, decimals: number) =>
  value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

export function createCountUp(container: HTMLElement, initial: CountUpOptions): CountUpController {
  let options: CountUpOptions = {
    start: 0,
    duration: 1400,
    decimals: 0,
    prefix: '',
    suffix: '',
    color: '#34d399',
    ...initial
  };
  let destroyed = false;
  let frameId = 0;
  let fromValue = options.start ?? 0;

  const root = document.createElement('div');
  root.className = P;
  const glow = document.createElement('div');
  glow.className = `${P}__glow`;
  const valueWrap = document.createElement('div');
  valueWrap.className = `${P}__value-wrap`;
  const measureEl = document.createElement('span');
  measureEl.className = `${P}__value ${P}__measure`;
  const displayEl = document.createElement('span');
  displayEl.className = `${P}__value ${P}__display`;
  valueWrap.append(measureEl, displayEl);
  root.append(glow, valueWrap);
  container.appendChild(root);

  const stableText = () => {
    const decimals = options.decimals ?? 0;
    const prefix = options.prefix ?? '';
    const suffix = options.suffix ?? '';
    const candidates = [options.start ?? 0, options.value].map(
      (item) => `${prefix}${formatValue(item, decimals)}${suffix}`
    );
    return candidates.reduce(
      (longest, current) => (current.length > longest.length ? current : longest),
      candidates[0]
    );
  };

  const render = (displayValue: number) => {
    const decimals = options.decimals ?? 0;
    const prefix = options.prefix ?? '';
    const suffix = options.suffix ?? '';
    root.style.setProperty('--count-up-color', options.color ?? '#34d399');
    measureEl.textContent = stableText();
    displayEl.textContent = `${prefix}${formatValue(displayValue, decimals)}${suffix}`;
  };

  const animateTo = (to: number) => {
    cancelAnimationFrame(frameId);
    const from = fromValue;
    const begin = performance.now();
    const duration = Math.max(options.duration ?? 1400, 16);

    const tick = (now: number) => {
      if (destroyed) return;
      const progress = Math.min(1, (now - begin) / duration);
      const current = from + (to - from) * easeOutCubic(progress);
      render(current);
      if (progress < 1) frameId = requestAnimationFrame(tick);
      else fromValue = to;
    };

    frameId = requestAnimationFrame(tick);
  };

  render(fromValue);
  animateTo(options.value);

  return {
    update(next) {
      options = { ...options, ...next };
      if (next.value !== undefined) animateTo(next.value);
      else render(fromValue);
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancelAnimationFrame(frameId);
      root.remove();
    }
  };
}
