import type { SphereShadeOpts } from './lighting';

/** 稳定伪随机 0~1，用于每泡独立光影性格 */
export const hash01 = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const rand = (a = 0, b = 1) => a + Math.random() * (b - a);

export const bubbleAlpha = (depth: number, scale = 1) => (0.82 + depth * 0.18) * scale;

export interface BubbleVisual {
  shadeOpts: SphereShadeOpts;
  filmBias: number;
  envAmt: number;
  envRgb: [number, number, number];
}

export const buildBubbleVisual = (seed: number, depth: number): BubbleVisual => ({
  shadeOpts: {
    seed,
    depth,
    shadeAmt: 0.06 + hash01(seed + 2.3) * 0.08,
    rimPeak: 0.36 + hash01(seed + 3.1) * 0.28,
    specBright: 0.68 + hash01(seed + 9.2) * 0.28,
    hash01
  },
  filmBias: hash01(seed + 11.6),
  envAmt: 0.06 + hash01(seed + 13.3) * 0.09,
  envRgb: hash01(seed + 23) > 0.5 ? [35, 70, 55] : [40, 65, 95]
});
