export function displaceBolt(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  rough: number,
  depth: number,
): [number, number][] {
  if (depth <= 0)
    return [
      [x1, y1],
      [x2, y2],
    ];
  const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * rough;
  const my = (y1 + y2) / 2;
  const left = displaceBolt(x1, y1, mx, my, rough * 0.55, depth - 1);
  const right = displaceBolt(mx, my, x2, y2, rough * 0.55, depth - 1);
  return [...left.slice(0, -1), ...right];
}
