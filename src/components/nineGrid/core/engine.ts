import { prefersReducedMotion } from '@cos-design/shared';
import type { NineGridController, NineGridItem, NineGridOptions } from './types';

const P = 'cos-nine-grid';

const DEFAULT_ITEMS: NineGridItem[] = [
  { icon: '🎁', label: '谢谢参与' },
  { icon: '🧧', label: '红包 1 元' },
  { icon: '🎫', label: '优惠券' },
  { icon: '☕', label: '咖啡券' },
  { icon: '💎', label: '钻石' },
  { icon: '🎧', label: '耳机' },
  { icon: '📦', label: '神秘礼' },
  { icon: '⭐', label: '积分 x10' },
  { icon: '🏆', label: '大奖' },
];

const normalizeItems = (items: NineGridItem[] | undefined): NineGridItem[] => {
  const list = [...(items?.length ? items : DEFAULT_ITEMS)];
  while (list.length < 9) list.push({ label: `奖品 ${list.length + 1}` });
  return list.slice(0, 9);
};

export function createNineGrid(
  container: HTMLElement,
  initial: NineGridOptions = {},
): NineGridController {
  let options: NineGridOptions = {
    items: DEFAULT_ITEMS,
    buttonText: '开始抽奖',
    spinningText: '抽奖中…',
    disabled: false,
    ...initial,
  };
  let destroyed = false;
  let active: number | null = null;
  let winner: number | null = null;
  let drawing = false;
  const timers: number[] = [];

  const root = document.createElement('div');
  const board = document.createElement('div');
  board.className = `${P}__board`;
  board.setAttribute('role', 'grid');
  board.setAttribute('aria-label', '九宫格抽奖');
  const cells: HTMLDivElement[] = [];
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.setAttribute('role', 'gridcell');
    board.appendChild(cell);
    cells.push(cell);
  }
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `${P}__button`;
  button.dataset.testid = 'nine-grid-draw';
  root.append(board, button);
  container.appendChild(root);

  const clearTimers = () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.length = 0;
  };

  const render = () => {
    root.className = P;
    const list = normalizeItems(options.items);
    list.forEach((item, index) => {
      const cell = cells[index];
      const isActive = active === index;
      const isWinner = winner === index;
      cell.className = `${P}__cell${isActive ? ` ${P}__active` : ''}${isWinner ? ` ${P}__winner` : ''}`;
      cell.replaceChildren();
      if (item.icon) {
        const icon = document.createElement('span');
        icon.className = `${P}__icon`;
        icon.textContent = item.icon;
        cell.appendChild(icon);
      }
      const label = document.createElement('span');
      label.className = `${P}__label`;
      label.textContent = item.label;
      cell.appendChild(label);
    });
    button.disabled = drawing || Boolean(options.disabled);
    button.setAttribute('aria-busy', String(drawing));
    button.textContent = drawing
      ? (options.spinningText ?? '抽奖中…')
      : (options.buttonText ?? '开始抽奖');
  };

  const reset = () => {
    clearTimers();
    drawing = false;
    active = null;
    winner = null;
    render();
  };

  const draw = (override?: number) => {
    if (drawing || options.disabled || destroyed) return;
    clearTimers();
    winner = null;
    drawing = true;
    const cellsList = normalizeItems(options.items);
    const resolved =
      typeof override === 'number'
        ? override
        : typeof options.targetIndex === 'number'
          ? options.targetIndex
          : Math.floor(Math.random() * 9);
    const finalIndex = ((resolved % 9) + 9) % 9;

    if (prefersReducedMotion()) {
      active = finalIndex;
      winner = finalIndex;
      drawing = false;
      render();
      options.onDrawEnd?.(cellsList[finalIndex], finalIndex);
      return;
    }

    const steps = 18 + finalIndex;
    let step = 0;
    const tick = () => {
      if (destroyed) return;
      active = step % 9;
      step += 1;
      if (step > steps) {
        active = finalIndex;
        winner = finalIndex;
        drawing = false;
        render();
        options.onDrawEnd?.(cellsList[finalIndex], finalIndex);
        return;
      }
      render();
      timers.push(window.setTimeout(tick, 60 + Math.floor(step * 12)));
    };
    render();
    tick();
  };

  button.addEventListener('click', () => draw());
  render();

  return {
    update(next) {
      options = { ...options, ...next };
      render();
    },
    draw,
    reset,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      clearTimers();
      root.remove();
    },
  };
}
