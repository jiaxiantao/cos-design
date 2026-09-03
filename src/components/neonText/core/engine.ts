import type { NeonTextController, NeonTextOptions } from './types';
const P = 'cos-neon-text';
export function createNeonText(
  container: HTMLElement,
  initial: NeonTextOptions = {},
): NeonTextController {
  let opts: NeonTextOptions = {
    text: 'NEON',
    color: '#ff00de',
    fontSize: 72,
    flicker: true,
    ...initial,
  };
  const root = document.createElement('div');
  root.className = P;
  const h1 = document.createElement('h1');
  h1.className = `${P}__text`;
  const reflection = document.createElement('p');
  reflection.className = `${P}__reflection`;
  root.append(h1, reflection);
  container.appendChild(root);
  const render = () => {
    h1.textContent = opts.text ?? 'NEON';
    h1.style.fontSize = `${opts.fontSize ?? 72}px`;
    h1.style.setProperty('--neon-color', opts.color ?? '#ff00de');
    h1.classList.toggle(`${P}__flicker`, opts.flicker ?? true);
    reflection.textContent = opts.text ?? 'NEON';
    reflection.style.fontSize = `${(opts.fontSize ?? 72) * 0.35}px`;
    reflection.style.color = opts.color ?? '#ff00de';
  };
  render();
  return {
    update(n) {
      opts = { ...opts, ...n };
      render();
    },
    destroy() {
      root.remove();
    },
  };
}
