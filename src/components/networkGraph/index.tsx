import React, { useEffect, useRef } from 'react';
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

const NetworkGraph: React.FC<NetworkGraphProps> = ({
  width = 600,
  height = 420,
  nodes = DEFAULT_NODES,
  edges = DEFAULT_EDGES,
  linkColor = 'rgb(148 163 184 / 35%)',
  nodeRadius = 20
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<InternalNode[]>([]);
  const dragRef = useRef<{ node: InternalNode; offsetX: number; offsetY: number } | null>(null);

  useEffect(() => {
    if (!nodes.length) {
      nodesRef.current = [];
      return;
    }

    nodesRef.current = nodes.map((n, i) => ({
      id: n.id,
      label: n.label || n.id,
      color: n.color || '#38bdf8',
      x: width / 2 + Math.cos((i / nodes.length) * Math.PI * 2) * 140,
      y: height / 2 + Math.sin((i / nodes.length) * Math.PI * 2) * 120,
      vx: 0,
      vy: 0
    }));
  }, [height, nodes, width]);

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

    const nodeMap = () => {
      const map = new Map<string, InternalNode>();
      nodesRef.current.forEach((n) => map.set(n.id, n));
      return map;
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

    const render = () => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      const map = nodeMap();

      ctx.lineWidth = 1.5;
      ctx.strokeStyle = linkColor;
      for (const edge of edges) {
        const a = map.get(edge.source);
        const b = map.get(edge.target);
        if (!a || !b) continue;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      for (const node of nodesRef.current) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.globalAlpha = 0.88;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = 'rgb(255 255 255 / 30%)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.font = '11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label, node.x, Math.min(height - 8, node.y + nodeRadius + 14));
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
  }, [edges, height, linkColor, nodeRadius, width]);

  const findNode = (clientX: number, clientY: number, rect: DOMRect) => {
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    return nodesRef.current.find((n) => (n.x - x) ** 2 + (n.y - y) ** 2 < nodeRadius ** 2) || null;
  };

  const handlePointerDown = (clientX: number, clientY: number, rect: DOMRect) => {
    const node = findNode(clientX, clientY, rect);
    if (node) {
      dragRef.current = { node, offsetX: node.x - (clientX - rect.left), offsetY: node.y - (clientY - rect.top) };
    }
  };

  const handlePointerMove = (clientX: number, clientY: number, rect: DOMRect) => {
    if (!dragRef.current) return;
    const { node, offsetX, offsetY } = dragRef.current;
    node.x = clientX - rect.left + offsetX;
    node.y = clientY - rect.top + offsetY;
    node.vx = 0;
    node.vy = 0;
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  return (
    <div className={styles.networkGraph} style={{ width, height }}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        style={{ width, height }}
        onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect())}
        onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect())}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={(e) => {
          const t = e.touches[0];
          if (t) handlePointerDown(t.clientX, t.clientY, e.currentTarget.getBoundingClientRect());
        }}
        onTouchMove={(e) => {
          const t = e.touches[0];
          if (t) handlePointerMove(t.clientX, t.clientY, e.currentTarget.getBoundingClientRect());
        }}
        onTouchEnd={handlePointerUp}
      />
      <div className={styles.hint}>拖拽节点调整布局</div>
    </div>
  );
};

export default NetworkGraph;
