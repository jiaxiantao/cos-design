import { clamp } from '@cos-design/shared';
import type { ProgressChestController, ProgressChestOptions } from './types';

const P = 'cos-progress-chest';

export function createProgressChest(
  container: HTMLElement,
  initial: ProgressChestOptions = {},
): ProgressChestController {
  let options: ProgressChestOptions = {
    progress: 0,
    label: '开启宝箱',
    openedLabel: '宝箱已开启！',
    ...initial,
  };
  let destroyed = false;
  let opened = false;
  const onOpenRef = { current: options.onOpen };

  const root = document.createElement('div');
  root.className = P;
  const barWrap = document.createElement('div');
  barWrap.className = `${P}__bar-wrap`;
  const barTrack = document.createElement('div');
  barTrack.className = `${P}__bar-track`;
  const barFill = document.createElement('div');
  barFill.className = `${P}__bar-fill`;
  const pctEl = document.createElement('span');
  pctEl.className = `${P}__pct`;
  barTrack.appendChild(barFill);
  barWrap.append(barTrack, pctEl);

  const chest = document.createElement('div');
  chest.className = `${P}__chest`;
  const lid = document.createElement('div');
  lid.className = `${P}__lid`;
  const lidTop = document.createElement('div');
  lidTop.className = `${P}__lid-top`;
  const lock = document.createElement('div');
  lock.className = `${P}__lock`;
  lid.append(lidTop, lock);
  const body = document.createElement('div');
  body.className = `${P}__body`;
  const treasure = document.createElement('div');
  treasure.className = `${P}__treasure`;
  treasure.hidden = true;
  for (const emoji of ['💎', '✨', '🪙']) {
    const span = document.createElement('span');
    span.textContent = emoji;
    treasure.appendChild(span);
  }
  body.appendChild(treasure);
  chest.append(lid, body);

  const labelEl = document.createElement('p');
  labelEl.className = `${P}__label`;
  root.append(barWrap, chest, labelEl);
  container.appendChild(root);

  const render = () => {
    const pct = clamp(options.progress ?? 0, 0, 100);
    const isOpen = pct >= 100;
    barFill.style.width = `${pct}%`;
    pctEl.textContent = `${pct.toFixed(0)}%`;
    chest.classList.toggle(`${P}__chest--open`, isOpen);
    treasure.hidden = !isOpen;
    labelEl.textContent = isOpen
      ? (options.openedLabel ?? '宝箱已开启！')
      : (options.label ?? '开启宝箱');
    if (isOpen && !opened) {
      opened = true;
      onOpenRef.current?.();
    }
    if (!isOpen) opened = false;
  };

  render();

  return {
    update(next) {
      options = { ...options, ...next };
      onOpenRef.current = options.onOpen;
      render();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      root.remove();
    },
  };
}
