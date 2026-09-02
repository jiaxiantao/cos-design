import type { HolographicCardController, HolographicCardOptions } from './types';
const P = 'cos-holographic-card';
export function createHolographicCard(
  container: HTMLElement,
  initial: HolographicCardOptions = {}
): HolographicCardController {
  let opts: HolographicCardOptions = { title: '全息卡片', subtitle: '移动鼠标体验 3D 效果', ...initial };
  const root = document.createElement('div');
  root.className = `${P}__wrap`;
  const card = document.createElement('div');
  card.className = `${P}__card`;
  const shine = document.createElement('div');
  shine.className = `${P}__shine`;
  const info = document.createElement('div');
  info.className = `${P}__info`;
  const h3 = document.createElement('h3');
  const pEl = document.createElement('p');
  info.append(h3, pEl);
  card.append(shine, info);
  root.appendChild(card);
  container.appendChild(root);
  let mediaEl: HTMLElement | null = null;

  const onMove = (e: MouseEvent) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.setProperty('--rx', `${-y * 20}deg`);
    card.style.setProperty('--ry', `${x * 20}deg`);
    card.style.setProperty('--gx', `${(x + 0.5) * 100}%`);
    card.style.setProperty('--gy', `${(y + 0.5) * 100}%`);
  };
  const onLeave = () => {
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
    card.style.setProperty('--gx', '50%');
    card.style.setProperty('--gy', '50%');
  };
  card.addEventListener('mousemove', onMove);
  card.addEventListener('mouseleave', onLeave);

  const render = () => {
    if (mediaEl) {
      mediaEl.remove();
      mediaEl = null;
    }
    if (opts.image) {
      const img = document.createElement('img');
      img.className = `${P}__image`;
      img.src = opts.image;
      img.alt = opts.title ?? '';
      mediaEl = img;
    } else {
      const ph = document.createElement('div');
      ph.className = P;
      const span = document.createElement('span');
      span.textContent = '✦';
      ph.appendChild(span);
      mediaEl = ph;
    }
    card.insertBefore(mediaEl, shine);
    h3.textContent = opts.title ?? '';
    pEl.textContent = opts.subtitle ?? '';
  };
  render();

  return {
    update(n) {
      opts = { ...opts, ...n };
      render();
    },
    destroy() {
      card.removeEventListener('mousemove', onMove);
      card.removeEventListener('mouseleave', onLeave);
      root.remove();
    }
  };
}
