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
    if (opts.slotElement) {
      if (opts.slotElement.parentElement !== content) {
        content.replaceChildren();
        content.appendChild(opts.slotElement);
      }
      return;
    }
    // React/Vue portals own the children — do not clear existing nodes
    if (content.childNodes.length > 0) return;
    const ph = document.createElement('span');
    ph.className = `${root.className}__placeholder`;
    ph.textContent = (opts as { defaultContent?: string }).defaultContent ?? '';
    content.replaceChildren(ph);
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
