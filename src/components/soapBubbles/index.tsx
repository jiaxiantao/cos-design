import React, { useEffect, useRef } from 'react';
import {
  bindPrefersReducedMotion,
  bindVisibilityPause,
  clamp,
  prefersReducedMotion,
  useCanvasBox
} from '@cos-design/shared';
import { drawDroplet, drawMergeShadows, drawMergingSoapPair, drawPop, drawSoapBubble } from './draw-bubble';
import { drawSoapCastShadow, resolveSceneLighting } from './lighting';
import { mergeBusyIds, resolveMergePose, sceneLightPos, type ActiveMerge } from './merge';
import { drawSoapSky } from './sky';
import type { Bubble, Droplet } from './types';
import { MAX_BUBBLE_R, MAX_DPR, TWO_PI } from './types';
import { rand } from './utils';
import styles from './style/index.module.less';

export interface SoapBubblesProps {
  width?: number;
  height?: number;
  /** 为 true 时铺满父容器（父级需有明确高度） */
  fill?: boolean;
  /** 气泡数量 8~80，默认 28 */
  count?: number;
  /** 飘动速度倍率 0~3，默认 1 */
  speed?: number;
  /** 是否响应点击爆裂，默认 true */
  interactive?: boolean;
  /** 画布无障碍标签 */
  ariaLabel?: string;
}

const spawnBubble = (w: number, h: number, id: number, fromBottom = true): Bubble => {
  const depth = rand(0.25, 1);
  const r = (10 + rand() * 46) * (0.5 + depth * 0.75);
  const rise = rand(12, 55) * (0.35 + depth * 0.8);
  return {
    id,
    x: rand(r, Math.max(r + 1, w - r)),
    y: fromBottom ? h + r + rand(0, h * 0.4) : rand(r, h - r),
    r,
    vx: rand(-22, 22),
    vy: -rise * rand(0.5, 1.2),
    phase: rand(0, TWO_PI),
    wobble: rand(0.55, 1.35),
    seed: rand(0, 1000),
    depth,
    pop: 0,
    popAng: 0,
    rise,
    gust: rand(0.55, 1.35),
    gustT: rand(0.3, 1.8),
    drift: rand(-28, 28),
    swayT: rand(0.4, 2.2),
    coolT: fromBottom ? rand(0.15, 0.55) : rand(0.4, 1.1)
  };
};

/**
 * 肥皂泡天空：虹彩薄膜气泡缓缓飘飞，点击即爆裂成水珠。
 */
const SoapBubbles: React.FC<SoapBubblesProps> = ({
  width: widthProp,
  height: heightProp,
  fill: fillProp = false,
  count = 28,
  speed = 1,
  interactive = true,
  ariaLabel = '肥皂泡背景'
}) => {
  const { hostRef, width, height, hostStyle } = useCanvasBox({
    fill: fillProp,
    width: widthProp,
    height: heightProp,
    defaultWidth: 800,
    defaultHeight: 500
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef({ count, speed, interactive });
  const clickRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    propsRef.current = { count, speed, interactive };
  }, [count, interactive, speed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onPointer = (e: PointerEvent) => {
      if (!propsRef.current.interactive) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      const rect = canvas.getBoundingClientRect();
      clickRef.current = {
        x: ((e.clientX - rect.left) / Math.max(rect.width, 1)) * width,
        y: ((e.clientY - rect.top) / Math.max(rect.height, 1)) * height
      };
    };
    canvas.addEventListener('pointerdown', onPointer);
    return () => canvas.removeEventListener('pointerdown', onPointer);
  }, [height, width]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const bubbles: Bubble[] = [];
    const droplets: Droplet[] = [];
    const merges: ActiveMerge[] = [];
    let nextId = 1;
    const allocId = () => nextId++;
    const n = clamp(Math.round(count), 8, 80);
    for (let i = 0; i < n; i++) bubbles.push(spawnBubble(width, height, allocId(), i > n * 0.35));

    const findBubble = (id: number) => bubbles.find((b) => b.id === id);

    let frameId = 0;
    let lastTs = 0;
    let time = 0;
    let paused = document.hidden;
    let reduced = prefersReducedMotion();
    const unbindVisibility = bindVisibilityPause((hidden) => {
      paused = hidden;
    });
    const unbindMotion = bindPrefersReducedMotion((value) => {
      reduced = value;
    });

    const popBubble = (b: Bubble, cx: number, cy: number) => {
      if (b.pop > 0) return;
      b.pop = 0.001;
      b.popAng = Math.atan2(cy - b.y, cx - b.x);

      const beads = 14 + Math.floor(b.r / 3);
      for (let i = 0; i < beads; i++) {
        const a = b.popAng + Math.PI + ((i / beads) * 2 - 1) * Math.PI * 0.85;
        const sp = rand(30, 90);
        droplets.push({
          x: b.x + Math.cos(a) * b.r * 0.95,
          y: b.y + Math.sin(a) * b.r * 0.95,
          vx: Math.cos(a) * sp * 0.35 + rand(-20, 20),
          vy: Math.sin(a) * sp * 0.35 + rand(-10, 30),
          r: rand(1.4, 3.2) * (0.55 + b.depth * 0.5),
          life: 0.45 + rand() * 0.35,
          maxLife: 0.8,
          kind: 1
        });
      }

      const mistN = 28 + Math.floor(b.r * 0.9);
      for (let i = 0; i < mistN; i++) {
        const a = rand(0, TWO_PI);
        const sp = rand(20, 160);
        droplets.push({
          x: b.x + Math.cos(a) * b.r * rand(0.2, 0.9),
          y: b.y + Math.sin(a) * b.r * rand(0.2, 0.9),
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - rand(10, 80),
          r: rand(0.6, 1.8) * (0.5 + b.depth * 0.4),
          life: 0.25 + rand() * 0.4,
          maxLife: 0.65,
          kind: 0
        });
      }
    };

    const draw = (ts: number) => {
      frameId = requestAnimationFrame(draw);
      if (paused) return;
      if (!lastTs) lastTs = ts;
      const dt = clamp((ts - lastTs) / 1000, 0.008, 0.033);
      lastTs = ts;
      const rate = propsRef.current.speed;

      drawSoapSky(ctx, width, height);
      const { x: lightX, y: lightY } = sceneLightPos(width, height);

      if (reduced) {
        for (const b of bubbles) {
          if (b.pop <= 0) drawSoapBubble(ctx, b, time, lightX, lightY, { skipShadow: true });
        }
        return;
      }

      time += dt * rate;

      if (clickRef.current) {
        const c = clickRef.current;
        clickRef.current = null;
        let best: Bubble | null = null;
        let bestD = Infinity;
        for (const b of bubbles) {
          if (b.pop > 0) continue;
          if (merges.some((m) => m.primaryId === b.id || m.secondaryId === b.id)) continue;
          const d = Math.hypot(b.x - c.x, b.y - c.y);
          if (d < b.r * 1.2 && d < bestD) {
            bestD = d;
            best = b;
          }
        }
        if (best) popBubble(best, c.x, c.y);
      }

      const target = clamp(Math.round(propsRef.current.count), 8, 80);
      while (bubbles.length < target) bubbles.push(spawnBubble(width, height, allocId(), true));

      const busyIds = mergeBusyIds(merges);

      for (const b of bubbles) {
        if (busyIds.has(b.id)) continue;
        if (b.coolT > 0) b.coolT = Math.max(0, b.coolT - dt * rate);

        if (b.pop > 0) {
          if (b.pop >= 1) {
            Object.assign(b, spawnBubble(width, height, allocId(), true));
            continue;
          }
          b.pop = Math.min(1, b.pop + dt * rate * 2.6);
          continue;
        }

        b.phase += dt * rate * b.wobble;

        b.gustT -= dt * rate;
        if (b.gustT <= 0) {
          const roll = Math.random();
          if (roll < 0.18) b.gust = rand(0.12, 0.4);
          else if (roll < 0.3) b.gust = rand(1.6, 2.4);
          else b.gust = rand(0.55, 1.35);
          b.gustT = rand(0.35, 2.4);
        }

        b.swayT -= dt * rate;
        if (b.swayT <= 0) {
          b.drift = rand(-36, 36) * (0.4 + Math.random());
          if (Math.random() < 0.2) b.drift *= rand(1.4, 2.2);
          b.swayT = rand(0.45, 2.6);
        }

        const noise = Math.sin(b.phase * 1.7 + b.seed) * 4 + Math.cos(b.phase * 0.9) * 3;
        const targetVx = b.drift + noise;
        const targetVy = -b.rise * b.gust + Math.sin(b.phase * 2.1 + b.seed * 0.2) * 6;
        const ease = 1 - Math.exp(-dt * rate * 1.6);
        b.vx += (targetVx - b.vx) * ease;
        b.vy += (targetVy - b.vy) * ease;
        if (Math.random() < dt * 0.35) b.vx += rand(-18, 18);

        b.x += b.vx * dt * rate;
        b.y += b.vy * dt * rate;

        if (b.x < -b.r) b.x = width + b.r;
        if (b.x > width + b.r) b.x = -b.r;
        if (b.y + b.r < 0) Object.assign(b, spawnBubble(width, height, allocId(), true));
      }

      for (let i = 0; i < bubbles.length; i++) {
        const a = bubbles[i];
        if (a.pop > 0 || busyIds.has(a.id) || a.coolT > 0) continue;
        for (let j = i + 1; j < bubbles.length; j++) {
          const b = bubbles[j];
          if (b.pop > 0 || busyIds.has(b.id) || b.coolT > 0) continue;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 1;
          const gap = dist - (a.r + b.r);
          const attractRange = Math.min(14, (a.r + b.r) * 0.18);
          if (gap > attractRange || gap < -1) continue;
          const strength = (1 - Math.max(0, gap) / attractRange) * 18 * dt * rate;
          const nx = dx / dist;
          const ny = dy / dist;
          a.vx += nx * strength;
          a.vy += ny * strength * 0.55;
          b.vx -= nx * strength;
          b.vy -= ny * strength * 0.55;
        }
      }

      for (let i = 0; i < bubbles.length; i++) {
        const a = bubbles[i];
        if (a.pop > 0 || a.coolT > 0 || busyIds.has(a.id)) continue;
        for (let j = i + 1; j < bubbles.length; j++) {
          const b = bubbles[j];
          if (b.pop > 0 || b.coolT > 0 || busyIds.has(b.id)) continue;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy);
          const touch = a.r + b.r - Math.min(a.r, b.r) * 0.1;
          if (dist >= touch || dist < 0.5) continue;

          const cx = a.x + (dx * a.r) / (a.r + b.r);
          const cy = a.y + (dy * a.r) / (a.r + b.r);

          if (Math.random() < 0.3) {
            popBubble(a, cx, cy);
            popBubble(b, cx, cy);
          } else {
            const primary = a.r >= b.r ? a : b;
            const secondary = a.r >= b.r ? b : a;
            const targetRadius = Math.min(MAX_BUBBLE_R, Math.cbrt(primary.r ** 3 + secondary.r ** 3));
            const touchDist = Math.max(0.5, Math.hypot(secondary.x - primary.x, secondary.y - primary.y));
            merges.push({
              primaryId: primary.id,
              secondaryId: secondary.id,
              progress: 0,
              initialSep: touchDist,
              targetRadius,
              startPrimaryRadius: primary.r,
              startSecondaryRadius: secondary.r,
              startPrimaryX: primary.x,
              startPrimaryY: primary.y,
              startSecondaryX: secondary.x,
              startSecondaryY: secondary.y,
              sharedVx: (primary.vx + secondary.vx) * 0.5,
              sharedVy: (primary.vy + secondary.vy) * 0.5,
              depth: Math.max(primary.depth, secondary.depth),
              seed: primary.seed
            });
            busyIds.add(primary.id);
            busyIds.add(secondary.id);
          }
        }
      }

      for (let i = merges.length - 1; i >= 0; i--) {
        const merge = merges[i];
        const primary = findBubble(merge.primaryId);
        const secondary = findBubble(merge.secondaryId);
        if (!primary || !secondary) {
          merges.splice(i, 1);
          continue;
        }

        merge.progress = Math.min(1, merge.progress + dt * rate * 0.92);
        const sharedVx = (primary.vx + secondary.vx) * 0.5;
        const sharedVy = (primary.vy + secondary.vy) * 0.5;
        merge.sharedVx = sharedVx;
        merge.sharedVy = sharedVy;
        const moveScale = dt * rate;
        merge.startPrimaryX += sharedVx * moveScale;
        merge.startPrimaryY += sharedVy * moveScale;
        merge.startSecondaryX += sharedVx * moveScale;
        merge.startSecondaryY += sharedVy * moveScale;

        const pose = resolveMergePose(merge);
        merge.pose = pose;
        const mass = Math.max(1, pose.ar + pose.br);
        const mx = (pose.ax * pose.ar + pose.bx * pose.br) / mass;
        const my = (pose.ay * pose.ar + pose.by * pose.br) / mass;
        const centerT = Math.min(1, pose.approach * 0.35 + pose.absorb * 0.65);
        primary.x = pose.ax + (mx - pose.ax) * centerT;
        primary.y = pose.ay + (my - pose.ay) * centerT;
        primary.r = pose.ar;
        secondary.x = pose.bx;
        secondary.y = pose.by;
        secondary.r = pose.br;
        primary.vx = sharedVx;
        primary.vy = sharedVy;
        secondary.vx = sharedVx;
        secondary.vy = sharedVy;

        if (merge.progress >= 1) {
          const finishMass = Math.max(1, pose.ar + pose.br);
          primary.x = (pose.ax * pose.ar + pose.bx * pose.br) / finishMass;
          primary.y = (pose.ay * pose.ar + pose.by * pose.br) / finishMass;
          primary.r = merge.targetRadius;
          primary.depth = merge.depth;
          primary.rise = (primary.rise + secondary.rise) * 0.5 * 0.9;
          primary.gust = (primary.gust + secondary.gust) * 0.5;
          primary.drift = (primary.drift + secondary.drift) * 0.5;
          primary.coolT = 0.35;
          const removeIdx = bubbles.findIndex((b) => b.id === secondary.id);
          if (removeIdx >= 0) bubbles.splice(removeIdx, 1);
          merges.splice(i, 1);
        }
      }

      while (bubbles.length < target) bubbles.push(spawnBubble(width, height, allocId(), true));
      if (bubbles.length > target) {
        for (let i = bubbles.length - 1; i >= 0 && bubbles.length > target; i--) {
          if (!busyIds.has(bubbles[i].id) && bubbles[i].pop <= 0) bubbles.splice(i, 1);
        }
      }

      const mergingIds = mergeBusyIds(merges);
      const order = bubbles
        .map((b, idx) => idx)
        .filter((idx) => !mergingIds.has(bubbles[idx].id))
        .sort((i, j) => bubbles[i].depth - bubbles[j].depth);

      for (const idx of order) {
        const b = bubbles[idx];
        if (b.pop > 0) continue;
        const light = resolveSceneLighting(b.x, b.y, lightX, lightY);
        drawSoapCastShadow(ctx, b.x, b.y, b.r, light, b.depth, 0.82 + b.depth * 0.18);
      }
      for (const merge of merges) {
        const pose = merge.pose ?? resolveMergePose(merge);
        const primary = findBubble(merge.primaryId);
        const secondary = findBubble(merge.secondaryId);
        if (!primary) continue;
        drawMergeShadows(ctx, merge, pose, primary, secondary, lightX, lightY);
      }

      for (const idx of order) {
        const b = bubbles[idx];
        if (b.pop > 0) {
          if (b.pop < 0.22) {
            ctx.save();
            ctx.globalAlpha = 1 - b.pop / 0.22;
            drawSoapBubble(ctx, b, time, lightX, lightY, { skipShadow: true });
            ctx.restore();
          }
          drawPop(ctx, b);
          continue;
        }
        drawSoapBubble(ctx, b, time, lightX, lightY, { skipShadow: true });
      }

      for (const merge of merges) {
        const pose = merge.pose ?? resolveMergePose(merge);
        const primary = findBubble(merge.primaryId);
        const secondary = findBubble(merge.secondaryId);
        if (!primary) continue;
        drawMergingSoapPair(ctx, pose, time, primary, secondary, merge.progress, lightX, lightY, {
          skipShadow: true
        });
      }

      for (let i = droplets.length - 1; i >= 0; i--) {
        const d = droplets[i];
        d.vy += (d.kind === 0 ? 180 : 260) * dt;
        d.vx *= Math.exp(-dt * (d.kind === 0 ? 1.8 : 1.1));
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.life -= dt * (d.kind === 0 ? 1.5 : 1.15);
        if (d.life <= 0) {
          droplets.splice(i, 1);
          continue;
        }
        drawDroplet(ctx, d);
      }
    };

    draw(0);
    return () => {
      cancelAnimationFrame(frameId);
      unbindVisibility();
      unbindMotion();
    };
  }, [count, height, width]);

  return (
    <div ref={hostRef} className={styles.soapBubbles} style={hostStyle} role="img" aria-label={ariaLabel}>
      <canvas ref={canvasRef} className={styles.canvas} style={{ width, height }} />
    </div>
  );
};

export default SoapBubbles;
