import type { RotatingTextController, RotatingTextOptions } from './types';
const P = 'cos-rotating-text';
const DEFAULT_TEXTS = ['React', 'Motion', 'Design', 'COS'];

const splitChars = (text: string): string[] => {
  const IntlWith = Intl as typeof Intl & {
    Segmenter?: new (
      l: string,
      o: { granularity: 'grapheme' }
    ) => { segment(i: string): Iterable<{ segment: string }> };
  };
  if (IntlWith.Segmenter) {
    return Array.from(new IntlWith.Segmenter('en', { granularity: 'grapheme' }).segment(text), (s) => s.segment);
  }
  return Array.from(text);
};

export function createRotatingText(container: HTMLElement, initial: RotatingTextOptions = {}): RotatingTextController {
  let opts: RotatingTextOptions = {
    texts: DEFAULT_TEXTS,
    interval: 2200,
    stagger: 40,
    duration: 420,
    fontSize: 56,
    color: '#0f172a',
    highlightColor: '#38bdf8',
    ...initial
  };
  let index = 0;
  let phase: 'enter' | 'exit' = 'enter';
  let exitTimer = 0;
  let swapTimer = 0;
  let cancelled = false;

  const root = document.createElement('div');
  root.className = P;
  const badge = document.createElement('div');
  badge.className = `${P}__badge`;
  root.appendChild(badge);
  container.appendChild(root);

  const safeTexts = () => (opts.texts?.length ? opts.texts! : DEFAULT_TEXTS);

  const render = () => {
    const texts = safeTexts();
    const chars = splitChars(texts[index] ?? '');
    badge.style.fontSize = `${opts.fontSize ?? 56}px`;
    badge.style.color = opts.color ?? '#0f172a';
    badge.style.setProperty('--rt-bg', opts.highlightColor ?? '#38bdf8');
    badge.style.setProperty('--rt-duration', `${opts.duration ?? 420}ms`);
    badge.replaceChildren();
    chars.forEach((char, i) => {
      const s = document.createElement('span');
      s.className = `${P}__char ${phase === 'enter' ? `${P}__enter` : `${P}__exit`}`;
      const delay = phase === 'enter' ? i * (opts.stagger ?? 40) : (chars.length - 1 - i) * (opts.stagger ?? 40);
      s.style.animationDelay = `${delay}ms`;
      s.textContent = char === ' ' ? '\u00A0' : char;
      badge.appendChild(s);
    });
  };

  const clearTimers = () => {
    if (exitTimer) clearTimeout(exitTimer);
    if (swapTimer) clearTimeout(swapTimer);
    exitTimer = swapTimer = 0;
  };

  const schedule = () => {
    clearTimers();
    if (cancelled) return;
    const texts = safeTexts();
    const chars = splitChars(texts[index] ?? '');
    exitTimer = window.setTimeout(() => {
      if (cancelled) return;
      phase = 'exit';
      render();
      swapTimer = window.setTimeout(
        () => {
          if (cancelled) return;
          index = (index + 1) % texts.length;
          phase = 'enter';
          render();
          schedule();
        },
        chars.length * (opts.stagger ?? 40) + (opts.duration ?? 420)
      );
    }, opts.interval ?? 2200);
  };

  render();
  schedule();

  return {
    update(n) {
      opts = { ...opts, ...n };
      index = 0;
      phase = 'enter';
      render();
      schedule();
    },
    destroy() {
      cancelled = true;
      clearTimers();
      root.remove();
    }
  };
}
