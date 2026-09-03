import type { SplitTextController, SplitTextOptions } from './types';
const P = 'cos-split-text';
export function createSplitText(
  container: HTMLElement,
  initial: SplitTextOptions = {},
): SplitTextController {
  let opts: SplitTextOptions = {
    text: 'SPLIT TEXT',
    animation: 'fadeUp',
    stagger: 50,
    duration: 500,
    loop: true,
    loopPause: 2400,
    fontSize: 56,
    color: '#f8fafc',
    ...initial,
  };
  let visible = true;
  let hideTimer = 0;
  let showTimer = 0;
  let cancelled = false;

  const root = document.createElement('div');
  root.className = P;
  const textEl = document.createElement('div');
  textEl.className = `${P}__text`;
  root.appendChild(textEl);
  container.appendChild(root);

  const getChars = () => (opts.text ?? '').split('');
  const totalDuration = () => getChars().length * (opts.stagger ?? 50) + (opts.duration ?? 500);

  const render = () => {
    textEl.style.fontSize = `${opts.fontSize ?? 56}px`;
    textEl.style.setProperty('--split-color', opts.color ?? '#f8fafc');
    textEl.style.setProperty('--split-duration', `${opts.duration ?? 500}ms`);
    textEl.replaceChildren();
    const anim = opts.animation ?? 'fadeUp';
    const animClass = `${P}__${anim.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    getChars().forEach((char, i) => {
      const s = document.createElement('span');
      s.className = `${P}__char ${animClass} ${visible ? `${P}__enter` : `${P}__exit`}`;
      s.style.animationDelay = `${i * (opts.stagger ?? 50)}ms`;
      s.textContent = char === ' ' ? '\u00A0' : char;
      textEl.appendChild(s);
    });
  };

  const clearTimers = () => {
    if (hideTimer) window.clearTimeout(hideTimer);
    if (showTimer) window.clearTimeout(showTimer);
    hideTimer = showTimer = 0;
  };

  const startLoop = () => {
    clearTimers();
    cancelled = false;
    if (!(opts.loop ?? true)) return;
    const cycle = () => {
      if (cancelled) return;
      visible = true;
      render();
      hideTimer = window.setTimeout(
        () => {
          if (cancelled) return;
          visible = false;
          render();
          showTimer = window.setTimeout(cycle, Math.max(opts.duration ?? 500, 600));
        },
        totalDuration() + (opts.loopPause ?? 2400),
      );
    };
    cycle();
  };

  render();
  startLoop();

  return {
    update(n) {
      opts = { ...opts, ...n };
      render();
      startLoop();
    },
    destroy() {
      cancelled = true;
      clearTimers();
      root.remove();
    },
  };
}
