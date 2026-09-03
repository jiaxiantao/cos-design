import type { ReturnCityController, ReturnCityOptions } from './types';

const P = 'cos-return-city';

export function createReturnCity(
  container: HTMLElement,
  initial: ReturnCityOptions = {},
): ReturnCityController {
  let options: ReturnCityOptions = { glassCount: 8, glassRadius: 150, ...initial };
  let destroyed = false;
  const timeouts: number[] = [];
  const stars: HTMLElement[] = [];
  const glasses: HTMLElement[] = [];

  const root = document.createElement('div');
  root.className = P;
  const glassWrap = document.createElement('div');
  glassWrap.className = `${P}__glass-wrap`;
  root.appendChild(glassWrap);
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.minHeight = '360px';
  root.style.width = '100%';
  root.style.height = '100%';
  root.style.minHeight = '360px';
  container.appendChild(root);

  const clearAll = () => {
    timeouts.forEach((t) => window.clearTimeout(t));
    timeouts.length = 0;
    stars.forEach((s) => s.remove());
    stars.length = 0;
    glasses.forEach((g) => g.remove());
    glasses.length = 0;
  };

  const spawn = () => {
    clearAll();
    const { width, height } = root.getBoundingClientRect();
    const count = options.starCount ?? Math.max(20, Math.floor(width / 20));
    const glassCount = options.glassCount ?? 8;
    const glassRadius = options.glassRadius ?? 150;

    for (let index = 0; index < count; index++) {
      const timeout = window.setTimeout(() => {
        const star = document.createElement('div');
        star.className = `${P}__star`;
        star.style.top = `${Math.random() * height}px`;
        star.style.left = `${Math.random() * width}px`;
        root.append(star);
        stars.push(star);
      }, Math.random() * 2000);
      timeouts.push(timeout);
    }

    for (let i = 0; i < glassCount; i++) {
      const glass = document.createElement('div');
      glass.className = `${P}__glass-item`;
      glass.style.transform = `rotateY(${i * (360 / glassCount)}deg) translateZ(${glassRadius}px)`;
      glassWrap.appendChild(glass);
      glasses.push(glass);
      const timeout = window.setTimeout(() => {
        glass.style.top = '0px';
        glass.style.opacity = '1';
      }, i * 300);
      timeouts.push(timeout);
    }
  };

  spawn();

  return {
    update(next) {
      options = { ...options, ...next };
      spawn();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      clearAll();
      root.remove();
    },
  };
}
