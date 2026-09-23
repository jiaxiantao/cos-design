import type { ScrambleTextController, ScrambleTextOptions } from './types';
const P = 'cos-scramble-text';
const DEFAULT_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*';
export function createScrambleText(
  container: HTMLElement,
  initial: ScrambleTextOptions = {},
): ScrambleTextController {
  let opts: ScrambleTextOptions = {
    text: 'DECRYPTED',
    duration: 2000,
    charset: DEFAULT_CHARSET,
    ...initial,
  };
  let frameId = 0;
  let start = 0;
  let cancelled = false;

  const root = document.createElement('div');
  root.className = P;
  const pEl = document.createElement('p');
  pEl.className = `${P}__text`;
  const cursor = document.createElement('span');
  cursor.className = `${P}__cursor`;
  pEl.appendChild(cursor);
  root.appendChild(pEl);
  container.appendChild(root);

  const run = () => {
    cancelled = false;
    if (frameId) cancelAnimationFrame(frameId);
    start = performance.now();
    const chars = (opts.charset?.length ?? 0) > 0 ? opts.charset! : DEFAULT_CHARSET;
    const target = opts.text ?? 'DECRYPTED';

    const tick = (now: number) => {
      if (cancelled) return;
      const elapsed = now - start;
      const progress = Math.min(elapsed / (opts.duration ?? 2000), 1);
      const revealed = Math.floor(progress * target.length);
      const display = target
        .split('')
        .map((char, i) => {
          if (char === ' ') return ' ';
          if (i < revealed) return char;
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');
      if (pEl.firstChild?.nodeType === Node.TEXT_NODE) {
        (pEl.firstChild as Text).data = display;
      } else {
        pEl.insertBefore(document.createTextNode(display), cursor);
      }
      if (pEl.childNodes.length > 2) pEl.childNodes[0]?.remove();
      if (progress < 1) frameId = requestAnimationFrame(tick);
      else {
        pEl.replaceChildren(document.createTextNode(target), cursor);
      }
    };
    frameId = requestAnimationFrame(tick);
  };

  run();

  return {
    update(n) {
      opts = { ...opts, ...n };
      run();
    },
    destroy() {
      cancelled = true;
      cancelAnimationFrame(frameId);
      root.remove();
    },
  };
}
