import type { WaveButtonController, WaveButtonOptions } from './types';
const P = 'cos-wave-button';
export function createWaveButton(
  container: HTMLElement,
  initial: WaveButtonOptions = {},
): WaveButtonController {
  let opts: WaveButtonOptions = { text: '点我试试', color: '#38bdf8', ...initial };
  const root = document.createElement('div');
  root.className = P;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `${P}__btn`;
  const label = document.createElement('span');
  label.className = `${P}__label`;
  btn.append(
    Object.assign(document.createElement('span'), { className: `${P}__wave` }),
    Object.assign(document.createElement('span'), { className: `${P}__wave` }),
    label,
  );
  root.appendChild(btn);
  container.appendChild(root);

  const applyButtonProps = () => {
    const rest = opts.buttonProps ?? {};
    for (const [key, value] of Object.entries(rest)) {
      if (key === 'className' || key === 'style' || key === 'children') continue;
      if (key.startsWith('on') && typeof value === 'function') {
        const event = key.slice(2).toLowerCase();
        // replace prior listener for this prop key via dataset marker
        const marker = `cosWave${key}`;
        const prev = (btn as unknown as Record<string, EventListener | undefined>)[marker];
        if (prev) btn.removeEventListener(event, prev);
        btn.addEventListener(event, value as EventListener);
        (btn as unknown as Record<string, EventListener>)[marker] = value as EventListener;
        continue;
      }
      if (value == null || value === false) {
        btn.removeAttribute(key === 'disabled' ? 'disabled' : key);
      } else if (value === true) {
        btn.setAttribute(key, '');
      } else {
        btn.setAttribute(key, String(value));
      }
    }
  };

  const render = () => {
    label.textContent = opts.text ?? '点我试试';
    btn.style.setProperty('--wave-color', opts.color ?? '#38bdf8');
    btn.className = `${P}__btn${opts.className ? ` ${opts.className}` : ''}`.trim();
    if (opts.style) {
      Object.entries(opts.style).forEach(([k, v]) => {
        if (v != null) btn.style.setProperty(k.replace(/([A-Z])/g, '-$1').toLowerCase(), String(v));
      });
    }
    applyButtonProps();
  };
  render();

  return {
    update(n) {
      opts = { ...opts, ...n };
      render();
    },
    getButton: () => btn,
    destroy() {
      root.remove();
    },
  };
}
