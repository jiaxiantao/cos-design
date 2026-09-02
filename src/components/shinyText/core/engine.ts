import type { ShinyTextController, ShinyTextOptions } from './types';
const P = 'cos-shiny-text';
export function createShinyText(container: HTMLElement, initial: ShinyTextOptions = {}): ShinyTextController {
  let opts: ShinyTextOptions = {
    text: 'SHINY TEXT',
    speed: 2,
    color: '#94a3b8',
    shineColor: '#ffffff',
    fontSize: 64,
    disabled: false,
    ...initial
  };
  const root = document.createElement('div');
  root.className = P;
  const span = document.createElement('span');
  span.className = `${P}__text`;
  root.appendChild(span);
  container.appendChild(root);
  const render = () => {
    span.textContent = opts.text ?? 'SHINY TEXT';
    span.style.fontSize = `${opts.fontSize ?? 64}px`;
    span.style.setProperty('--shiny-color', opts.color ?? '#94a3b8');
    span.style.setProperty('--shiny-shine', opts.shineColor ?? '#ffffff');
    span.style.setProperty('--shiny-duration', `${Math.max(opts.speed ?? 2, 0.4)}s`);
    span.classList.toggle(`${P}__paused`, opts.disabled ?? false);
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
