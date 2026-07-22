import type { Hailstone } from '../types';

/** 不规则冰雹：随机凹凸的球状贴图，每颗形态固定不闪烁 */
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

  // 随机凹陷阴影
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

  // 随机突起高光
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

export const resetHailstone = (h: Hailstone, width: number, height: number, spawnAbove = true) => {
  // 横向覆盖略宽于画布，避免边缘规律性；少量偏置制造簇状但不整齐
  h.x = Math.random() * (width + 260) - 130 + (Math.random() - 0.5) * 40;
  h.y = spawnAbove ? -h.r - Math.random() * height * 0.55 : Math.random() * height;
  h.r = 1.4 + Math.pow(Math.random(), 1.35) * 3.4;
  h.vx = -1.2 - Math.random() * 4.8 + (Math.random() - 0.5) * 1.2;
  h.vy = 5.5 + Math.random() * 11;
  h.bounces = 0;
  h.opacity = 0.45 + Math.random() * 0.55;
  h.delay = Math.floor(Math.random() * (spawnAbove ? 110 : 45));
  h.gravity = 0.11 + Math.random() * 0.14;
  h.phase = Math.random() * Math.PI * 2;
  h.gust = (Math.random() - 0.5) * 1.4;
  h.maxBounces = Math.random() < 0.62 ? 1 : 0;
  h.sprite = makeHailSprite(h.r);
  h.rotation = Math.random() * Math.PI * 2;
  h.rotationSpeed = (Math.random() - 0.5) * 0.06;
};

export const makeHailstone = (width: number, height: number): Hailstone => {
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
    sprite: makeHailSprite(2),
    rotation: 0,
    rotationSpeed: 0
  };
  resetHailstone(h, width, height, Math.random() < 0.72);
  return h;
};
