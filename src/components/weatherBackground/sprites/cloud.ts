import type { Cloud, FogSprite } from '../types';

type Puff = { dx: number; dy: number; r: number };

/**
 * 预渲染单朵云。原本每帧要为每个 puff 创建径向渐变（阴天/雷暴可达 60 个/帧），
 * 云的形状与颜色整场不变、仅横向平移，这里把 puffs 烘焙成一张贴图。
 */
export function makeCloudSprite(
  scale: number,
  puffs: Puff[],
  rgb: [number, number, number],
  alpha: number,
): { sprite: HTMLCanvasElement; ox: number; oy: number } {
  const [r, g, b] = rgb;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of puffs) {
    const px = p.dx * scale;
    const py = p.dy * scale;
    const pr = p.r * scale;
    minX = Math.min(minX, px - pr);
    minY = Math.min(minY, py - pr);
    maxX = Math.max(maxX, px + pr);
    maxY = Math.max(maxY, py + pr);
  }

  const margin = 2;
  const ox = Math.floor(minX - margin);
  const oy = Math.floor(minY - margin);
  const width = Math.ceil(maxX + margin) - ox;
  const height = Math.ceil(maxY + margin) - oy;

  const sprite = document.createElement('canvas');
  sprite.width = width;
  sprite.height = height;
  const ctx = sprite.getContext('2d')!;

  for (const p of puffs) {
    const px = p.dx * scale - ox;
    const py = p.dy * scale - oy;
    const pr = p.r * scale;
    const grad = ctx.createRadialGradient(px, py, 0, px, py, pr);
    grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
    grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }

  return { sprite, ox, oy };
}

/** 组装带贴图的云对象（供 init-state 使用） */
export function makeCloud(
  width: number,
  height: number,
  cloudSpread: number,
  rgb: [number, number, number],
  alpha: number,
): Cloud {
  const scale = 0.7 + Math.random() * 0.9;
  const puffCount = 4 + Math.floor(Math.random() * 3);
  const puffs: Puff[] = Array.from({ length: puffCount }, (_, i) => ({
    dx: (i - puffCount / 2) * 26 + (Math.random() - 0.5) * 14,
    dy: (Math.random() - 0.5) * 14,
    r: 22 + Math.random() * 20,
  }));
  const { sprite, ox, oy } = makeCloudSprite(scale, puffs, rgb, alpha);
  return {
    x: Math.random() * (width + 240) - 120,
    y: height * 0.06 + Math.random() * height * cloudSpread,
    scale,
    speed: 0.12 + Math.random() * 0.22,
    puffs,
    sprite,
    ox,
    oy,
  };
}

/** 柔边圆雾贴图（alpha=1），绘制时按 bank 缩放并用 globalAlpha 叠加透明度 */
export function makeFogSprite(rgb: string, baseR = 120): FogSprite {
  const size = baseR * 2;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(baseR, baseR, 0, baseR, baseR, baseR);
  grad.addColorStop(0, `rgba(${rgb}, 1)`);
  grad.addColorStop(1, `rgba(${rgb}, 0)`);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(baseR, baseR, baseR, 0, Math.PI * 2);
  ctx.fill();
  return { canvas, baseR };
}
