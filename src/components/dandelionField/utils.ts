import { clamp } from '@cos-design/shared';

export const hash = (n: number) => {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
};

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

export const easeInOutCubic = (t: number) => (clamp(t, 0, 1) < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** 平滑阶跃，用于交叉渐变 */
export const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / Math.max(edge1 - edge0, 0.0001), 0, 1);
  return t * t * (3 - 2 * t);
};

export const softSat = (v: number, scale: number) => Math.tanh(v * scale);

export const lerpColor = (a: number, b: number, t: number) => a + (b - a) * t;

/** 鼠标帧移速 → 风力强度 0~1（约 14px/帧 视为满风） */
export const windGustFromSpeed = (pxPerFrame: number) => clamp(pxPerFrame / 14, 0, 1);

/** 风力向量视觉强度（与 gust 解耦，避免风力衰减后绒毛立刻静止） */
export const windVisualStrength = (wind: { x: number; y: number }) => clamp(Math.hypot(wind.x, wind.y) / 4.2, 0, 1);

/** 由落地 Y 反推景深，用于新株 */
export const depthFromGround = (ground: number, height: number) =>
  clamp((ground - height * 0.66) / Math.max(height * 0.28, 1), 0.08, 0.96);

/** 由 X + 景深估算地面 Y（与植株布局公式一致） */
export const groundAt = (x: number, depth: number, height: number) =>
  height * (0.66 + depth * 0.24 + (hash(x * 0.031 + depth * 7.1) - 0.5) * 0.035);
