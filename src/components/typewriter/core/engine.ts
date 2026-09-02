import type { TypewriterController, TypewriterOptions } from './types';
const P = 'cos-typewriter';
const DEFAULT_TEXTS = ['Hello, cos-design!', '欢迎来到组件库 ✨', 'Build something fun 🚀'];

export function createTypewriter(container: HTMLElement, initial: TypewriterOptions = {}): TypewriterController {
  let opts: TypewriterOptions = { texts: DEFAULT_TEXTS, speed: 100, deleteSpeed: 50, pause: 2000, ...initial };
  let displayText = '';
  let textIndex = 0;
  let isDeleting = false;
  let timerId = 0;
  let cancelled = false;

  const root = document.createElement('div');
  root.className = P;
  const terminal = document.createElement('div');
  terminal.className = `${P}__terminal`;
  const dots = document.createElement('div');
  dots.className = `${P}__dots`;
  for (let i = 0; i < 3; i++) dots.appendChild(document.createElement('span'));
  const pEl = document.createElement('p');
  pEl.className = `${P}__text`;
  const prompt = document.createElement('span');
  prompt.className = `${P}__prompt`;
  prompt.textContent = '>';
  const cursor = document.createElement('span');
  cursor.className = `${P}__cursor`;
  cursor.textContent = '|';
  const textNode = document.createTextNode('');
  pEl.append(prompt, textNode, cursor);
  terminal.append(dots, pEl);
  root.appendChild(terminal);
  container.appendChild(root);

  const safeTexts = () => (opts.texts?.length ? opts.texts! : DEFAULT_TEXTS);

  const tick = () => {
    if (cancelled) return;
    const texts = safeTexts();
    const current = texts[textIndex % texts.length];
    if (!isDeleting && displayText === current) {
      timerId = window.setTimeout(() => {
        isDeleting = true;
        tick();
      }, opts.pause ?? 2000);
    } else if (isDeleting && displayText === '') {
      timerId = window.setTimeout(() => {
        isDeleting = false;
        textIndex = (textIndex + 1) % texts.length;
        tick();
      }, 0);
    } else {
      displayText = isDeleting ? current.slice(0, displayText.length - 1) : current.slice(0, displayText.length + 1);
      textNode.data = displayText;
      timerId = window.setTimeout(tick, isDeleting ? (opts.deleteSpeed ?? 50) : (opts.speed ?? 100));
    }
  };

  tick();

  return {
    update(n) {
      opts = { ...opts, ...n };
      displayText = '';
      textIndex = 0;
      isDeleting = false;
      if (timerId) clearTimeout(timerId);
      textNode.data = '';
      tick();
    },
    destroy() {
      cancelled = true;
      if (timerId) clearTimeout(timerId);
      root.remove();
    }
  };
}
