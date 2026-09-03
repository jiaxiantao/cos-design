import type { TrueFocusController, TrueFocusOptions } from './types';
const P = 'cos-true-focus';
export function createTrueFocus(
  container: HTMLElement,
  initial: TrueFocusOptions = {},
): TrueFocusController {
  let opts: TrueFocusOptions = {
    sentence: 'True Focus',
    separator: ' ',
    manualMode: false,
    blurAmount: 5,
    borderColor: '#22c55e',
    glowColor: 'rgb(34 197 94 / 60%)',
    animationDuration: 0.5,
    pauseBetweenAnimations: 1,
    fontSize: 48,
    color: '#f8fafc',
    ...initial,
  };
  let currentIndex = 0;
  let lastActiveIndex = 0;
  let intervalId = 0;

  const root = document.createElement('div');
  root.className = P;
  const stage = document.createElement('div');
  stage.className = `${P}__stage`;
  const focusFrame = document.createElement('div');
  focusFrame.className = `${P}__focus-frame`;
  for (const c of ['tl', 'tr', 'bl', 'br']) {
    const corner = document.createElement('span');
    corner.className = `${P}__corner ${P}__${c}`;
    focusFrame.appendChild(corner);
  }
  stage.appendChild(focusFrame);
  root.appendChild(stage);
  container.appendChild(root);

  const wordEls: HTMLSpanElement[] = [];

  const updateFocusRect = () => {
    const active = wordEls[currentIndex];
    if (!active) return;
    const parentRect = stage.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    focusFrame.style.transform = `translate(${activeRect.left - parentRect.left}px, ${activeRect.top - parentRect.top}px)`;
    focusFrame.style.width = `${activeRect.width}px`;
    focusFrame.style.height = `${activeRect.height}px`;
    focusFrame.style.opacity = currentIndex >= 0 ? '1' : '0';
  };

  const render = () => {
    stage.style.fontSize = `${opts.fontSize ?? 48}px`;
    stage.style.setProperty('--focus-color', opts.color ?? '#f8fafc');
    stage.style.setProperty('--border-color', opts.borderColor ?? '#22c55e');
    stage.style.setProperty('--glow-color', opts.glowColor ?? 'rgb(34 197 94 / 60%)');
    stage.style.setProperty('--focus-duration', `${opts.animationDuration ?? 0.5}s`);
    wordEls.length = 0;
    stage.querySelectorAll(`.${P}__word`).forEach((el) => el.remove());
    const words = (opts.sentence ?? '').split(opts.separator ?? ' ').filter(Boolean);
    words.forEach((word, index) => {
      const span = document.createElement('span');
      span.className = `${P}__word`;
      span.textContent = word;
      const isActive = index === currentIndex;
      span.style.filter = isActive ? 'blur(0px)' : `blur(${opts.blurAmount ?? 5}px)`;
      span.style.cursor = opts.manualMode ? 'pointer' : 'default';
      span.addEventListener('mouseenter', () => {
        if (!opts.manualMode) return;
        lastActiveIndex = index;
        currentIndex = index;
        render();
      });
      span.addEventListener('mouseleave', () => {
        if (!opts.manualMode) return;
        currentIndex = lastActiveIndex;
        render();
      });
      stage.insertBefore(span, focusFrame);
      wordEls.push(span);
    });
    updateFocusRect();
  };

  const startAuto = () => {
    if (intervalId) clearInterval(intervalId);
    if (opts.manualMode) return;
    const words = (opts.sentence ?? '').split(opts.separator ?? ' ').filter(Boolean);
    if (!words.length) return;
    intervalId = window.setInterval(
      () => {
        currentIndex = (currentIndex + 1) % words.length;
        render();
      },
      ((opts.animationDuration ?? 0.5) + (opts.pauseBetweenAnimations ?? 1)) * 1000,
    );
  };

  render();
  startAuto();

  return {
    update(n) {
      opts = { ...opts, ...n };
      currentIndex = 0;
      render();
      startAuto();
    },
    destroy() {
      if (intervalId) clearInterval(intervalId);
      root.remove();
    },
  };
}
