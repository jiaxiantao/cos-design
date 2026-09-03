import { frameDamp, terminalRiseForRadius } from './utils';
import type { Bubble } from './types';

export const createSeabedBubble = (
  id: number,
  width: number,
  height: number,
  speed: number,
  deep = false,
): Bubble => {
  const radius = deep
    ? 2.5 + Math.random() * 9
    : 4 + Math.random() * (Math.random() < 0.25 ? 18 : 10);
  const margin = radius + 8;
  const terminalRise = terminalRiseForRadius(radius, speed);
  const aspect = radius < 10 ? 0.985 + Math.random() * 0.02 : 0.96 + Math.random() * 0.03;

  return {
    id,
    x: margin + Math.random() * Math.max(1, width - margin * 2),
    y: height + radius + Math.random() * (deep ? 120 : 36),
    radius,
    terminalRise,
    drift: (Math.random() - 0.5) * 0.22,
    vx: (Math.random() - 0.5) * 0.15,
    vy: -terminalRise * (0.04 + Math.random() * 0.14),
    phase: Math.random() * Math.PI * 2,
    alpha: 0.42 + Math.random() * 0.38,
    aspect,
    deformAmp: 0.008 + Math.random() * 0.012 + Math.min(0.015, radius * 0.0006),
    deformPhase: Math.random() * Math.PI * 2,
    deformSpeed: 0.7 + Math.random() * 0.5,
    tilt: Math.random() * Math.PI * 2,
    pulseBoost: 0,
    streamStretch: 0,
    streamAngle: 0,
    mode2: 0,
    mode2Vel: 0,
    mode2Angle: Math.random() * Math.PI,
    mode3: 0,
    mode3Vel: 0,
    mode3Phase: Math.random() * Math.PI * 2,
    settle: 0,
  };
};

const ambientFlow = (x: number, y: number, time: number) => ({
  x: Math.sin(y * 0.009 + time * 0.48) * 0.12 + Math.cos(x * 0.006 - time * 0.32) * 0.09,
  y: Math.cos(x * 0.008 + time * 0.38) * 0.05,
});

export const integrateBubbleMotion = (
  bubble: Bubble,
  time: number,
  height: number,
  speedScale: number,
  frameScale: number,
) => {
  const depth = Math.min(1, Math.max(0, bubble.y / height));
  const depthBoost = 1 + (1 - depth) * 0.12;
  const targetUp = bubble.terminalRise * speedScale * depthBoost;

  const upSpeed = -bubble.vy;
  const accel = (targetUp - upSpeed) * (0.022 + bubble.radius * 0.0011);
  bubble.vy -= accel * frameScale;

  const wobbleAmp = 0.03 + bubble.radius * 0.0025;
  const surge =
    Math.sin(time * (1.1 + bubble.deformSpeed) + bubble.phase) * wobbleAmp +
    Math.sin(time * 2.1 + bubble.deformPhase) * wobbleAmp * 0.35;
  bubble.vy -= surge * 0.02 * frameScale;

  const sway =
    Math.sin(time * 0.85 + bubble.deformPhase) * (0.05 + bubble.radius * 0.003) +
    Math.cos(time * 0.5 + bubble.phase) * 0.03;
  bubble.vx += sway * 0.015 * frameScale;

  const flow = ambientFlow(bubble.x, bubble.y, time);
  bubble.vx += (bubble.drift * 0.015 + flow.x * 0.05) * frameScale;
  bubble.vy += flow.y * 0.025 * frameScale;

  bubble.vx *= frameDamp(0.968, frameScale);
  bubble.vy *= frameDamp(0.994, frameScale);

  bubble.x += (bubble.vx + flow.x * 0.22) * frameScale;
  bubble.y += bubble.vy * frameScale;
};

export const samplePointerFlow = (
  bx: number,
  by: number,
  px: number,
  py: number,
  pvx: number,
  pvy: number,
  pSpeed: number,
) => {
  const dx = bx - px;
  const dy = by - py;
  const dist = Math.hypot(dx, dy) || 1;
  const influence = 70 + Math.min(140, pSpeed * 3.8);
  const u = dist / influence;
  if (u > 1.35) return { fx: 0, fy: 0, strain: 0, strainAngle: 0, excite: 0 };

  const falloff = Math.exp(-u * u * 2.1);
  const nx = dx / dist;
  const ny = dy / dist;
  const pLen = Math.max(0.001, Math.hypot(pvx, pvy));
  const tx = pvx / pLen;
  const ty = pvy / pLen;
  const ox = -ty;
  const oy = tx;
  const side = dx * ox + dy * oy;
  const ahead = dx * tx + dy * ty;

  const drag = falloff * Math.min(1.15, pSpeed / 22);
  const wakeBoost = ahead < 0 ? 1.35 : 0.72;
  const vortex = falloff * Math.min(1, pSpeed / 18) * Math.tanh(side / (influence * 0.35));
  const pressure = falloff * Math.min(0.85, pSpeed / 30) * (1 - Math.abs(ahead) / (influence + 1));

  const fx = tx * drag * 1.55 * wakeBoost + ox * vortex * 1.25 + nx * pressure * 0.55;
  const fy = ty * drag * 1.55 * wakeBoost + oy * vortex * 1.25 + ny * pressure * 0.55;
  const strain = falloff * Math.min(1, pSpeed / 16) * (0.55 + Math.abs(vortex) * 0.45);
  const strainAngle = Math.atan2(fy + ty * 0.4, fx + tx * 0.4);
  const excite = falloff * Math.min(1.2, pSpeed / 14);

  return { fx, fy, strain, strainAngle, excite };
};

export const integrateSurfaceModes = (bubble: Bubble, frameScale: number) => {
  const omega2 = 0.22 + 3.4 / Math.sqrt(Math.max(6, bubble.radius));
  const omega3 = omega2 * 1.55;
  const damp2 = 0.045 + bubble.radius * 0.0009;
  const damp3 = 0.055 + bubble.radius * 0.001;

  bubble.mode2Vel += (-omega2 * omega2 * bubble.mode2 - damp2 * bubble.mode2Vel) * frameScale;
  bubble.mode2 += bubble.mode2Vel * frameScale;
  bubble.mode2 = Math.max(-1.1, Math.min(1.1, bubble.mode2));
  bubble.mode2 *= frameDamp(0.998, frameScale);

  bubble.mode3Vel += (-omega3 * omega3 * bubble.mode3 - damp3 * bubble.mode3Vel) * frameScale;
  bubble.mode3 += bubble.mode3Vel * frameScale;
  bubble.mode3 = Math.max(-0.9, Math.min(0.9, bubble.mode3));
  bubble.mode3 *= frameDamp(0.997, frameScale);
  bubble.mode3Phase += (0.04 + Math.abs(bubble.mode3Vel) * 0.8) * frameScale;

  bubble.streamStretch *= frameDamp(0.88, frameScale);
  if (Math.abs(bubble.streamStretch) < 0.004) bubble.streamStretch = 0;
  if (Math.abs(bubble.mode2) < 0.002 && Math.abs(bubble.mode2Vel) < 0.002) {
    bubble.mode2 = 0;
    bubble.mode2Vel = 0;
  }
  if (Math.abs(bubble.mode3) < 0.002 && Math.abs(bubble.mode3Vel) < 0.002) {
    bubble.mode3 = 0;
    bubble.mode3Vel = 0;
  }
};

export const exciteBubbleFromFlow = (
  bubble: Bubble,
  strain: number,
  strainAngle: number,
  excite: number,
  fx: number,
  fy: number,
) => {
  if (strain < 0.02 && excite < 0.02) return;

  const blend = Math.min(0.55, strain * 0.65);
  bubble.streamStretch = bubble.streamStretch * (1 - blend) + strain * blend;
  bubble.streamAngle = bubble.streamAngle * (1 - blend) + strainAngle * blend;

  const kick = excite * (0.06 + Math.min(0.05, bubble.radius * 0.0014));
  bubble.mode2Vel += kick * (0.75 + Math.random() * 0.85);
  bubble.mode2Angle = bubble.mode2Angle * 0.7 + strainAngle * 0.3;

  bubble.mode3Vel += kick * 0.45 * (Math.random() - 0.3);
  bubble.pulseBoost = Math.min(1.35, bubble.pulseBoost + excite * 0.08);
  bubble.tilt += (fx * 0.002 - fy * 0.0015) * excite;
};
