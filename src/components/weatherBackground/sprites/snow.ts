import type { Flake } from '../types';

/** 远景雪花：柔边光点 */
const makeDotSprite = (radius: number): HTMLCanvasElement => {
  const s = Math.ceil(radius * 2 + 4);
  const cv = document.createElement('canvas');
  cv.width = s;
  cv.height = s;
  const c = cv.getContext('2d')!;
  const grad = c.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, radius + 1);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.6, 'rgba(255, 255, 255, 0.85)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  c.fillStyle = grad;
  c.fillRect(0, 0, s, s);
  return cv;
};

/** 近景雪花：随机参数生成的六重对称冰晶 */
const makeCrystalSprite = (radius: number): HTMLCanvasElement => {
  const s = Math.ceil(radius * 2 + 6);
  const cv = document.createElement('canvas');
  cv.width = s;
  cv.height = s;
  const c = cv.getContext('2d')!;
  c.translate(s / 2, s / 2);
  c.strokeStyle = 'rgba(255, 255, 255, 0.95)';
  c.lineCap = 'round';
  c.lineWidth = Math.max(radius * 0.11, 0.7);
  c.shadowColor = 'rgba(255, 255, 255, 0.5)';
  c.shadowBlur = radius * 0.25;

  const branchPairs = 1 + Math.floor(Math.random() * 3);
  const branches = Array.from({ length: branchPairs }, () => ({
    pos: 0.3 + Math.random() * 0.5,
    len: radius * (0.22 + Math.random() * 0.34),
    angle: (Math.PI / 3) * (0.8 + Math.random() * 0.45),
  }));
  const hasTipFork = Math.random() < 0.55;
  const tipLen = radius * (0.14 + Math.random() * 0.12);
  const hasCore = Math.random() < 0.45;
  const coreR = radius * (0.14 + Math.random() * 0.14);

  for (let i = 0; i < 6; i++) {
    c.save();
    c.rotate((i * Math.PI) / 3);
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(0, -radius);

    for (const b of branches) {
      const by = -radius * b.pos;
      c.moveTo(0, by);
      c.lineTo(Math.sin(b.angle) * b.len, by - Math.cos(b.angle) * b.len);
      c.moveTo(0, by);
      c.lineTo(-Math.sin(b.angle) * b.len, by - Math.cos(b.angle) * b.len);
    }

    if (hasTipFork) {
      c.moveTo(0, -radius);
      c.lineTo(tipLen * 0.7, -radius - tipLen * 0.5);
      c.moveTo(0, -radius);
      c.lineTo(-tipLen * 0.7, -radius - tipLen * 0.5);
    }

    c.stroke();
    c.restore();
  }

  if (hasCore) {
    c.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3 - Math.PI / 2;
      const px = Math.cos(a) * coreR;
      const py = Math.sin(a) * coreR;
      if (i === 0) c.moveTo(px, py);
      else c.lineTo(px, py);
    }
    c.closePath();
    c.stroke();
  }

  return cv;
};

export interface FlakeSpritePool {
  dots: HTMLCanvasElement[];
  crystals: HTMLCanvasElement[];
}

/** 预生成少量雪花贴图供粒子复用（大雪 300 片不再各自一张 canvas） */
export const createFlakeSpritePool = (): FlakeSpritePool => ({
  dots: [1.2, 1.6, 2.0, 2.3].map((size) => makeDotSprite(size)),
  crystals: [2.6, 3.2, 3.8, 4.4, 5.0].map((size) => makeCrystalSprite(size * 2.4)),
});

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const makeFlake = (
  width: number,
  height: number,
  pool: FlakeSpritePool,
  y?: number,
): Flake => {
  const size = 1 + Math.pow(Math.random(), 1.6) * 4.2;
  const isCrystal = size >= 2.4;
  const sprite = isCrystal ? pick(pool.crystals) : pick(pool.dots);
  // 按粒子 size 缩放绘制，贴图本身来自共享池
  const drawSize = isCrystal ? size * 4.8 + 6 : size * 2 + 4;
  return {
    x: Math.random() * width,
    y: y ?? Math.random() * height,
    size,
    speed: 0.4 + size * 0.28 + Math.random() * 0.4,
    phase: Math.random() * Math.PI * 2,
    drift: (Math.random() - 0.5) * 0.4,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.025,
    opacity: 0.55 + Math.random() * 0.45,
    sprite,
    drawSize,
  };
};
