import React, { useEffect, useRef } from 'react';
import { bindVisibilityPause } from '@cos-design/shared';
import styles from './style/index.module.less';

export interface SpringMassProps {
  width?: number;
  height?: number;
  /** 横向质点数量 */
  cols?: number;
  /** 纵向质点数量 */
  rows?: number;
  /** 弹簧刚度 0~1 */
  stiffness?: number;
  /** 速度阻尼 0~1 */
  damping?: number;
  /** 主色 */
  color?: string;
}

interface MassNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  pinned: boolean;
}

interface Spring {
  a: number;
  b: number;
  rest: number;
}

const createSystem = (width: number, height: number, cols: number, rows: number) => {
  const safeCols = Math.max(3, Math.min(cols, 10));
  const safeRows = Math.max(3, Math.min(rows, 8));
  const padX = width * 0.16;
  const padY = height * 0.18;
  const stepX = (width - padX * 2) / (safeCols - 1);
  const stepY = (height - padY * 2) / (safeRows - 1);

  const nodes: MassNode[] = [];
  for (let row = 0; row < safeRows; row++) {
    for (let col = 0; col < safeCols; col++) {
      const pinned =
        (row === 0 && (col === 0 || col === safeCols - 1)) ||
        (row === safeRows - 1 && (col === 0 || col === safeCols - 1));
      nodes.push({
        x: padX + col * stepX,
        y: padY + row * stepY,
        vx: 0,
        vy: 0,
        pinned
      });
    }
  }

  const springs: Spring[] = [];
  const indexOf = (col: number, row: number) => row * safeCols + col;

  for (let row = 0; row < safeRows; row++) {
    for (let col = 0; col < safeCols; col++) {
      if (col < safeCols - 1) {
        springs.push({ a: indexOf(col, row), b: indexOf(col + 1, row), rest: stepX });
      }
      if (row < safeRows - 1) {
        springs.push({ a: indexOf(col, row), b: indexOf(col, row + 1), rest: stepY });
      }
      if (col < safeCols - 1 && row < safeRows - 1) {
        const diag = Math.hypot(stepX, stepY);
        springs.push({ a: indexOf(col, row), b: indexOf(col + 1, row + 1), rest: diag });
        springs.push({ a: indexOf(col + 1, row), b: indexOf(col, row + 1), rest: diag });
      }
    }
  }

  return { nodes, springs, cols: safeCols, rows: safeRows };
};

const SpringMass: React.FC<SpringMassProps> = ({
  width = 560,
  height = 400,
  cols = 6,
  rows = 5,
  stiffness = 0.22,
  damping = 0.9,
  color = '#a78bfa'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const systemRef = useRef(createSystem(width, height, cols, rows));
  const dragRef = useRef<{ index: number; ox: number; oy: number } | null>(null);
  const pointerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    systemRef.current = createSystem(width, height, cols, rows);
    dragRef.current = null;
  }, [cols, height, rows, width]);

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

    const margin = 10;
    const k = Math.max(0.04, Math.min(stiffness, 0.8));

    const simulate = () => {
      const { nodes, springs } = systemRef.current;
      const drag = dragRef.current;

      if (drag) {
        const node = nodes[drag.index];
        node.x = pointerRef.current.x + drag.ox;
        node.y = pointerRef.current.y + drag.oy;
        node.vx = 0;
        node.vy = 0;
      }

      for (const spring of springs) {
        const a = nodes[spring.a];
        const b = nodes[spring.b];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 0.001;
        const force = (dist - spring.rest) * k;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        const aDragged = drag?.index === spring.a;
        const bDragged = drag?.index === spring.b;

        if (!a.pinned && !aDragged) {
          a.vx += fx;
          a.vy += fy;
        }
        if (!b.pinned && !bDragged) {
          b.vx -= fx;
          b.vy -= fy;
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.pinned || drag?.index === i) {
          node.vx = 0;
          node.vy = 0;
          continue;
        }

        node.vx *= damping;
        node.vy *= damping;
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < margin) {
          node.x = margin;
          node.vx *= -0.4;
        } else if (node.x > width - margin) {
          node.x = width - margin;
          node.vx *= -0.4;
        }

        if (node.y < margin) {
          node.y = margin;
          node.vy *= -0.4;
        } else if (node.y > height - margin) {
          node.y = height - margin;
          node.vy *= -0.4;
        }
      }
    };

    const render = () => {
      const { nodes, springs } = systemRef.current;

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      for (const spring of springs) {
        const a = nodes[spring.a];
        const b = nodes[spring.b];
        const dist = Math.hypot(b.x - a.x, b.y - a.y) || 1;
        const stretch = Math.min(1, Math.abs(dist - spring.rest) / spring.rest);

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.22 + stretch * 0.55;
        ctx.lineWidth = spring.rest > Math.max(width, height) * 0.2 ? 1 : 1.6;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      nodes.forEach((node, i) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.pinned ? 6 : 8, 0, Math.PI * 2);
        ctx.fillStyle = node.pinned ? '#64748b' : color;
        ctx.fill();
        ctx.strokeStyle = 'rgb(255 255 255 / 28%)';
        ctx.lineWidth = 1;
        ctx.stroke();

        if (dragRef.current?.index === i) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, 13, 0, Math.PI * 2);
          ctx.strokeStyle = color;
          ctx.globalAlpha = 0.45;
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      });
    };

    const loop = () => {
      frameId = requestAnimationFrame(loop);
      if (paused) return;
      simulate();
      render();
    };

    frameId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frameId);
      unbindVisibility();
    };
  }, [color, damping, height, stiffness, width]);

  const findNodeIndex = (x: number, y: number) => {
    const { nodes } = systemRef.current;
    let best = -1;
    let bestDist = 20;
    nodes.forEach((node, index) => {
      if (node.pinned) return;
      const dist = Math.hypot(node.x - x, node.y - y);
      if (dist < bestDist) {
        bestDist = dist;
        best = index;
      }
    });
    return best;
  };

  const handleDown = (clientX: number, clientY: number, rect: DOMRect) => {
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    pointerRef.current = { x, y };
    const index = findNodeIndex(x, y);
    if (index < 0) return;
    const node = systemRef.current.nodes[index];
    dragRef.current = { index, ox: node.x - x, oy: node.y - y };
  };

  const handleMove = (clientX: number, clientY: number, rect: DOMRect) => {
    pointerRef.current = { x: clientX - rect.left, y: clientY - rect.top };
  };

  const handleUp = () => {
    dragRef.current = null;
  };

  return (
    <div className={styles.springMass} style={{ width, height }}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        style={{ width, height }}
        onMouseDown={(e) => handleDown(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect())}
        onMouseMove={(e) => handleMove(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect())}
        onMouseUp={handleUp}
        onMouseLeave={handleUp}
        onTouchStart={(e) => {
          const t = e.touches[0];
          if (t) handleDown(t.clientX, t.clientY, e.currentTarget.getBoundingClientRect());
        }}
        onTouchMove={(e) => {
          const t = e.touches[0];
          if (t) handleMove(t.clientX, t.clientY, e.currentTarget.getBoundingClientRect());
        }}
        onTouchEnd={handleUp}
      />
      <div className={styles.hint}>拖拽网格质点，观察弹簧回弹</div>
    </div>
  );
};

export default SpringMass;
