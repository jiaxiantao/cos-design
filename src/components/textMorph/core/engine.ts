import { clamp } from '@cos-design/shared';
import type { TextMorphController, TextMorphOptions } from './types';
const P = 'cos-text-morph';
const DEFAULT_TEXTS = ['COS DESIGN', 'TEXT MORPH', 'SMOOTH TRANSITION'];

export function createTextMorph(container: HTMLElement, initial: TextMorphOptions = {}): TextMorphController {
  let opts: TextMorphOptions = {
    texts: DEFAULT_TEXTS,
    interval: 2200,
    duration: 680,
    fontSize: 64,
    color: '#f8fafc',
    ...initial
  };
  let index = 0;
  let progress = 0;
  let frameId = 0;
  let timerId = 0;
  let cancelled = false;

  const root = document.createElement('div');
  root.className = P;
  const stage = document.createElement('div');
  stage.className = `${P}__stage`;
  const currentEl = document.createElement('span');
  currentEl.className = `${P}__layer ${P}__current`;
  const nextEl = document.createElement('span');
  nextEl.className = `${P}__layer ${P}__next`;
  stage.append(currentEl, nextEl);
  root.appendChild(stage);
  container.appendChild(root);

  const safeTexts = () => (opts.texts?.length ? opts.texts! : DEFAULT_TEXTS);

  const applyStyles = () => {
    root.style.setProperty('--morph-color', opts.color ?? '#f8fafc');
    stage.style.fontSize = `${opts.fontSize ?? 64}px`;
    const texts = safeTexts();
    const current = texts[index];
    const next = texts[(index + 1) % texts.length];
    currentEl.textContent = current;
    nextEl.textContent = next;
    currentEl.style.opacity = String(1 - progress);
    nextEl.style.opacity = String(progress);
    currentEl.style.filter = `blur(${progress * 14}px)`;
    nextEl.style.filter = `blur(${(1 - progress) * 14}px)`;
    currentEl.style.transform = `scale(${1 - progress * 0.08}) translateY(${progress * -8}px)`;
    nextEl.style.transform = `scale(${0.92 + progress * 0.08}) translateY(${(1 - progress) * 8}px)`;
  };

  const schedule = () => {
    if (cancelled) return;
    timerId = window.setTimeout(() => {
      const start = performance.now();
      const animate = (now: number) => {
        if (cancelled) return;
        progress = clamp((now - start) / Math.max(opts.duration ?? 680, 16), 0, 1);
        applyStyles();
        if (progress < 1) frameId = requestAnimationFrame(animate);
        else {
          index = (index + 1) % safeTexts().length;
          progress = 0;
          applyStyles();
          schedule();
        }
      };
      frameId = requestAnimationFrame(animate);
    }, opts.interval ?? 2200);
  };

  applyStyles();
  schedule();

  return {
    update(n) {
      opts = { ...opts, ...n };
      index = 0;
      progress = 0;
      if (timerId) clearTimeout(timerId);
      cancelAnimationFrame(frameId);
      applyStyles();
      schedule();
    },
    destroy() {
      cancelled = true;
      clearTimeout(timerId);
      cancelAnimationFrame(frameId);
      root.remove();
    }
  };
}
