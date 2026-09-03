import { bindVisibilityPause, clamp } from '@cos-design/shared';
import type { GameOfLifeController, GameOfLifeOptions } from './types';

const P = 'cos-game-of-life';
const DEFAULT_W = 560;
const DEFAULT_H = 420;

const createGrid = (rows: number, cols: number, density: number) =>
  Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => (Math.random() < density ? 1 : 0)),
  );

const nextGeneration = (grid: number[][]) => {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  const next = Array.from({ length: rows }, () => Array(cols).fill(0));
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let aliveNeighbors = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const ny = row + dy;
          const nx = col + dx;
          if (ny < 0 || ny >= rows || nx < 0 || nx >= cols) continue;
          aliveNeighbors += grid[ny][nx];
        }
      }
      if (grid[row][col]) next[row][col] = aliveNeighbors === 2 || aliveNeighbors === 3 ? 1 : 0;
      else if (aliveNeighbors === 3) next[row][col] = 1;
    }
  }
  return next;
};

export function createGameOfLife(
  container: HTMLElement,
  initial: GameOfLifeOptions = {},
): GameOfLifeController {
  let options: GameOfLifeOptions = {
    cellSize: 14,
    speed: 120,
    density: 0.28,
    aliveColor: '#a3e635',
    gridColor: 'rgb(148 163 184 / 14%)',
    ...initial,
  };
  let destroyed = false;
  let width = options.width ?? DEFAULT_W;
  let height = options.height ?? DEFAULT_H;
  let frameId = 0;
  let evolveTimer = 0;
  let paused = typeof document !== 'undefined' ? document.hidden : false;
  let running = true;
  let generation = 0;
  let unbindVisibility: (() => void) | null = null;

  let rows = 0;
  let cols = 0;
  let grid: number[][] = [];

  const root = document.createElement('div');
  root.className = P;
  const canvas = document.createElement('canvas');
  canvas.className = `${P}__canvas`;
  const toolbar = document.createElement('div');
  toolbar.className = `${P}__toolbar`;
  const meta = document.createElement('div');
  meta.className = `${P}__meta`;
  const genSpan = document.createElement('span');
  const aliveSpan = document.createElement('span');
  meta.append(genSpan, aliveSpan);
  const actions = document.createElement('div');
  actions.className = `${P}__actions`;
  const toggleBtn = document.createElement('button');
  toggleBtn.type = 'button';
  toggleBtn.className = `${P}__button`;
  const resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.className = `${P}__button`;
  actions.append(toggleBtn, resetBtn);
  toolbar.append(meta, actions);
  root.append(canvas, toolbar);
  container.appendChild(root);

  const labels = () => ({
    generation: options.labels?.generation ?? 'Generation',
    alive: options.labels?.alive ?? 'alive',
    pause: options.labels?.pause ?? 'Pause',
    play: options.labels?.play ?? 'Play',
    randomize: options.labels?.randomize ?? 'Randomize',
  });

  const initGrid = () => {
    const cellSize = options.cellSize ?? 14;
    rows = Math.max(6, Math.floor(height / cellSize));
    cols = Math.max(6, Math.floor(width / cellSize));
    const density = clamp(options.density ?? 0.28, 0.05, 0.7);
    grid = createGrid(rows, cols, density);
    generation = 0;
  };

  const liveCells = () => grid.reduce((sum, row) => sum + row.reduce((rs, c) => rs + c, 0), 0);

  const syncHud = () => {
    const L = labels();
    genSpan.textContent = `${L.generation} ${generation}`;
    aliveSpan.textContent = `${liveCells()} ${L.alive}`;
    toggleBtn.textContent = running ? L.pause : L.play;
    resetBtn.textContent = L.randomize;
  };

  const applyLayout = () => {
    width = options.width ?? DEFAULT_W;
    root.style.width = `${width}px`;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  };

  const syncCanvas = () => {
    height = options.height ?? DEFAULT_H;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  };

  const render = () => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const cellSize = options.cellSize ?? 14;
    const aliveColor = options.aliveColor ?? '#a3e635';
    const gridColor = options.gridColor ?? 'rgb(148 163 184 / 14%)';

    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, width, height);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (!grid[row][col]) continue;
        const x = col * cellSize;
        const y = row * cellSize;
        ctx.fillStyle = aliveColor;
        ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
        const glow = ctx.createRadialGradient(
          x + cellSize / 2,
          y + cellSize / 2,
          0,
          x + cellSize / 2,
          y + cellSize / 2,
          cellSize * 0.8,
        );
        glow.addColorStop(0, 'rgb(255 255 255 / 28%)');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(x, y, cellSize, cellSize);
      }
    }

    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let x = 0; x <= cols; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cellSize + 0.5, 0);
      ctx.lineTo(x * cellSize + 0.5, height);
      ctx.stroke();
    }
    for (let y = 0; y <= rows; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cellSize + 0.5);
      ctx.lineTo(width, y * cellSize + 0.5);
      ctx.stroke();
    }
    syncHud();
  };

  const resetGrid = () => {
    initGrid();
    render();
  };

  const toggleCell = (clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect();
    const cellSize = options.cellSize ?? 14;
    const col = Math.floor((clientX - rect.left) / cellSize);
    const row = Math.floor((clientY - rect.top) / cellSize);
    if (row < 0 || row >= rows || col < 0 || col >= cols) return;
    grid = grid.map((line, ri) =>
      ri === row ? line.map((cell, ci) => (ci === col ? (cell ? 0 : 1) : cell)) : line,
    );
    generation++;
    render();
  };

  const startEvolve = () => {
    window.clearInterval(evolveTimer);
    if (!running) return;
    evolveTimer = window.setInterval(() => {
      if (paused) return;
      grid = nextGeneration(grid);
      generation++;
      render();
    }, options.speed ?? 120);
  };

  toggleBtn.addEventListener('click', () => {
    running = !running;
    syncHud();
    startEvolve();
  });
  resetBtn.addEventListener('click', resetGrid);
  canvas.addEventListener('click', (e) => toggleCell(e.clientX, e.clientY));

  const loop = () => {
    if (destroyed) return;
    frameId = requestAnimationFrame(loop);
    render();
  };

  applyLayout();
  syncCanvas();
  initGrid();
  unbindVisibility = bindVisibilityPause((h) => {
    paused = h;
  });
  render();
  startEvolve();
  loop();

  return {
    update(next) {
      options = { ...options, ...next };
      applyLayout();
      syncCanvas();
      initGrid();
      startEvolve();
      render();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancelAnimationFrame(frameId);
      window.clearInterval(evolveTimer);
      unbindVisibility?.();
      root.remove();
    },
  };
}
