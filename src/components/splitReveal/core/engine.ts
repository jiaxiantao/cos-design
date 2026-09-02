import type { SplitRevealController, SplitRevealOptions } from './types';
const P = 'cos-split-reveal';
const DIRECTIONS = ['fromTop', 'fromBottom', 'fromLeft', 'fromRight'] as const;
const dirClass = (d: string) => `${P}__${d.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
export function createSplitReveal(container: HTMLElement, initial: SplitRevealOptions = {}): SplitRevealController {
  let opts: SplitRevealOptions = { text: 'REVEAL', delay: 80, color: '#f8fafc', ...initial };
  const root = document.createElement('div');
  root.className = P;
  const h1 = document.createElement('h1');
  h1.className = `${P}__text`;
  root.appendChild(h1);
  container.appendChild(root);
  const render = () => {
    h1.style.setProperty('--reveal-color', opts.color ?? '#f8fafc');
    h1.replaceChildren();
    (opts.text ?? 'REVEAL').split('').forEach((char, i) => {
      const s = document.createElement('span');
      const dir = DIRECTIONS[i % DIRECTIONS.length];
      s.className = `${P}__char ${dirClass(dir)}`;
      s.style.animationDelay = `${i * (opts.delay ?? 80)}ms`;
      s.textContent = char === ' ' ? '\u00A0' : char;
      h1.appendChild(s);
    });
  };
  render();
  return {
    update(n) {
      opts = { ...opts, ...n };
      render();
    },
    destroy() {
      root.remove();
    }
  };
}
