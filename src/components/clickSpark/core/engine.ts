import { bindVisibilityPause } from '@cos-design/shared';
import type { ClickSparkController, ClickSparkOptions } from './types';

const P = 'cos-click-spark';

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
}

export function createClickSpark(
  container: HTMLElement,
  initial: ClickSparkOptions = {},
): ClickSparkController {
  let options: ClickSparkOptions = { color: '#fbbf24', count: 16, ...initial };
  let destroyed = false;
  let frameId = 0;
  let paused = typeof document !== 'undefined' ? document.hidden : false;
  let unbindVisibility: (() => void) | null = null;
  let resizeObs: ResizeObserver | null = null;
  const sparks: Spark[] = [];

  const root = document.createElement('div');
  root.className = P;
  const canvas = document.createElement('canvas');
  canvas.className = `${P}__canvas`;
  const content = document.createElement('div');
  content.className = `${P}__content`;
  const hintEl = document.createElement('p');
  hintEl.className = `${P}__hint`;
  hintEl.textContent = '点击任意位置产生火花';
  root.append(canvas, content, hintEl);
  container.appendChild(root);

  if (options.slotElement && options.slotElement.parentElement !== content) {
    content.appendChild(options.slotElement);
    hintEl.hidden = true;
  } else if (content.childNodes.length > 0) {
    hintEl.hidden = true;
  }

  const resize = () => {
    const dpr = window.devicePixelRatio || 1;
    const { width, height } = root.getBoundingClientRect();
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const spawnSparks = (x: number, y: number) => {
    const count = options.count ?? 16;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
      const speed = Math.random() * 4 + 2;
      sparks.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        size: Math.random() * 3 + 2,
      });
    }
  };

  const onClick = (e: MouseEvent) => {
    const rect = root.getBoundingClientRect();
    spawnSparks(e.clientX - rect.left, e.clientY - rect.top);
  };

  root.addEventListener('click', onClick);

  const tick = () => {
    if (destroyed) return;
    frameId = requestAnimationFrame(tick);
    if (paused) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { width, height } = root.getBoundingClientRect();
    const color = options.color ?? '#fbbf24';
    ctx.clearRect(0, 0, width, height);
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.15;
      s.alpha -= 0.03;
      if (s.alpha <= 0) {
        sparks.splice(i, 1);
        continue;
      }
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = s.alpha;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  resize();
  resizeObs = new ResizeObserver(resize);
  resizeObs.observe(root);
  unbindVisibility = bindVisibilityPause((h) => {
    paused = h;
  });
  tick();

  return {
    getSlot: () => content,
    update(next) {
      if (next.slotElement !== undefined && next.slotElement !== options.slotElement) {
        content.innerHTML = '';
        if (next.slotElement) {
          content.appendChild(next.slotElement);
          hintEl.hidden = true;
        } else {
          hintEl.hidden = false;
        }
      }
      options = { ...options, ...next };
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancelAnimationFrame(frameId);
      unbindVisibility?.();
      resizeObs?.disconnect();
      root.removeEventListener('click', onClick);
      root.remove();
    },
  };
}
