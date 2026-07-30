import React, { useEffect, useMemo, useRef, useState } from 'react';
import { bindVisibilityPause } from '@cos-design/shared';
import styles from './style/index.module.less';

export interface GameOfLifeProps {
  width?: number;
  height?: number;
  /** 单元格大小 */
  cellSize?: number;
  /** 演化速度（毫秒/代） */
  speed?: number;
  /** 初始存活密度 0~1 */
  density?: number;
  /** 存活颜色 */
  aliveColor?: string;
  /** 网格线颜色 */
  gridColor?: string;
  /** 控制栏文案 */
  labels?: Partial<{
    generation: string;
    alive: string;
    pause: string;
    play: string;
    randomize: string;
  }>;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const createGrid = (rows: number, cols: number, density: number) =>
  Array.from({ length: rows }, () => Array.from({ length: cols }, () => (Math.random() < density ? 1 : 0)));

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

      if (grid[row][col]) {
        next[row][col] = aliveNeighbors === 2 || aliveNeighbors === 3 ? 1 : 0;
      } else if (aliveNeighbors === 3) {
        next[row][col] = 1;
      }
    }
  }

  return next;
};

const GameOfLife: React.FC<GameOfLifeProps> = ({
  width = 560,
  height = 420,
  cellSize = 14,
  speed = 120,
  density = 0.28,
  aliveColor = '#a3e635',
  gridColor = 'rgb(148 163 184 / 14%)',
  labels
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rows = Math.max(6, Math.floor(height / cellSize));
  const cols = Math.max(6, Math.floor(width / cellSize));
  const normalizedDensity = clamp(density, 0.05, 0.7);
  const [running, setRunning] = useState(true);
  const [generation, setGeneration] = useState(0);
  const pausedRef = useRef(document.hidden);
  const [grid, setGrid] = useState<number[][]>(() => createGrid(rows, cols, normalizedDensity));
  const [gridMeta, setGridMeta] = useState({ rows, cols, density: normalizedDensity });

  if (gridMeta.rows !== rows || gridMeta.cols !== cols || gridMeta.density !== normalizedDensity) {
    setGridMeta({ rows, cols, density: normalizedDensity });
    setGrid(createGrid(rows, cols, normalizedDensity));
    setGeneration(0);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let animationId = 0;
    const unbindVisibility = bindVisibilityPause((hidden) => {
      pausedRef.current = hidden;
    });

    const render = () => {
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
            cellSize * 0.8
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
    };

    const loop = () => {
      animationId = requestAnimationFrame(loop);
      render();
    };

    animationId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animationId);
      unbindVisibility();
    };
  }, [aliveColor, cellSize, cols, grid, gridColor, height, rows, width]);

  useEffect(() => {
    if (!running) return;

    const timer = window.setInterval(() => {
      if (pausedRef.current) return;
      setGrid((current) => nextGeneration(current));
      setGeneration((value) => value + 1);
    }, speed);

    return () => clearInterval(timer);
  }, [running, speed]);

  const liveCells = useMemo(() => {
    return grid.reduce((sum, row) => sum + row.reduce((rowSum, cell) => rowSum + cell, 0), 0);
  }, [grid]);

  const reset = () => {
    setGrid(createGrid(rows, cols, normalizedDensity));
    setGeneration(0);
  };

  const toggleCell = (clientX: number, clientY: number, rect: DOMRect) => {
    const col = Math.floor((clientX - rect.left) / cellSize);
    const row = Math.floor((clientY - rect.top) / cellSize);
    if (row < 0 || row >= rows || col < 0 || col >= cols) return;

    setGrid((current) =>
      current.map((line, lineIndex) =>
        lineIndex === row ? line.map((cell, cellIndex) => (cellIndex === col ? (cell ? 0 : 1) : cell)) : line
      )
    );
    setGeneration((value) => value + 1);
  };

  return (
    <div className={styles.gameOfLife} style={{ width }}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        style={{ width, height }}
        onClick={(e) => toggleCell(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect())}
      />
      <div className={styles.toolbar}>
        <div className={styles.meta}>
          <span>
            {labels?.generation ?? 'Generation'} {generation}
          </span>
          <span>
            {liveCells} {labels?.alive ?? 'alive'}
          </span>
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.button} onClick={() => setRunning((value) => !value)}>
            {running ? (labels?.pause ?? 'Pause') : (labels?.play ?? 'Play')}
          </button>
          <button type="button" className={styles.button} onClick={reset}>
            {labels?.randomize ?? 'Randomize'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOfLife;
