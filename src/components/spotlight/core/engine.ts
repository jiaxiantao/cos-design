import type { SpotlightController, SpotlightOptions } from './types';
const P = 'cos-spotlight';
export function createSpotlight(
  container: HTMLElement,
  initial: SpotlightOptions = {},
): SpotlightController {
  let opts: SpotlightOptions = {
    radius: 120,
    dimColor: 'rgba(0, 0, 0, 0.85)',
    defaultContent: '隐藏内容',
    ...initial,
  };
  const root = document.createElement('div');
  root.className = P;
  const content = document.createElement('div');
  content.className = `${P}__content`;
  const overlay = document.createElement('div');
  overlay.className = `${P}__overlay`;
  root.append(content, overlay);
  container.appendChild(root);

  const onMove = (e: MouseEvent) => {
    const rect = root.getBoundingClientRect();
    root.style.setProperty('--spot-x', `${e.clientX - rect.left}px`);
    root.style.setProperty('--spot-y', `${e.clientY - rect.top}px`);
  };
  root.addEventListener('mousemove', onMove);

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
    // nullish defaultContent = framework adapter will fill via portal/Teleport
    if (opts.defaultContent == null) return;
    const ph = document.createElement('span');
    ph.className = `${root.className}__placeholder`;
    ph.textContent = opts.defaultContent;
    content.replaceChildren(ph);
  };

  const render = () => {
    root.style.setProperty('--spot-radius', `${opts.radius ?? 120}px`);
    root.style.setProperty('--dim-color', opts.dimColor ?? 'rgba(0, 0, 0, 0.85)');
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
      root.removeEventListener('mousemove', onMove);
      root.remove();
    },
  };
}
