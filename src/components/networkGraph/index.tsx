import React, { useEffect, useMemo, useRef, useState } from 'react';
import { bindVisibilityPause } from '@cos-design/shared';
import styles from './style/index.module.less';

export interface NetworkGraphNode {
  id: string;
  label?: string;
  color?: string;
}

export interface NetworkGraphEdge {
  source: string;
  target: string;
}

export interface NetworkGraphProps {
  width?: number;
  height?: number;
  /** 节点列表 */
  nodes?: NetworkGraphNode[];
  /** 边列表 */
  edges?: NetworkGraphEdge[];
  /** 连线颜色 */
  linkColor?: string;
  /** 节点半径 */
  nodeRadius?: number;
  /** 未悬停节点时的操作提示 */
  hint?: string;
}

interface InternalNode {
  id: string;
  label: string;
  color: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

type CursorMode = 'default' | 'grab' | 'grabbing';

const DEFAULT_NODES: NetworkGraphNode[] = [
  { id: 'react', label: 'React', color: '#61dafb' },
  { id: 'vue', label: 'Vue', color: '#42b883' },
  { id: 'angular', label: 'Angular', color: '#dd0031' },
  { id: 'svelte', label: 'Svelte', color: '#ff3e00' },
  { id: 'ts', label: 'TypeScript', color: '#3178c6' },
  { id: 'vite', label: 'Vite', color: '#bd34fe' },
  { id: 'next', label: 'Next.js', color: '#f8fafc' }
];

const DEFAULT_EDGES: NetworkGraphEdge[] = [
  { source: 'react', target: 'ts' },
  { source: 'react', target: 'next' },
  { source: 'react', target: 'vite' },
  { source: 'vue', target: 'ts' },
  { source: 'vue', target: 'vite' },
  { source: 'angular', target: 'ts' },
  { source: 'svelte', target: 'vite' },
  { source: 'ts', target: 'vite' }
];

const HIT_PAD = 6;
const FONT = 'ui-sans-serif, system-ui, -apple-system, sans-serif';

const mixHex = (hex: string, withColor: string, t: number) => {
  const parse = (c: string) => {
    const h = c.replace('#', '');
    const full =
      h.length === 3
        ? h
            .split('')
            .map((ch) => ch + ch)
            .join('')
        : h;
    if (full.length !== 6) return [148, 163, 184] as const;
    return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)] as const;
  };
  const [ar, ag, ab] = parse(hex);
  const [br, bg, bb] = parse(withColor);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const b = Math.round(ab + (bb - ab) * t);
  return `rgb(${r} ${g} ${b})`;
};

const withAlpha = (color: string, alpha: number) => {
  if (color.startsWith('#')) {
    const h = color.replace('#', '');
    const full =
      h.length === 3
        ? h
            .split('')
            .map((ch) => ch + ch)
            .join('')
        : h;
    if (full.length === 6) {
      const r = parseInt(full.slice(0, 2), 16);
      const g = parseInt(full.slice(2, 4), 16);
      const b = parseInt(full.slice(4, 6), 16);
      return `rgb(${r} ${g} ${b} / ${alpha})`;
    }
  }
  const rgb = color.match(/rgba?\(([^)]+)\)/i);
  if (rgb) {
    const parts = rgb[1]
      .split(/[,\s/]+/)
      .filter(Boolean)
      .map(Number);
    if (parts.length >= 3) return `rgb(${parts[0]} ${parts[1]} ${parts[2]} / ${alpha})`;
  }
  return color;
};

const NetworkGraph: React.FC<NetworkGraphProps> = ({
  width = 600,
  height = 420,
  nodes = DEFAULT_NODES,
  edges = DEFAULT_EDGES,
  linkColor = 'rgb(148 163 184 / 35%)',
  nodeRadius = 20,
  hint = '拖拽节点 · 悬停查看关联'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<InternalNode[]>([]);
  const hoverIdRef = useRef<string | null>(null);
  const dragRef = useRef<{
    node: InternalNode;
    offsetX: number;
    offsetY: number;
    lastX: number;
    lastY: number;
    vx: number;
    vy: number;
  } | null>(null);
  const [cursor, setCursor] = useState<CursorMode>('default');
  const [hintLabel, setHintLabel] = useState(hint);

  useEffect(() => {
    if (!hoverIdRef.current) setHintLabel(hint);
  }, [hint]);

  const adjacency = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const n of nodes) map.set(n.id, new Set());
    for (const e of edges) {
      map.get(e.source)?.add(e.target);
      map.get(e.target)?.add(e.source);
    }
    return map;
  }, [edges, nodes]);

  useEffect(() => {
    if (!nodes.length) {
      nodesRef.current = [];
      return;
    }

    const prev = new Map(nodesRef.current.map((n) => [n.id, n]));
    nodesRef.current = nodes.map((n, i) => {
      const existing = prev.get(n.id);
      if (existing) {
        return {
          ...existing,
          label: n.label || n.id,
          color: n.color || '#38bdf8'
        };
      }
      return {
        id: n.id,
        label: n.label || n.id,
        color: n.color || '#38bdf8',
        x: width / 2 + Math.cos((i / nodes.length) * Math.PI * 2) * 140,
        y: height / 2 + Math.sin((i / nodes.length) * Math.PI * 2) * 120,
        vx: 0,
        vy: 0
      };
    });
  }, [height, nodes, width]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
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

    const nodeMap = () => {
      const map = new Map<string, InternalNode>();
      nodesRef.current.forEach((n) => map.set(n.id, n));
      return map;
    };

    const isRelated = (id: string, focusId: string | null) => {
      if (!focusId) return true;
      if (id === focusId) return true;
      return adjacency.get(focusId)?.has(id) ?? false;
    };

    const simulate = () => {
      const allNodes = nodesRef.current;
      const map = nodeMap();
      const damping = 0.92;
      const repulsion = 2400;
      const springLength = 120;
      const springK = 0.012;
      const centerK = 0.003;

      for (let i = 0; i < allNodes.length; i++) {
        const a = allNodes[i];
        for (let j = i + 1; j < allNodes.length; j++) {
          const b = allNodes[j];
          let dx = a.x - b.x;
          let dy = a.y - b.y;
          const distSq = dx * dx + dy * dy || 1;
          const force = repulsion / distSq;
          const dist = Math.sqrt(distSq);
          dx /= dist;
          dy /= dist;
          a.vx += dx * force;
          a.vy += dy * force;
          b.vx -= dx * force;
          b.vy -= dy * force;
        }
      }

      for (const edge of edges) {
        const a = map.get(edge.source);
        const b = map.get(edge.target);
        if (!a || !b) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const displacement = dist - springLength;
        const force = springK * displacement;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx += fx;
        a.vy += fy;
        b.vx -= fx;
        b.vy -= fy;
      }

      for (const node of allNodes) {
        node.vx += (width / 2 - node.x) * centerK;
        node.vy += (height / 2 - node.y) * centerK;
        node.vx *= damping;
        node.vy *= damping;

        if (dragRef.current?.node === node) continue;
        node.x += node.vx;
        node.y += node.vy;
        node.x = Math.max(nodeRadius, Math.min(width - nodeRadius, node.x));
        node.y = Math.max(nodeRadius, Math.min(height - nodeRadius, node.y));
      }
    };

    const drawBackground = () => {
      const base = ctx.createRadialGradient(
        width * 0.5,
        height * 0.42,
        20,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.72
      );
      base.addColorStop(0, '#1a2744');
      base.addColorStop(0.55, '#0f172a');
      base.addColorStop(1, '#020617');
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = 'rgb(148 163 184 / 7%)';
      const step = 28;
      for (let x = step; x < width; x += step) {
        for (let y = step; y < height; y += step) {
          ctx.beginPath();
          ctx.arc(x, y, 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const vignette = ctx.createRadialGradient(
        width / 2,
        height / 2,
        Math.min(width, height) * 0.25,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.7
      );
      vignette.addColorStop(0, 'rgb(0 0 0 / 0%)');
      vignette.addColorStop(1, 'rgb(2 6 23 / 55%)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
    };

    const drawEdge = (a: InternalNode, b: InternalNode, active: boolean, dimmed: boolean) => {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const ux = dx / dist;
      const uy = dy / dist;
      const pad = nodeRadius * 0.55;
      const x1 = a.x + ux * pad;
      const y1 = a.y + uy * pad;
      const x2 = b.x - ux * pad;
      const y2 = b.y - uy * pad;

      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      const grad = ctx.createLinearGradient(x1, y1, x2, y2);

      if (active) {
        grad.addColorStop(0, withAlpha(a.color, 0.85));
        grad.addColorStop(0.5, withAlpha(mixHex(a.color, b.color, 0.5), 0.55));
        grad.addColorStop(1, withAlpha(b.color, 0.85));
        ctx.lineWidth = 2.4;
        ctx.shadowColor = withAlpha(mixHex(a.color, b.color, 0.5), 0.45);
        ctx.shadowBlur = 10;
      } else if (dimmed) {
        grad.addColorStop(0, withAlpha(linkColor, 0.12));
        grad.addColorStop(0.5, withAlpha(linkColor, 0.08));
        grad.addColorStop(1, withAlpha(linkColor, 0.12));
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
      } else {
        grad.addColorStop(0, withAlpha(linkColor, 0.15));
        grad.addColorStop(0.5, linkColor);
        grad.addColorStop(1, withAlpha(linkColor, 0.15));
        ctx.lineWidth = 1.35;
        ctx.shadowBlur = 0;
      }

      ctx.strokeStyle = grad;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(midX + uy * 4, midY - ux * 4, x2, y2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    const drawNode = (node: InternalNode, focusId: string | null, dragging: boolean) => {
      const related = isRelated(node.id, focusId);
      const isFocus = focusId === node.id;
      const isDrag = dragging && dragRef.current?.node === node;
      const scale = isFocus || isDrag ? 1.12 : related || !focusId ? 1 : 0.94;
      const r = nodeRadius * scale;
      const alpha = !focusId || related ? 1 : 0.28;

      ctx.save();
      ctx.globalAlpha = alpha;

      ctx.beginPath();
      ctx.arc(node.x, node.y, r + (isFocus || isDrag ? 10 : 6), 0, Math.PI * 2);
      ctx.fillStyle = withAlpha(node.color, isFocus || isDrag ? 0.22 : 0.12);
      ctx.fill();

      ctx.shadowColor = withAlpha(node.color, isFocus || isDrag ? 0.75 : 0.45);
      ctx.shadowBlur = isFocus || isDrag ? 22 : 14;
      const body = ctx.createRadialGradient(node.x - r * 0.28, node.y - r * 0.32, r * 0.1, node.x, node.y, r);
      body.addColorStop(0, mixHex(node.color, '#ffffff', 0.55));
      body.addColorStop(0.55, node.color);
      body.addColorStop(1, mixHex(node.color, '#0f172a', 0.35));
      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
      ctx.fillStyle = body;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.strokeStyle = isFocus || isDrag ? 'rgb(255 255 255 / 70%)' : 'rgb(255 255 255 / 28%)';
      ctx.lineWidth = isFocus || isDrag ? 1.6 : 1.1;
      ctx.stroke();

      const fontSize = Math.max(10, Math.min(13, Math.round(nodeRadius * 0.58)));
      ctx.font = `500 ${fontSize}px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const label = node.label;
      const textW = ctx.measureText(label).width;
      const padX = 8;
      const padY = 4;
      const boxW = textW + padX * 2;
      const boxH = fontSize + padY * 2;
      const boxX = node.x - boxW / 2;
      const boxY = Math.min(height - boxH - 4, node.y + r + 8);

      ctx.beginPath();
      const rr = boxH / 2;
      ctx.moveTo(boxX + rr, boxY);
      ctx.arcTo(boxX + boxW, boxY, boxX + boxW, boxY + boxH, rr);
      ctx.arcTo(boxX + boxW, boxY + boxH, boxX, boxY + boxH, rr);
      ctx.arcTo(boxX, boxY + boxH, boxX, boxY, rr);
      ctx.arcTo(boxX, boxY, boxX + boxW, boxY, rr);
      ctx.closePath();
      ctx.fillStyle = isFocus || isDrag ? 'rgb(15 23 42 / 78%)' : 'rgb(15 23 42 / 55%)';
      ctx.fill();
      ctx.strokeStyle = 'rgb(255 255 255 / 10%)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.fillText(label, node.x, boxY + boxH / 2);
      ctx.restore();
    };

    const render = () => {
      drawBackground();
      const map = nodeMap();
      const focusId = dragRef.current?.node.id ?? hoverIdRef.current;
      const dragging = Boolean(dragRef.current);

      for (const edge of edges) {
        const a = map.get(edge.source);
        const b = map.get(edge.target);
        if (!a || !b) continue;
        const active = Boolean(focusId && (edge.source === focusId || edge.target === focusId));
        const dimmed = Boolean(focusId && !active);
        drawEdge(a, b, active, dimmed);
      }

      const ordered = [...nodesRef.current].sort((a, b) => {
        const aScore = a.id === focusId ? 2 : isRelated(a.id, focusId) ? 1 : 0;
        const bScore = b.id === focusId ? 2 : isRelated(b.id, focusId) ? 1 : 0;
        return aScore - bScore;
      });

      for (const node of ordered) {
        drawNode(node, focusId, dragging);
      }
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
  }, [adjacency, edges, height, linkColor, nodeRadius, width]);

  const findNode = (clientX: number, clientY: number, rect: DOMRect) => {
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const hitR = nodeRadius + HIT_PAD;
    let best: InternalNode | null = null;
    let bestDist = hitR * hitR;
    for (const n of nodesRef.current) {
      const d = (n.x - x) ** 2 + (n.y - y) ** 2;
      if (d <= bestDist) {
        bestDist = d;
        best = n;
      }
    }
    return best;
  };

  const updateHoverHint = (node: InternalNode | null) => {
    hoverIdRef.current = node?.id ?? null;
    setHintLabel(node ? node.label : hint);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const node = findNode(e.clientX, e.clientY, rect);
    if (!node) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    if (e.pointerType === 'touch') e.preventDefault();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    dragRef.current = {
      node,
      offsetX: node.x - x,
      offsetY: node.y - y,
      lastX: x,
      lastY: y,
      vx: 0,
      vy: 0
    };
    node.vx = 0;
    node.vy = 0;
    updateHoverHint(node);
    setCursor('grabbing');
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (dragRef.current) {
      if (e.pointerType === 'touch') e.preventDefault();
      const { node, offsetX, offsetY } = dragRef.current;
      const nextX = Math.max(nodeRadius, Math.min(width - nodeRadius, x + offsetX));
      const nextY = Math.max(nodeRadius, Math.min(height - nodeRadius, y + offsetY));
      dragRef.current.vx = nextX - dragRef.current.lastX;
      dragRef.current.vy = nextY - dragRef.current.lastY;
      dragRef.current.lastX = nextX;
      dragRef.current.lastY = nextY;
      node.x = nextX;
      node.y = nextY;
      node.vx = 0;
      node.vy = 0;
      setCursor('grabbing');
      return;
    }

    const hovered = findNode(e.clientX, e.clientY, rect);
    updateHoverHint(hovered);
    setCursor(hovered ? 'grab' : 'default');
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    if (drag) {
      drag.node.vx = drag.vx * 0.85;
      drag.node.vy = drag.vy * 0.85;
      dragRef.current = null;
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const hovered = findNode(e.clientX, e.clientY, rect);
    updateHoverHint(hovered);
    setCursor(hovered ? 'grab' : 'default');
  };

  const handlePointerLeave = () => {
    if (dragRef.current) return;
    updateHoverHint(null);
    setCursor('default');
  };

  const cursorClass =
    cursor === 'grabbing' ? styles.cursorGrabbing : cursor === 'grab' ? styles.cursorGrab : styles.cursorDefault;

  return (
    <div className={styles.networkGraph} style={{ width, height }}>
      <canvas
        ref={canvasRef}
        className={`${styles.canvas} ${cursorClass}`}
        style={{ width, height }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerLeave}
      />
      <div className={styles.hint}>{hintLabel}</div>
    </div>
  );
};

export default NetworkGraph;
