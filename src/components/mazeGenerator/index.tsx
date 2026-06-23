import React, { useEffect, useRef } from 'react';
import { bindVisibilityPause } from '../_shared/visibility';
import styles from './style/index.module.less';

export interface MazeGeneratorProps {
  width?: number;
  height?: number;
  cellSize?: number;
  onGenerated?: (cols: number, rows: number) => void;
}

type Cell = { top: boolean; right: boolean; bottom: boolean; left: boolean; visited: boolean };

const MazeGenerator: React.FC<MazeGeneratorProps> = ({ width = 400, height = 300, cellSize = 20, onGenerated }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onGeneratedRef = useRef(onGenerated);

  useEffect(() => {
    onGeneratedRef.current = onGenerated;
  }, [onGenerated]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cols = Math.floor(width / cellSize);
    const rows = Math.floor(height / cellSize);
    const grid: Cell[][] = Array.from({ length: rows }, () =>
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
    const dirs: [number, number, keyof Pick<Cell, 'top' | 'right' | 'bottom' | 'left'>][] = [
      [0, -1, 'top'],
      [1, 0, 'right'],
      [0, 1, 'bottom'],
      [-1, 0, 'left']
    ];
    const opposite: Record<string, keyof Pick<Cell, 'top' | 'right' | 'bottom' | 'left'>> = {
      top: 'bottom',
      right: 'left',
      bottom: 'top',
      left: 'right'
    };

    while (stack.length) {
      const [cx, cy] = stack[stack.length - 1];
      const neighbors = dirs
        .map(([dx, dy, wall]) => {
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx < 0 || ny < 0 || nx >= cols || ny >= rows || grid[ny][nx].visited) return null;
          return { nx, ny, wall };
        })
        .filter(Boolean) as { nx: number; ny: number; wall: keyof Pick<Cell, 'top' | 'right' | 'bottom' | 'left'> }[];

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

    onGeneratedRef.current?.(cols, rows);

    let frameId = 0;
    let reveal = 0;
    const totalWalls = cols * rows * 2;
    let paused = document.hidden;
    const unbindVisibility = bindVisibilityPause((hidden) => {
      paused = hidden;
    });

    const draw = () => {
      if (paused) {
        frameId = requestAnimationFrame(draw);
        return;
      }

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

          if (cell.top) {
            if (count++ < reveal) {
              ctx.beginPath();
              ctx.moveTo(px, py);
              ctx.lineTo(px + cellSize, py);
              ctx.stroke();
            }
          }
          if (cell.right) {
            if (count++ < reveal) {
              ctx.beginPath();
              ctx.moveTo(px + cellSize, py);
              ctx.lineTo(px + cellSize, py + cellSize);
              ctx.stroke();
            }
          }
          if (y === rows - 1 && cell.bottom) {
            if (count++ < reveal) {
              ctx.beginPath();
              ctx.moveTo(px, py + cellSize);
              ctx.lineTo(px + cellSize, py + cellSize);
              ctx.stroke();
            }
          }
          if (x === 0 && cell.left) {
            if (count++ < reveal) {
              ctx.beginPath();
              ctx.moveTo(px, py);
              ctx.lineTo(px, py + cellSize);
              ctx.stroke();
            }
          }
        }
      }
      ctx.shadowBlur = 0;

      if (reveal < totalWalls) {
        frameId = requestAnimationFrame(draw);
      }
    };

    draw();
    return () => {
      cancelAnimationFrame(frameId);
      unbindVisibility();
    };
  }, [cellSize, height, width]);

  return (
    <div className={styles.mazeGenerator} style={{ width, height }}>
      <canvas ref={canvasRef} className={styles.canvas} style={{ width, height }} />
    </div>
  );
};

export default MazeGenerator;
