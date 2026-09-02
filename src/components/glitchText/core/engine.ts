import type { GlitchTextController, GlitchTextOptions } from './types';
const P = 'cos-glitch-text';
export function createGlitchText(container: HTMLElement, initial: GlitchTextOptions = {}): GlitchTextController {
  let opts: GlitchTextOptions = {
    text: 'GLITCH',
    color: '#f8fafc',
    glitchColor1: '#ff00de',
    glitchColor2: '#00f0ff',
    fontSize: 64,
    ...initial
  };
  const root = document.createElement('div');
  root.className = P;
  const h1 = document.createElement('h1');
  h1.className = `${P}__text`;
  root.appendChild(h1);
  container.appendChild(root);
  const render = () => {
    const t = opts.text ?? 'GLITCH';
    h1.textContent = t;
    h1.setAttribute('data-text', t);
    h1.style.fontSize = `${opts.fontSize ?? 64}px`;
    h1.style.setProperty('--glitch-color', opts.color ?? '#f8fafc');
    h1.style.setProperty('--glitch-c1', opts.glitchColor1 ?? '#ff00de');
    h1.style.setProperty('--glitch-c2', opts.glitchColor2 ?? '#00f0ff');
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
