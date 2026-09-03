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

  const render = () => {
    label.textContent = opts.text ?? '点我试试';
    btn.style.setProperty('--wave-color', opts.color ?? '#38bdf8');
    btn.className = `${P}__btn${opts.className ? ` ${opts.className}` : ''}`.trim();
    if (opts.style) {
      Object.entries(opts.style).forEach(([k, v]) => {
        if (v != null) btn.style.setProperty(k.replace(/([A-Z])/g, '-$1').toLowerCase(), String(v));
      });
    }
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
