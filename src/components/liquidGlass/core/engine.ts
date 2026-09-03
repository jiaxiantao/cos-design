import type { LiquidGlassController, LiquidGlassOptions } from './types';
const P = 'cos-liquid-glass';
export function createLiquidGlass(
  container: HTMLElement,
  initial: LiquidGlassOptions = {},
): LiquidGlassController {
  let opts: LiquidGlassOptions = {
    blur: 16,
    borderRadius: 20,
    defaultContent: '液态玻璃面板',
    ...initial,
  };
  const root = document.createElement('div');
  root.className = P;
  const panel = document.createElement('div');
  panel.className = `${P}__panel`;
  const content = document.createElement('div');
  content.className = `${P}__content`;
  panel.appendChild(content);
  root.appendChild(panel);
  container.appendChild(root);

  const mountSlot = () => {
    content.replaceChildren();
    if (opts.slotElement) {
      content.appendChild(opts.slotElement);
    } else {
      content.textContent = opts.defaultContent ?? '液态玻璃面板';
    }
  };

  const render = () => {
    panel.style.setProperty('--glass-blur', `${opts.blur ?? 16}px`);
    panel.style.setProperty('--glass-radius', `${opts.borderRadius ?? 20}px`);
    mountSlot();
  };
  render();

  return {
    update(n) {
      opts = { ...opts, ...n };
      render();
    },
    getSlot: () => content,
    destroy() {
      root.remove();
    },
  };
}
