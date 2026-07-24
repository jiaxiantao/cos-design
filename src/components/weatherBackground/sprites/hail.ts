import type { Hailstone } from '../types';

/** 基准半径：池内贴图统一按此尺寸烘焙，绘制时按粒子 r 缩放 */
const HAIL_BASE_R = 3.2;

/** 冰块冰雹：随机凹凸的球状贴图 */
const makeHailSprite = (radius: number): HTMLCanvasElement => {
  const s = Math.ceil(radius * 2.8 + 4);
  const cv = document.createElement('canvas');
  cv.width = s;
  cv.height = s;
  const c = cv.getContext('2d')!;
  const cx = s / 2;
  const cy = s / 2;

  const segments = 9 + Math.floor(Math.random() * 5);
  const points = Array.from({ length: segments }, (_, i) => {
    const angle = (i / segments) * Math.PI * 2 + (Math.random() - 0.5) * 0.22;
    const dist = radius * (0.72 + Math.random() * 0.44);
    return { x: cx + Math.cos(angle) * dist, y: cy + Math.sin(angle) * dist };
  });

  const mid = (a: { x: number; y: number }, b: { x: number; y: number }) => ({
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2
  });

  c.beginPath();
  const start = mid(points[points.length - 1], points[0]);
  c.moveTo(start.x, start.y);
  for (let i = 0; i < points.length; i++) {
    const m = mid(points[i], points[(i + 1) % points.length]);
    c.quadraticCurveTo(points[i].x, points[i].y, m.x, m.y);
  }
  c.closePath();

  const lightX = cx - radius * 0.3;
  const lightY = cy - radius * 0.34;
  const bodyGrad = c.createRadialGradient(lightX, lightY, radius * 0.06, cx, cy, radius * 1.2);
  bodyGrad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
  bodyGrad.addColorStop(0.42, 'rgba(228, 241, 252, 0.96)');
  bodyGrad.addColorStop(0.82, 'rgba(176, 203, 224, 0.93)');
  bodyGrad.addColorStop(1, 'rgba(130, 162, 188, 0.9)');
  c.fillStyle = bodyGrad;
  c.fill();

  c.strokeStyle = 'rgba(155, 190, 215, 0.62)';
  c.lineWidth = Math.max(0.45, radius * 0.11);
  c.stroke();

  const dentCount = 1 + Math.floor(Math.random() * 2);
  for (let d = 0; d < dentCount; d++) {
    const dentAngle = Math.random() * Math.PI * 2;
    const dentX = cx + Math.cos(dentAngle) * radius * (0.28 + Math.random() * 0.35);
    const dentY = cy + Math.sin(dentAngle) * radius * (0.28 + Math.random() * 0.35);
    c.beginPath();
    c.ellipse(
      dentX,
      dentY,
      radius * (0.14 + Math.random() * 0.1),
      radius * (0.1 + Math.random() * 0.08),
      dentAngle,
      0,
      Math.PI * 2
    );
    c.fillStyle = 'rgba(105, 135, 165, 0.28)';
    c.fill();
  }

  if (Math.random() < 0.75) {
    const bumpAngle = Math.random() * Math.PI * 2;
    const bumpX = cx + Math.cos(bumpAngle) * radius * (0.38 + Math.random() * 0.28);
    const bumpY = cy + Math.sin(bumpAngle) * radius * (0.38 + Math.random() * 0.28);
    c.beginPath();
    c.arc(bumpX, bumpY, radius * (0.1 + Math.random() * 0.08), 0, Math.PI * 2);
    c.fillStyle = 'rgba(255, 255, 255, 0.55)';
    c.fill();
  }

  c.beginPath();
  c.ellipse(cx - radius * 0.34, cy - radius * 0.36, radius * 0.24, radius * 0.17, -0.35, 0, Math.PI * 2);
  c.fillStyle = 'rgba(255, 255, 255, 0.78)';
  c.fill();

  return cv;
};

/** 预生成共享冰雹贴图池；reset 只换贴图引用，不再分配新 canvas */
export const createHailSpritePool = (count = 16): HTMLCanvasElement[] =>
  Array.from({ length: count }, () => makeHailSprite(HAIL_BASE_R));

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const resetHailstone = (
  h: Hailstone,
  width: number,
  height: number,
  pool: HTMLCanvasElement[],
  spawnAbove = true,
  sizeRange?: { min: number; max: number },
  speedMul = 1
) => {
  const minR = sizeRange?.min ?? 1.4;
  const maxR = sizeRange?.max ?? 4.8;
  h.r = minR + Math.pow(Math.random(), 1.35) * (maxR - minR);
  h.x = Math.random() * (width + 260) - 130 + (Math.random() - 0.5) * 40;
  h.y = spawnAbove ? -h.r - Math.random() * height * 0.55 : Math.random() * height;
  h.vx = (-1.2 - Math.random() * 4.8 + (Math.random() - 0.5) * 1.2) * speedMul;
  h.vy = (5.5 + Math.random() * 11) * speedMul;
  h.bounces = 0;
  h.opacity = 0.45 + Math.random() * 0.55;
  h.delay = Math.floor(Math.random() * (spawnAbove ? 110 : 45));
  h.gravity = (0.11 + Math.random() * 0.14) * (0.9 + speedMul * 0.1);
  h.phase = Math.random() * Math.PI * 2;
  h.gust = (Math.random() - 0.5) * 1.4;
  h.maxBounces = Math.random() < 0.62 ? 1 : 0;
  h.sprite = pick(pool);
  h.drawSize = h.r * 2.8 + 4;
  h.rotation = Math.random() * Math.PI * 2;
  h.rotationSpeed = (Math.random() - 0.5) * 0.06;
};

export const makeHailstone = (
  width: number,
  height: number,
  pool: HTMLCanvasElement[],
  sizeRange?: { min: number; max: number },
  speedMul = 1
): Hailstone => {
  const h: Hailstone = {
    x: 0,
    y: 0,
    r: 2,
    vx: 0,
    vy: 0,
    bounces: 0,
    opacity: 1,
    delay: 0,
    gravity: 0.16,
    phase: 0,
    gust: 0,
    maxBounces: 1,
    sprite: pool[0],
    drawSize: 2 * 2.8 + 4,
    rotation: 0,
    rotationSpeed: 0
  };
  resetHailstone(h, width, height, pool, Math.random() < 0.72, sizeRange, speedMul);
  return h;
};
