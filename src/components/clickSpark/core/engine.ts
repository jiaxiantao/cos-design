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
  let options: ClickSparkOptions = {
    color: '#fbbf24',
    count: 16,
    defaultContent: '点击任意位置产生火花',
    ...initial,
  };
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
  root.append(canvas, content, hintEl);
  container.appendChild(root);

  /** True when React/Vue portal or slotElement left real content (ignore empty Teleport text nodes). */
  const hasSlottedContent = () => {
    if (options.slotElement) return true;
    if (content.children.length > 0) return true;
    for (const node of content.childNodes) {
      if (node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim()) return true;
    }
    return false;
  };

  /** v3: show hint only when there is no slotted content (React/Vue portal may arrive later). */
  const syncHint = () => {
    if (hasSlottedContent()) {
      hintEl.hidden = true;
      return;
    }
    hintEl.hidden = false;
    hintEl.textContent = options.defaultContent ?? '点击任意位置产生火花';
  };

  if (options.slotElement && options.slotElement.parentElement !== content) {
    content.appendChild(options.slotElement);
  }
  syncHint();
  const slotObserver = new MutationObserver(syncHint);
  slotObserver.observe(content, { childList: true, characterData: true, subtree: true });

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
        // Avoid wipe when React/Vue owns portal children unless swapping slotElement.
        content.replaceChildren();
        if (next.slotElement) content.appendChild(next.slotElement);
      }
      options = { ...options, ...next };
      syncHint();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancelAnimationFrame(frameId);
      unbindVisibility?.();
      resizeObs?.disconnect();
      slotObserver.disconnect();
      root.removeEventListener('click', onClick);
      root.remove();
    },
  };
}
