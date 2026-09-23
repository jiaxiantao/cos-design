import type { FuzzyTextController, FuzzyTextOptions } from './types';
const P = 'cos-fuzzy-text';

export function createFuzzyText(
  container: HTMLElement,
  initial: FuzzyTextOptions = {},
): FuzzyTextController {
  let opts: FuzzyTextOptions = {
    text: 'FUZZY',
    fontSize: 72,
    fontWeight: 900,
    color: '#f8fafc',
    baseIntensity: 0.18,
    hoverIntensity: 0.5,
    enableHover: true,
    fuzzRange: 30,
    ...initial,
  };
  let frameId = 0;
  let cancelled = false;
  let cleanup: (() => void) | null = null;

  const root = document.createElement('div');
  root.className = P;
  const canvas = document.createElement('canvas');
  canvas.className = `${P}__canvas`;
  root.appendChild(canvas);
  container.appendChild(root);

  const init = async () => {
    cancelled = false;
    cleanup?.();
    cleanup = null;
    if (frameId) cancelAnimationFrame(frameId);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const fontFamily = window.getComputedStyle(canvas).fontFamily || 'sans-serif';
    const fontString = `${opts.fontWeight ?? 900} ${opts.fontSize ?? 72}px ${fontFamily}`;
    try {
      await document.fonts.load(fontString);
    } catch {
      await document.fonts.ready;
    }
    if (cancelled) return;

    const offscreen = document.createElement('canvas');
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) return;
    offCtx.font = fontString;
    offCtx.textBaseline = 'alphabetic';
    const text = opts.text ?? 'FUZZY';
    const metrics = offCtx.measureText(text);
    const actualLeft = metrics.actualBoundingBoxLeft ?? 0;
    const actualRight = metrics.actualBoundingBoxRight ?? metrics.width;
    const actualAscent = metrics.actualBoundingBoxAscent ?? opts.fontSize ?? 72;
    const actualDescent = metrics.actualBoundingBoxDescent ?? (opts.fontSize ?? 72) * 0.2;
    const textBoundingWidth = Math.ceil(actualLeft + actualRight);
    const tightHeight = Math.ceil(actualAscent + actualDescent);
    const extraWidthBuffer = 10;
    const offscreenWidth = textBoundingWidth + extraWidthBuffer;
    offscreen.width = offscreenWidth;
    offscreen.height = tightHeight;
    offCtx.font = fontString;
    offCtx.fillStyle = opts.color ?? '#f8fafc';
    offCtx.fillText(text, extraWidthBuffer / 2 - actualLeft, actualAscent);

    const fuzzRange = opts.fuzzRange ?? 30;
    const horizontalMargin = fuzzRange + 20;
    canvas.width = offscreenWidth + horizontalMargin * 2;
    canvas.height = tightHeight;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.translate(horizontalMargin, 0);

    const interactiveLeft = horizontalMargin + extraWidthBuffer / 2;
    const interactiveRight = interactiveLeft + textBoundingWidth;
    let isHovering = false;

    const run = () => {
      if (cancelled) return;
      const intensity = isHovering ? (opts.hoverIntensity ?? 0.5) : (opts.baseIntensity ?? 0.18);
      ctx.clearRect(-fuzzRange - 20, -10, offscreenWidth + 2 * (fuzzRange + 20), tightHeight + 20);
      for (let j = 0; j < tightHeight; j++) {
        const dx = Math.floor(intensity * (Math.random() - 0.5) * fuzzRange);
        ctx.drawImage(offscreen, 0, j, offscreenWidth, 1, dx, j, offscreenWidth, 1);
      }
      frameId = requestAnimationFrame(run);
    };
    frameId = requestAnimationFrame(run);

    const onMove = (e: MouseEvent) => {
      if (!(opts.enableHover ?? true)) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      isHovering = x >= interactiveLeft && x <= interactiveRight && y >= 0 && y <= tightHeight;
    };
    const onLeave = () => {
      isHovering = false;
    };
    if (opts.enableHover ?? true) {
      canvas.addEventListener('mousemove', onMove);
      canvas.addEventListener('mouseleave', onLeave);
    }
    cleanup = () => {
      cancelAnimationFrame(frameId);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
    };
  };

  void init();

  return {
    update(n) {
      opts = { ...opts, ...n };
      void init();
    },
    destroy() {
      cancelled = true;
      cleanup?.();
      root.remove();
    },
  };
}
