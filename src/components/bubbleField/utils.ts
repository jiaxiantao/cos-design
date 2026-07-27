export const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
export const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

export const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

export const frameDamp = (value: number, frameScale: number) => value ** frameScale;

export const hash01 = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const terminalRiseForRadius = (radius: number, speed: number, randomize = true) => {
  const buoyancy = 0.18 + Math.pow(radius / 18, 0.5) * 0.52;
  const jitter = randomize ? 0.8 + Math.random() * 0.35 : 1;
  return buoyancy * speed * jitter;
};
