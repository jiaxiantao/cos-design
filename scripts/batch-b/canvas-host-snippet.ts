/** Reference snippet — inlined in each canvas engine */
import {
  bindPrefersReducedMotion,
  bindVisibilityPause,
  observeElementSize,
  prefersReducedMotion,
  resolveCanvasBoxSize,
} from '@cos-design/shared';

export interface CanvasHostState {
  width: number;
  height: number;
  fill: boolean;
  paused: boolean;
  reduced: boolean;
  destroyed: boolean;
  frameId: number;
  sizeCleanup: (() => void) | null;
  unbindVisibility: (() => void) | null;
  unbindMotion: (() => void) | null;
}

export function setupCanvasHost(
  container: HTMLElement,
  prefix: string,
  defaults: { width: number; height: number },
  options: { fill?: boolean; width?: number; height?: number },
) {
  const root = document.createElement('div');
  root.className = prefix;
  const canvas = document.createElement('canvas');
  canvas.className = `${prefix}__canvas`;
  root.appendChild(canvas);
  container.appendChild(root);

  const state: CanvasHostState = {
    width: options.width ?? defaults.width,
    height: options.height ?? defaults.height,
    fill: options.fill ?? false,
    paused: typeof document !== 'undefined' ? document.hidden : false,
    reduced: prefersReducedMotion(),
    destroyed: false,
    frameId: 0,
    sizeCleanup: null,
    unbindVisibility: null,
    unbindMotion: null,
  };

  const applyLayout = () => {
    if (state.fill) {
      root.style.width = '100%';
      root.style.height = '100%';
    } else {
      root.style.width = `${state.width}px`;
      root.style.height = `${state.height}px`;
    }
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
  };

  const syncCanvas = () => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = state.width * dpr;
    canvas.height = state.height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  };

  const bindSize = (opts: { fill?: boolean; width?: number; height?: number }) => {
    state.fill = opts.fill ?? false;
    state.sizeCleanup?.();
    state.sizeCleanup = null;
    if (!state.fill) {
      state.width = opts.width ?? defaults.width;
      state.height = opts.height ?? defaults.height;
      applyLayout();
      syncCanvas();
      return;
    }
    state.sizeCleanup = observeElementSize(container, (measured) => {
      const box = resolveCanvasBoxSize({
        fill: true,
        width: opts.width,
        height: opts.height,
        defaultWidth: defaults.width,
        defaultHeight: defaults.height,
        measured,
      });
      state.width = box.width;
      state.height = box.height;
      applyLayout();
      syncCanvas();
    });
  };

  bindSize(options);
  state.unbindVisibility = bindVisibilityPause((hidden) => {
    state.paused = hidden;
  });
  state.unbindMotion = bindPrefersReducedMotion((v) => {
    state.reduced = v;
  });

  return { root, canvas, state, applyLayout, syncCanvas, bindSize };
}
