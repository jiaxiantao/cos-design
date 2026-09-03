import {
  bindVisibilityPause,
  observeElementSize,
  resolveCanvasBoxSize,
  applyCanvasHostBox,
} from '@cos-design/shared';
import type { AuroraController, AuroraOptions } from './types';

const P = 'cos-aurora';
const DEFAULT_COLORS = ['#00ff87', '#60efff', '#7b2ff7', '#f107a3'];
const DEFAULT_W = 800;
const DEFAULT_H = 500;

export function createAurora(
  container: HTMLElement,
  initial: AuroraOptions = {},
): AuroraController {
  let options: AuroraOptions = { fill: false, colors: DEFAULT_COLORS, ...initial };
  let destroyed = false;
  let width = options.width ?? DEFAULT_W;
  let height = options.height ?? DEFAULT_H;
  let paused = typeof document !== 'undefined' ? document.hidden : false;
  let sizeCleanup: (() => void) | null = null;
  let unbindVisibility: (() => void) | null = null;
  const bandEls: HTMLElement[] = [];

  const root = document.createElement('div');
  root.className = P;
  container.appendChild(root);

  const applyLayout = () => {
    if (!(options.fill ?? false)) {
      width = options.width ?? DEFAULT_W;
      height = options.height ?? DEFAULT_H;
    }
    applyCanvasHostBox(container, root, {
      fill: Boolean(options.fill ?? false),
      width,
      height,
    });
  };

  const bindSize = () => {
    sizeCleanup?.();
    sizeCleanup = null;
    applyLayout();
    if (!(options.fill ?? false)) return;
    sizeCleanup = observeElementSize(container, (measured) => {
      const box = resolveCanvasBoxSize({
        fill: true,
        width: options.width,
        height: options.height,
        defaultWidth: DEFAULT_W,
        defaultHeight: DEFAULT_H,
        measured,
      });
      width = box.width;
      height = box.height;
      applyLayout();
    });
  };

  const renderBands = () => {
    bandEls.forEach((el) => el.remove());
    bandEls.length = 0;
    const palette = (options.colors?.length ?? 0) >= 2 ? options.colors! : DEFAULT_COLORS;
    palette.forEach((color, i) => {
      const band = document.createElement('div');
      band.className = `${P}__band`;
      band.style.setProperty('--aurora-color', color);
      band.style.setProperty('--aurora-delay', `${i * -3}s`);
      band.style.setProperty('--aurora-duration', `${12 + i * 2}s`);
      band.style.animationPlayState = paused ? 'paused' : 'running';
      root.appendChild(band);
      bandEls.push(band);
    });
  };

  unbindVisibility = bindVisibilityPause((hidden) => {
    paused = hidden;
    bandEls.forEach((b) => {
      b.style.animationPlayState = hidden ? 'paused' : 'running';
    });
  });

  bindSize();
  renderBands();

  return {
    update(next) {
      const prev = options;
      options = { ...options, ...next };
      const sizeChanged =
        prev.fill !== options.fill ||
        prev.width !== options.width ||
        prev.height !== options.height;
      const colorsChanged = JSON.stringify(prev.colors) !== JSON.stringify(options.colors);
      if (sizeChanged) bindSize();
      if (sizeChanged || colorsChanged) renderBands();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      unbindVisibility?.();
      sizeCleanup?.();
      root.remove();
    },
  };
}
