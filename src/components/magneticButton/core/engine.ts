import type { MagneticButtonController, MagneticButtonOptions } from './types';
const P = 'cos-magnetic-button';
export function createMagneticButton(
  container: HTMLElement,
  initial: MagneticButtonOptions = {},
): MagneticButtonController {
  let opts: MagneticButtonOptions = {
    strength: 0.4,
    color: '#6366f1',
    defaultContent: '磁吸按钮',
    ...initial,
  };
  const wrap = document.createElement('div');
  wrap.className = P;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `${P}__btn`;
  wrap.appendChild(btn);
  container.appendChild(wrap);

  const mountSlot = () => {
    btn.replaceChildren();
    if (opts.slotElement) {
      btn.appendChild(opts.slotElement);
    } else {
      btn.textContent = opts.defaultContent ?? '磁吸按钮';
    }
  };

  const onMove = (e: MouseEvent) => {
    const rect = wrap.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const s = opts.strength ?? 0.4;
    btn.style.transform = `translate(${(e.clientX - cx) * s}px, ${(e.clientY - cy) * s}px)`;
  };
  const onLeave = () => {
    btn.style.transform = 'translate(0, 0)';
  };

  wrap.addEventListener('mousemove', onMove);
  wrap.addEventListener('mouseleave', onLeave);

  const render = () => {
    btn.style.setProperty('--btn-color', opts.color ?? '#6366f1');
    mountSlot();
  };
  render();

  return {
    update(n) {
      opts = { ...opts, ...n };
      render();
    },
    getSlot: () => btn,
    destroy() {
      wrap.removeEventListener('mousemove', onMove);
      wrap.removeEventListener('mouseleave', onLeave);
      wrap.remove();
    },
  };
}
