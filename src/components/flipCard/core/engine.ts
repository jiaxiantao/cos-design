import type { FlipCardController, FlipCardOptions } from './types';

const P = 'cos-flip-card';

export function createFlipCard(
  container: HTMLElement,
  initial: FlipCardOptions = {},
): FlipCardController {
  let options: FlipCardOptions = {
    frontTitle: '签到翻牌',
    frontSubtitle: '点击翻开今日奖励',
    backTitle: '恭喜获得',
    backSubtitle: '积分 +20',
    defaultFlipped: false,
    disabled: false,
    ...initial,
  };
  let destroyed = false;
  let uncontrolled = options.defaultFlipped ?? false;
  const onRevealRef = { current: options.onReveal };
  const onFlipChangeRef = { current: options.onFlipChange };

  const root = document.createElement('button');
  root.type = 'button';
  root.className = P;
  const inner = document.createElement('span');
  inner.className = `${P}__inner`;
  const front = document.createElement('span');
  front.className = `${P}__face ${P}__front`;
  const back = document.createElement('span');
  back.className = `${P}__face ${P}__back`;
  const frontKicker = document.createElement('span');
  frontKicker.className = `${P}__kicker`;
  frontKicker.textContent = 'CHECK-IN';
  const frontTitle = document.createElement('span');
  frontTitle.className = `${P}__title`;
  const frontSubtitle = document.createElement('span');
  frontSubtitle.className = `${P}__subtitle`;
  const backKicker = document.createElement('span');
  backKicker.className = `${P}__kicker`;
  backKicker.textContent = 'REWARD';
  const backTitle = document.createElement('span');
  backTitle.className = `${P}__title`;
  const backSubtitle = document.createElement('span');
  backSubtitle.className = `${P}__subtitle`;
  front.append(frontKicker, frontTitle, frontSubtitle);
  back.append(backKicker, backTitle, backSubtitle);
  inner.append(front, back);
  root.appendChild(inner);
  container.appendChild(root);

  const isControlled = () => typeof options.flipped === 'boolean';
  const flipped = () => (isControlled() ? Boolean(options.flipped) : uncontrolled);

  const render = () => {
    const f = flipped();
    root.classList.toggle(`${P}--flipped`, f);
    root.disabled = options.disabled ?? false;
    root.setAttribute('aria-pressed', String(f));
    frontTitle.textContent = options.frontTitle ?? '签到翻牌';
    frontSubtitle.textContent = options.frontSubtitle ?? '点击翻开今日奖励';
    backTitle.textContent = options.backTitle ?? '恭喜获得';
    backSubtitle.textContent = options.backSubtitle ?? '积分 +20';
  };

  const applyFlip = (next: boolean, fromUserReveal: boolean) => {
    if (!isControlled()) uncontrolled = next;
    onFlipChangeRef.current?.(next);
    if (next && fromUserReveal) onRevealRef.current?.();
    render();
  };

  root.addEventListener('click', () => {
    if (options.disabled || flipped()) return;
    applyFlip(true, true);
  });

  render();

  return {
    update(next) {
      options = { ...options, ...next };
      onRevealRef.current = options.onReveal;
      onFlipChangeRef.current = options.onFlipChange;
      render();
    },
    flip() {
      if (options.disabled || flipped()) return;
      applyFlip(true, true);
    },
    reset() {
      applyFlip(false, false);
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      root.remove();
    },
  };
}
