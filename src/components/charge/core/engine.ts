import { clamp } from '@cos-design/shared';
import type { ChargeController, ChargeOptions } from './types';
const P = 'cos-charge';
const BUBBLE_COUNT = 15;
const CIRCLE_TOP = 10;
const CIRCLE_SIZE = 300;
const MERGE_FROM_TOP = CIRCLE_TOP + CIRCLE_SIZE - 52;

export function createCharge(
  container: HTMLElement,
  initial: ChargeOptions = {},
): ChargeController {
  let opts: ChargeOptions = {
    initQuantity: 0,
    autoCharge: true,
    interval: 500,
    step: 0.01,
    ...initial,
  };
  let innerQuantity = clamp(opts.initQuantity ?? 0, 0, 100);
  const isControlled = () => opts.value !== undefined;
  const quantity = () => clamp(isControlled() ? opts.value! : innerQuantity, 0, 100);
  let completed = quantity() >= 100;
  let chargeTimer = 0;
  let resizeObs: ResizeObserver | null = null;
  const onChangeRef = { current: opts.onChange };
  const onCompleteRef = { current: opts.onComplete };

  const root = document.createElement('div');
  root.className = P;
  const contrast = document.createElement('div');
  contrast.className = `${P}__contrast`;
  for (let i = 0; i < BUBBLE_COUNT; i++) {
    const b = document.createElement('span');
    b.className = `${P}__bubble`;
    b.dataset.index = String(i + 1);
    contrast.appendChild(b);
  }
  const circle = document.createElement('div');
  circle.className = `${P}__circle`;
  const button = document.createElement('div');
  button.className = `${P}__button`;
  contrast.append(circle, button);
  const textEl = document.createElement('div');
  textEl.className = `${P}__text`;
  root.append(contrast, textEl);
  container.appendChild(root);

  const updateHeight = () => {
    const riseMax = Math.max(0, root.clientHeight - MERGE_FROM_TOP);
    root.style.setProperty('--charge-rise-max', `${riseMax}px`);
  };

  const render = () => {
    const q = quantity();
    root.dataset.auto = (opts.autoCharge ?? true) ? 'true' : 'false';
    root.style.setProperty('--charge-pct', String(q));
    textEl.textContent = `${q.toFixed(2)}%`;
    if (q < 100) completed = false;
    else if (!completed) {
      completed = true;
      onCompleteRef.current?.();
    }
  };

  const startCharge = () => {
    if (chargeTimer) clearInterval(chargeTimer);
    if (!(opts.autoCharge ?? true)) return;
    chargeTimer = window.setInterval(() => {
      if (quantity() >= 100) return;
      const next = Math.min(100, Number((quantity() + (opts.step ?? 0.01)).toFixed(2)));
      onChangeRef.current?.(next);
      if (!isControlled()) innerQuantity = next;
      render();
    }, opts.interval ?? 500);
  };

  resizeObs = new ResizeObserver(updateHeight);
  resizeObs.observe(root);
  updateHeight();
  render();
  startCharge();

  return {
    update(n) {
      opts = { ...opts, ...n };
      if (n.onChange !== undefined) onChangeRef.current = n.onChange;
      if (n.onComplete !== undefined) onCompleteRef.current = n.onComplete;
      if (n.initQuantity !== undefined && !isControlled())
        innerQuantity = clamp(n.initQuantity, 0, 100);
      render();
      startCharge();
    },
    destroy() {
      if (chargeTimer) clearInterval(chargeTimer);
      resizeObs?.disconnect();
      root.remove();
    },
  };
}
