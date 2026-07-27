import React, { useEffect, useMemo, useRef } from 'react';
import { bindVisibilityPause } from '@cos-design/shared';
import styles from './style/index.module.less';

export interface SandFallProps {
  width?: number;
  height?: number;
  /** 像素格大小 */
  cellSize?: number;
  /** 沙粒颜色列表（仅支持 #RRGGBB） */
  colors?: string[];
  /** 每帧生成粒子数 */
  spawnRate?: number;
}

const DEFAULT_COLORS = ['#fbbf24', '#f59e0b', '#d97706', '#b45309', '#92400e'];

const hexToRgb = (hex: string) => {
  const normalized = hex.trim().replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return [251, 191, 36] as [number, number, number];
  const v = parseInt(normalized, 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255] as [number, number, number];
};

const SandFall: React.FC<SandFallProps> = ({
  width = 480,
  height = 400,
  cellSize = 4,
  colors = DEFAULT_COLORS,
  spawnRate = 3
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cols = Math.max(1, Math.floor(width / cellSize));
  const rows = Math.max(1, Math.floor(height / cellSize));
  const gridRef = useRef<(number | null)[]>(Array(cols * rows).fill(null));
  const pointerRef = useRef({ x: -1, y: -1, down: false });
  const paletteRgb = useMemo(() => (colors.length > 0 ? colors : DEFAULT_COLORS).map(hexToRgb), [colors]);

  const resetGrid = () => {
    gridRef.current = Array(cols * rows).fill(null);
  };

  useEffect(() => {
    gridRef.current = Array(cols * rows).fill(null);
  }, [cols, rows]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let frameId = 0;
    let paused = document.hidden;
    const unbindVisibility = bindVisibilityPause((hidden) => {
      paused = hidden;
    });

    const idx = (col: number, row: number) => row * cols + col;

    const simulate = () => {
      const grid = gridRef.current;

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
      const { x, y, down } = pointerRef.current;
      if (!down || x < 0 || y < 0) return;

      const col = Math.floor(x / cellSize);
      const row = Math.floor(y / cellSize);
      const grid = gridRef.current;

      for (let s = 0; s < spawnRate; s++) {
        const offsetCol = col + Math.floor((Math.random() - 0.5) * 6);
        const offsetRow = row + Math.floor((Math.random() - 0.5) * 3);
        if (offsetCol < 0 || offsetCol >= cols || offsetRow < 0 || offsetRow >= rows) continue;
        const i = idx(offsetCol, offsetRow);
        if (grid[i] === null) {
          grid[i] = Math.floor(Math.random() * paletteRgb.length);
        }
      }
    };

    const render = () => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      const grid = gridRef.current;
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

    const loop = () => {
      frameId = requestAnimationFrame(loop);
      if (paused) return;
      spawnAtPointer();
      simulate();
      render();
    };

    frameId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frameId);
      unbindVisibility();
    };
  }, [cellSize, cols, height, paletteRgb, rows, spawnRate, width]);

  const updatePointer = (clientX: number, clientY: number, rect: DOMRect, down: boolean) => {
    pointerRef.current = { x: clientX - rect.left, y: clientY - rect.top, down };
  };

  return (
    <div className={styles.sandFall} style={{ width }}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        style={{ width, height }}
        onMouseDown={(e) => updatePointer(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect(), true)}
        onMouseMove={(e) => {
          if (!pointerRef.current.down) return;
          updatePointer(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect(), true);
        }}
        onMouseUp={() => {
          pointerRef.current.down = false;
        }}
        onMouseLeave={() => {
          pointerRef.current.down = false;
        }}
        onTouchStart={(e) => {
          const t = e.touches[0];
          if (t) updatePointer(t.clientX, t.clientY, e.currentTarget.getBoundingClientRect(), true);
        }}
        onTouchMove={(e) => {
          const t = e.touches[0];
          if (t) updatePointer(t.clientX, t.clientY, e.currentTarget.getBoundingClientRect(), true);
        }}
        onTouchEnd={() => {
          pointerRef.current.down = false;
        }}
      />
      <div className={styles.toolbar}>
        <span className={styles.hint}>按住鼠标绘制沙粒</span>
        <button type="button" className={styles.button} onClick={resetGrid}>
          Clear
        </button>
      </div>
    </div>
  );
};

export default SandFall;
