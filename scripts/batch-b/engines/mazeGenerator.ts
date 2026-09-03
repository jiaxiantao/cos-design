import { bindVisibilityPause } from '@cos-design/shared';
import type { MazeGeneratorController, MazeGeneratorOptions } from './types';

const P = 'cos-maze-generator';
const DEFAULT_W = 400;
const DEFAULT_H = 300;

type WallKey = 'top' | 'right' | 'bottom' | 'left';
type Cell = Record<WallKey, boolean> & { visited: boolean };

export function createMazeGenerator(
  container: HTMLElement,
  initial: MazeGeneratorOptions = {}
): MazeGeneratorController {
  let options: MazeGeneratorOptions = { cellSize: 20, ...initial };
  let destroyed = false;
  let width = options.width ?? DEFAULT_W;
  let height = options.height ?? DEFAULT_H;
  let frameId = 0;
  let paused = typeof document !== 'undefined' ? document.hidden : false;
  let unbindVisibility: (() => void) | null = null;
  const onGeneratedRef = { current: options.onGenerated };
  let grid: Cell[][] = [];
  let cols = 0;
  let rows = 0;
  let reveal = 0;
  let totalWalls = 0;

  const root = document.createElement('div');
  root.className = P;
  const canvas = document.createElement('canvas');
  canvas.className = `${P}__canvas`;
  root.appendChild(canvas);
  container.appendChild(root);

  const buildMaze = () => {
    const cellSize = options.cellSize ?? 20;
    cols = Math.floor(width / cellSize);
    rows = Math.floor(height / cellSize);
    grid = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ({
        top: true,
        right: true,
        bottom: true,
        left: true,
        visited: false
      }))
    );

    const stack: [number, number][] = [[0, 0]];
    grid[0][0].visited = true;
    const dirs: [number, number, WallKey][] = [
      [0, -1, 'top'],
      [1, 0, 'right'],
      [0, 1, 'bottom'],
      [-1, 0, 'left']
    ];
    const opposite: Record<WallKey, WallKey> = { top: 'bottom', right: 'left', bottom: 'top', left: 'right' };

    while (stack.length) {
      const [cx, cy] = stack[stack.length - 1];
      const neighbors = dirs
        .map(([dx, dy, wall]) => {
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx < 0 || ny < 0 || nx >= cols || ny >= rows || grid[ny][nx].visited) return null;
          return { nx, ny, wall };
        })
        .filter(Boolean) as { nx: number; ny: number; wall: WallKey }[];

      if (!neighbors.length) {
        stack.pop();
        continue;
      }
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      grid[cy][cx][next.wall] = false;
      grid[next.ny][next.nx][opposite[next.wall]] = false;
      grid[next.ny][next.nx].visited = true;
      stack.push([next.nx, next.ny]);
    }

    totalWalls = cols * rows * 2;
    reveal = 0;
    onGeneratedRef.current?.(cols, rows);
  };

  const applyLayout = () => {
    width = options.width ?? DEFAULT_W;
    height = options.height ?? DEFAULT_H;
    root.style.width = `${width}px`;
    root.style.height = `${height}px`;
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

  const draw = () => {
    if (destroyed) return;
    if (paused) {
      frameId = requestAnimationFrame(draw);
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const cellSize = options.cellSize ?? 20;

    reveal = Math.min(totalWalls, reveal + 2);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 4;

    let count = 0;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const cell = grid[y][x];
        const px = x * cellSize;
        const py = y * cellSize;
        if (cell.top && count++ < reveal) {
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + cellSize, py);
          ctx.stroke();
        }
        if (cell.right && count++ < reveal) {
          ctx.beginPath();
          ctx.moveTo(px + cellSize, py);
          ctx.lineTo(px + cellSize, py + cellSize);
          ctx.stroke();
        }
        if (y === rows - 1 && cell.bottom && count++ < reveal) {
          ctx.beginPath();
          ctx.moveTo(px, py + cellSize);
          ctx.lineTo(px + cellSize, py + cellSize);
          ctx.stroke();
        }
        if (x === 0 && cell.left && count++ < reveal) {
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px, py + cellSize);
          ctx.stroke();
        }
      }
    }
    ctx.shadowBlur = 0;
    if (reveal < totalWalls) frameId = requestAnimationFrame(draw);
  };

  applyLayout();
  syncCanvas();
  buildMaze();
  unbindVisibility = bindVisibilityPause((h) => {
    paused = h;
  });
  draw();

  return {
    update(next) {
      options = { ...options, ...next };
      onGeneratedRef.current = options.onGenerated;
      applyLayout();
      syncCanvas();
      buildMaze();
      cancelAnimationFrame(frameId);
      draw();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancelAnimationFrame(frameId);
      unbindVisibility?.();
      root.remove();
    }
  };
}
