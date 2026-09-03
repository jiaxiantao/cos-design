import { bindVisibilityPause } from '@cos-design/shared';
import type { SandFallController, SandFallOptions } from './types';

const P = 'cos-sand-fall';
const DEFAULT_COLORS = ['#fbbf24', '#f59e0b', '#d97706', '#b45309', '#92400e'];
const DEFAULT_W = 480;
const DEFAULT_H = 400;

const hexToRgb = (hex: string): [number, number, number] => {
  const normalized = hex.trim().replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return [251, 191, 36];
  const v = parseInt(normalized, 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
};

export function createSandFall(
  container: HTMLElement,
  initial: SandFallOptions = {},
): SandFallController {
  let options: SandFallOptions = {
    cellSize: 4,
    colors: DEFAULT_COLORS,
    spawnRate: 3,
    hint: '按住鼠标绘制沙粒',
    clearText: 'Clear',
    ...initial,
  };
  let destroyed = false;
  let width = options.width ?? DEFAULT_W;
  let height = options.height ?? DEFAULT_H;
  let frameId = 0;
  let paused = typeof document !== 'undefined' ? document.hidden : false;
  let unbindVisibility: (() => void) | null = null;

  let cols = 0;
  let rows = 0;
  let grid: (number | null)[] = [];
  let paletteRgb: [number, number, number][] = [];
  const pointer = { x: -1, y: -1, down: false };

  const root = document.createElement('div');
  root.className = P;
  const canvas = document.createElement('canvas');
  canvas.className = `${P}__canvas`;
  const toolbar = document.createElement('div');
  toolbar.className = `${P}__toolbar`;
  const hintEl = document.createElement('span');
  hintEl.className = `${P}__hint`;
  const clearBtn = document.createElement('button');
  clearBtn.type = 'button';
  clearBtn.className = `${P}__button`;
  toolbar.append(hintEl, clearBtn);
  root.append(canvas, toolbar);
  container.appendChild(root);

  const idx = (col: number, row: number) => row * cols + col;

  const initGrid = () => {
    const cellSize = options.cellSize ?? 4;
    cols = Math.max(1, Math.floor(width / cellSize));
    rows = Math.max(1, Math.floor(height / cellSize));
    grid = Array(cols * rows).fill(null);
    paletteRgb = (options.colors?.length ? options.colors : DEFAULT_COLORS).map(hexToRgb);
    hintEl.textContent = options.hint ?? '按住鼠标绘制沙粒';
    clearBtn.textContent = options.clearText ?? 'Clear';
  };

  const applyLayout = () => {
    width = options.width ?? DEFAULT_W;
    height = options.height ?? DEFAULT_H;
    root.style.width = `${width}px`;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  };

  const syncCanvas = () => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  };

  const simulate = () => {
    for (let row = rows - 2; row >= 0; row--) {
      for (let col = 0; col < cols; col++) {
        const i = idx(col, row);
        if (grid[i] === null) continue;
        const below = idx(col, row + 1);
        if (grid[below] === null) {
          grid[below] = grid[i];
          grid[i] = null;
          continue;
        }
        const dir = Math.random() < 0.5 ? -1 : 1;
        const side1 = col + dir;
        const side2 = col - dir;
        if (side1 >= 0 && side1 < cols && grid[idx(side1, row + 1)] === null) {
          grid[idx(side1, row + 1)] = grid[i];
          grid[i] = null;
        } else if (side2 >= 0 && side2 < cols && grid[idx(side2, row + 1)] === null) {
          grid[idx(side2, row + 1)] = grid[i];
          grid[i] = null;
        }
      }
    }
  };

  const spawnAtPointer = () => {
    if (!pointer.down || pointer.x < 0 || pointer.y < 0) return;
    const cellSize = options.cellSize ?? 4;
    const col = Math.floor(pointer.x / cellSize);
    const row = Math.floor(pointer.y / cellSize);
    const rate = options.spawnRate ?? 3;
    for (let s = 0; s < rate; s++) {
      const offsetCol = col + Math.floor((Math.random() - 0.5) * 6);
      const offsetRow = row + Math.floor((Math.random() - 0.5) * 3);
      if (offsetCol < 0 || offsetCol >= cols || offsetRow < 0 || offsetRow >= rows) continue;
      const i = idx(offsetCol, offsetRow);
      if (grid[i] === null) grid[i] = Math.floor(Math.random() * paletteRgb.length);
    }
  };

  const render = () => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const cellSize = options.cellSize ?? 4;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const colorIndex = grid[idx(col, row)];
        if (colorIndex === null) continue;
        const [r, g, b] = paletteRgb[colorIndex];
        ctx.fillStyle = `rgb(${r} ${g} ${b})`;
        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
      }
    }
  };

  const updatePointer = (clientX: number, clientY: number, down: boolean) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = clientX - rect.left;
    pointer.y = clientY - rect.top;
    pointer.down = down;
  };

  const onMouseDown = (e: MouseEvent) => updatePointer(e.clientX, e.clientY, true);
  const onMouseMove = (e: MouseEvent) => {
    if (pointer.down) updatePointer(e.clientX, e.clientY, true);
  };
  const onMouseUp = () => {
    pointer.down = false;
  };
  const onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0];
    if (t) updatePointer(t.clientX, t.clientY, true);
  };
  const onTouchMove = (e: TouchEvent) => {
    const t = e.touches[0];
    if (t) updatePointer(t.clientX, t.clientY, true);
  };

  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('mouseleave', onMouseUp);
  canvas.addEventListener('touchstart', onTouchStart);
  canvas.addEventListener('touchmove', onTouchMove);
  canvas.addEventListener('touchend', onMouseUp);
  clearBtn.addEventListener('click', () => {
    grid = Array(cols * rows).fill(null);
  });

  const loop = () => {
    if (destroyed) return;
    frameId = requestAnimationFrame(loop);
    if (paused) return;
    spawnAtPointer();
    simulate();
    render();
  };

  applyLayout();
  syncCanvas();
  initGrid();
  unbindVisibility = bindVisibilityPause((h) => {
    paused = h;
  });
  loop();

  return {
    update(next) {
      options = { ...options, ...next };
      applyLayout();
      syncCanvas();
      initGrid();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancelAnimationFrame(frameId);
      unbindVisibility?.();
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('mouseleave', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onMouseUp);
      root.remove();
    },
  };
}
