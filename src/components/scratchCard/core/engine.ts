import { getRelativePointerPosition } from '@cos-design/shared';
import type { ScratchCardController, ScratchCardOptions } from './types';

const P = 'cos-scratch-card';

export function createScratchCard(
  container: HTMLElement,
  initial: ScratchCardOptions = {},
): ScratchCardController {
  let options: ScratchCardOptions = {
    coverColor: '#94a3b8',
    prize: '🎉 恭喜中奖！',
    coverText: '刮开涂层',
    revealThreshold: 0.45,
    width: 300,
    height: 180,
    ...initial,
  };
  let destroyed = false;
  let drawing = false;
  let revealed = false;

  const root = document.createElement('div');
  const prizeEl = document.createElement('div');
  prizeEl.className = `${P}__prize`;
  const canvas = document.createElement('canvas');
  canvas.dataset.testid = 'scratch-card-canvas';
  root.append(prizeEl, canvas);
  container.appendChild(root);

  const widthOf = () => options.width ?? 300;
  const heightOf = () => options.height ?? 180;

  const drawCover = (ctx: CanvasRenderingContext2D) => {
    const width = widthOf();
    const height = heightOf();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = options.coverColor ?? '#94a3b8';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'rgb(255 255 255 / 30%)';
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(options.coverText ?? '刮开涂层', width / 2, height / 2);
  };

  const paintCover = () => {
    const width = widthOf();
    const height = heightOf();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawCover(ctx);
  };

  const applyChrome = () => {
    const width = widthOf();
    const height = heightOf();
    root.className = P;
    root.style.width = `${width}px`;
    root.style.height = `${height}px`;
    prizeEl.textContent = options.prize ?? '🎉 恭喜中奖！';
    canvas.className = `${P}__canvas${revealed ? ` ${P}__hidden` : ''}`;
    canvas.setAttribute('aria-label', options.coverText ?? '刮开涂层');
  };

  const finishReveal = () => {
    if (revealed || destroyed) return;
    revealed = true;
    applyChrome();
    options.onReveal?.();
  };

  const checkReveal = () => {
    if (revealed) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let transparent = 0;
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] < 128) transparent++;
    }
    if (transparent / (canvas.width * canvas.height) > (options.revealThreshold ?? 0.45)) {
      finishReveal();
    }
  };

  const scratch = (x: number, y: number) => {
    if (revealed) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();
    checkReveal();
  };

  const onStart = (event: Event) => {
    if ('touches' in event) event.preventDefault();
    drawing = true;
    const pos = getRelativePointerPosition(canvas, event as MouseEvent | TouchEvent);
    if (pos) scratch(pos.x, pos.y);
  };
  const onMove = (event: Event) => {
    if (!drawing) return;
    if ('touches' in event) event.preventDefault();
    const pos = getRelativePointerPosition(canvas, event as MouseEvent | TouchEvent);
    if (pos) scratch(pos.x, pos.y);
  };
  const onEnd = () => {
    drawing = false;
  };

  canvas.addEventListener('mousedown', onStart);
  canvas.addEventListener('mousemove', onMove);
  canvas.addEventListener('mouseup', onEnd);
  canvas.addEventListener('mouseleave', onEnd);
  canvas.addEventListener('touchstart', onStart, { passive: false });
  canvas.addEventListener('touchmove', onMove, { passive: false });
  canvas.addEventListener('touchend', onEnd);

  const reset = () => {
    revealed = false;
    paintCover();
    applyChrome();
  };

  paintCover();
  applyChrome();

  return {
    update(next) {
      const prevW = widthOf();
      const prevH = heightOf();
      const prevCover = options.coverColor;
      const prevText = options.coverText;
      options = { ...options, ...next };
      if (
        widthOf() !== prevW ||
        heightOf() !== prevH ||
        options.coverColor !== prevCover ||
        options.coverText !== prevText
      ) {
        revealed = false;
        paintCover();
      }
      applyChrome();
    },
    reset,
    reveal: finishReveal,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      canvas.removeEventListener('mousedown', onStart);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseup', onEnd);
      canvas.removeEventListener('mouseleave', onEnd);
      canvas.removeEventListener('touchstart', onStart);
      canvas.removeEventListener('touchmove', onMove);
      canvas.removeEventListener('touchend', onEnd);
      root.remove();
    },
  };
}
