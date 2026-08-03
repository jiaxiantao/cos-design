/** Catmull-Rom 采样点转三次贝塞尔，绳索过每个夹点且整体平滑 */
export const buildRopeD = (points: Array<{ x: number; y: number }>, length = points.length) => {
  if (length < 2) return '';
  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 0; i < length - 1; i += 1) {
    const p1 = points[i];
    const p2 = points[i + 1];
    // 缓冲区可能比实际点数长，越界的槽位不能参与计算
    const p0 = i > 0 ? points[i - 1] : p1;
    const p3 = i + 2 < length ? points[i + 2] : p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
};
