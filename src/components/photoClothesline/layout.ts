import { BAND_POINTS, BAND_RECOVER_RATE, GRAVITY_ACCEL, PHYSICS_STEP_S, PIN_GRIP, SPIN_K, SWING_K } from './constants';
import { clamp, pseudoRandom } from './math';
import type { Layout, Physics, RopeAnchor } from './model';

export interface LayoutInput {
  count: number;
  viewportWidth: number;
  viewportHeight: number;
  photoWidth: number;
  photoHeight: number;
  photoGap: number;
  ropeTop: number;
  ropeSag: number;
  bandLength: number;
  maxPull: number;
  tilt: number;
}

export const buildLayout = ({
  count,
  viewportWidth,
  viewportHeight,
  photoWidth,
  photoHeight,
  photoGap,
  ropeTop,
  ropeSag,
  bandLength,
  maxPull,
  tilt
}: LayoutInput): Layout => {
  const contentWidth = count > 0 ? count * photoWidth + (count - 1) * photoGap : 0;
  const sidePadding = Math.round(photoWidth * 0.55);
  // 主绳始终铺满可视区，窄内容时照片居中，不会出现半截绳子
  const railWidth = Math.max(contentWidth + sidePadding * 2, viewportWidth, photoWidth * 2);
  const padding = (railWidth - contentWidth) / 2;
  const step = photoWidth + photoGap;

  const pinXs: number[] = [];
  for (let index = 0; index < count; index += 1) {
    pinXs.push(padding + index * step + photoWidth * (0.4 + pseudoRandom(index * 5.13) * 0.2));
  }

  /** 主绳整体是一条均匀的抛物线弧，最深处等于 ropeSag */
  const baseRopeY = (x: number) => {
    const t = railWidth > 0 ? clamp(x / railWidth, 0, 1) : 0;
    return ropeTop + ropeSag * 4 * t * (1 - t);
  };

  /** 夹点之间的余绳，让绳子在两张照片中间再垂一点 */
  const spanSag = Math.min(20, photoGap * 0.24 + 5);

  const cardLefts: number[] = [];
  const cardTops: number[] = [];
  const pinOffsets: number[] = [];
  const anchorYs: number[] = [];
  const baseRots: number[] = [];
  const centers: number[] = [];

  for (let index = 0; index < count; index += 1) {
    const left = padding + index * step;
    const pinX = pinXs[index];
    const anchorY = baseRopeY(pinX);
    cardLefts.push(left);
    pinOffsets.push(pinX - left);
    anchorYs.push(anchorY);
    // 照片挂在吊带末端，夹子再往上探出一截咬住吊带
    cardTops.push(anchorY + bandLength + PIN_GRIP);
    baseRots.push((pseudoRandom(index * 3.71) * 2 - 1) * tilt);
    centers.push(left + photoWidth / 2);
  }

  const anchors: RopeAnchor[] = [{ x: 0, baseY: baseRopeY(0), pulls: [] }];
  for (let index = 0; index < count; index += 1) {
    const previousX = index === 0 ? 0 : pinXs[index - 1];
    const midX = (previousX + pinXs[index]) / 2;
    const isEdgeSpan = index === 0;
    anchors.push({
      x: midX,
      baseY: baseRopeY(midX) + spanSag * (isEdgeSpan ? 0.5 : 1),
      pulls: isEdgeSpan
        ? [{ index, weight: 0.3 }]
        : [
            { index: index - 1, weight: 0.45 },
            { index, weight: 0.45 }
          ]
    });
    anchors.push({ x: pinXs[index], baseY: baseRopeY(pinXs[index]), pulls: [{ index, weight: 1 }] });
  }
  if (count > 0) {
    const midX = (pinXs[count - 1] + railWidth) / 2;
    anchors.push({
      x: midX,
      baseY: baseRopeY(midX) + spanSag * 0.5,
      pulls: [{ index: count - 1, weight: 0.3 }]
    });
  }
  anchors.push({ x: railWidth, baseY: baseRopeY(railWidth), pulls: [] });

  return {
    railWidth,
    stageHeight: Math.max(
      viewportHeight,
      Math.ceil(ropeTop + ropeSag + bandLength + PIN_GRIP + photoHeight + maxPull + 40)
    ),
    cardLefts,
    cardTops,
    pinOffsets,
    pinXs,
    anchorYs,
    baseRots,
    centers,
    anchors
  };
};

export interface PhysicsInput {
  bandLength: number;
  damping: number;
  maxPull: number;
  stiffness: number;
  tension: number;
}

export const buildPhysics = ({ bandLength, damping, maxPull, stiffness, tension }: PhysicsInput): Physics => {
  const springK = 420 * clamp(stiffness, 0.1, 3);
  const zeta = clamp(damping, 0.02, 1);
  const length = Math.max(8, bandLength);
  return {
    bandLength: length,
    segLength: length / (BAND_POINTS - 1),
    gravityAccel: GRAVITY_ACCEL,
    chainKeep: Math.exp(-(0.6 + zeta * 6) * PHYSICS_STEP_S),
    swingDamp: 2 * clamp(0.28 + zeta, 0.1, 1) * Math.sqrt(SWING_K),
    spinDamp: 2 * clamp(0.35 + zeta, 0.1, 1.2) * Math.sqrt(SPIN_K),
    bandK: springK * 0.9,
    bandRecover: BAND_RECOVER_RATE,
    springK,
    // 主绳阻尼比单独抬高：真实的绳子挂着重物不会像弹簧一样来回振好几下
    springC: 2 * clamp(0.45 + zeta, 0.1, 1.2) * Math.sqrt(springK),
    neighborK: springK * clamp(tension, 0, 1),
    maxPull: Math.max(16, maxPull)
  };
};
