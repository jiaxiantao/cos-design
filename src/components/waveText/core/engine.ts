import type { WaveTextController, WaveTextOptions } from './types';
const P = 'cos-wave-text';
export function createWaveText(container: HTMLElement, initial: WaveTextOptions = {}): WaveTextController {
  let opts: WaveTextOptions = { text: 'WAVE', amplitude: 12, color: '#38bdf8', fontSize: 56, ...initial };
  const root = document.createElement('div');
  root.className = P;
  const h1 = document.createElement('h1');
  h1.className = `${P}__text`;
  root.appendChild(h1);
  container.appendChild(root);
  const render = () => {
    h1.style.fontSize = `${opts.fontSize ?? 56}px`;
    h1.style.setProperty('--wave-color', opts.color ?? '#38bdf8');
    h1.style.setProperty('--wave-amp', `${opts.amplitude ?? 12}px`);
    h1.replaceChildren();
    for (const [i, char] of (opts.text ?? 'WAVE').split('').entries()) {
      const s = document.createElement('span');
      s.className = `${P}__char`;
      s.style.animationDelay = `${i * 0.1}s`;
      s.textContent = char === ' ' ? '\u00A0' : char;
      h1.appendChild(s);
    }
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
