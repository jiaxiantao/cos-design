import {
  bindPrefersReducedMotion,
  bindVisibilityPause,
  observeElementSize,
  prefersReducedMotion,
  resolveCanvasBoxSize,
  applyCanvasHostBox,
} from '@cos-design/shared';
import { createPointerState, FRAME_MS, MAX_DPR } from '../constants';
import { createSnowSprite, drawDynamicBackground, drawStaticBackground } from '../background';
import { applyMergeAttraction, resolveMergePose, startNearbyMerges, updateMerges } from '../merge';
import {
  createSeabedBubble,
  exciteBubbleFromFlow,
  integrateBubbleMotion,
  integrateSurfaceModes,
  samplePointerFlow,
} from '../physics';
import { drawBubble, drawMergingPair } from '../render';
import { frameDamp } from '../utils';
import type { ActiveMerge, Bubble, PointerState } from '../types';
import type { BubbleFieldController, BubbleFieldOptions } from './types';

const P = 'cos-bubble-field';
const DEFAULT_W = 800;
const DEFAULT_H = 500;

export function createBubbleField(
  container: HTMLElement,
  initial: BubbleFieldOptions = {},
): BubbleFieldController {
  let options: BubbleFieldOptions = {
    fill: false,
    bubbleCount: 36,
    speed: 1,
    color: '#7dd3fc',
    interactive: true,
    ...initial,
  };
  let destroyed = false;
  let width = options.width ?? DEFAULT_W;
  let height = options.height ?? DEFAULT_H;
  let frameId = 0;
  let lastFrameTs = 0;
  let paused = typeof document !== 'undefined' ? document.hidden : false;
  let reduced = prefersReducedMotion();
  let sizeCleanup: (() => void) | null = null;
  let unbindVisibility: (() => void) | null = null;
  let unbindMotion: (() => void) | null = null;

  const bubbles: Bubble[] = [];
  const merges: ActiveMerge[] = [];
  let pointer: PointerState = createPointerState();
  let time = 0;
  let spawnTimer = 0;
  let bubbleId = 1;
  let bubbleSeed = 0;
  let backgroundCache: { key: string; canvas: HTMLCanvasElement } | null = null;
  let snowSprite: HTMLCanvasElement | null = null;

  const root = document.createElement('div');
  root.className = P;
  const canvas = document.createElement('canvas');
  canvas.className = `${P}__canvas`;
  root.appendChild(canvas);
  container.appendChild(root);

  const initBubbles = () => {
    bubbles.length = 0;
    const count = options.bubbleCount ?? 36;
    const speed = options.speed ?? 1;
    for (let i = 0; i < count; i++) {
      const bubble = createSeabedBubble(bubbleId++, width, height, speed, true);
      bubble.y = height * (0.15 + Math.random() * 0.85);
      bubble.vy = -bubble.terminalRise * (0.35 + Math.random() * 0.35);
      bubbles.push(bubble);
    }
    merges.length = 0;
    pointer = createPointerState();
    time = 0;
    spawnTimer = 0;
    bubbleSeed = 0;
  };

  const applyLayout = () => {
    applyCanvasHostBox(container, root, {
      fill: Boolean(options.fill),
      width: width,
      height: height,
    });
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  };

  const syncCanvas = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, dpr };
  };

  const bindSize = () => {
    sizeCleanup?.();
    sizeCleanup = null;
    if (!(options.fill ?? false)) {
      width = options.width ?? DEFAULT_W;
      height = options.height ?? DEFAULT_H;
      applyLayout();
      syncCanvas();
      initBubbles();
      return;
    }
    sizeCleanup = observeElementSize(container, (measured) => {
      const box = resolveCanvasBoxSize({
        fill: true,
        width: options.width,
        height: options.height,
        defaultWidth: DEFAULT_W,
        defaultHeight: DEFAULT_H,
        measured,
      });
      width = box.width;
      height = box.height;
      applyLayout();
      syncCanvas();
      initBubbles();
    });
  };

  const toLocalPoint = (clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = width / Math.max(rect.width, 1);
    const scaleY = height / Math.max(rect.height, 1);
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const updatePointer = (clientX: number, clientY: number) => {
    if (!(options.interactive ?? true)) return;
    const { x, y } = toLocalPoint(clientX, clientY);
    const now = performance.now();
    const dt = pointer.lastTs > 0 ? Math.max(1, now - pointer.lastTs) : 16;
    if (pointer.active) {
      const dx = x - pointer.x;
      const dy = y - pointer.y;
      const frameScale = 16 / dt;
      const instantVx = dx * frameScale;
      const instantVy = dy * frameScale;
      const instantSpeed = Math.hypot(instantVx, instantVy);
      pointer.vx = pointer.vx * 0.55 + instantVx * 0.45;
      pointer.vy = pointer.vy * 0.55 + instantVy * 0.45;
      pointer.speed = pointer.speed * 0.55 + instantSpeed * 0.45;
    } else {
      pointer.vx = 0;
      pointer.vy = 0;
      pointer.speed = 0;
    }
    pointer.prevX = pointer.x;
    pointer.prevY = pointer.y;
    pointer.x = x;
    pointer.y = y;
    pointer.active = true;
    pointer.lastTs = now;
  };

  const clearPointer = () => {
    pointer = createPointerState();
  };

  const onPointerMove = (e: PointerEvent) => updatePointer(e.clientX, e.clientY);
  const onPointerEnter = (e: PointerEvent) => updatePointer(e.clientX, e.clientY);
  const onPointerDown = (e: PointerEvent) => updatePointer(e.clientX, e.clientY);

  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerenter', onPointerEnter);
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointerleave', clearPointer);

  const ensureBackground = (ctx: CanvasRenderingContext2D, dpr: number, tint: string) => {
    const bgKey = `${width}x${height}@${dpr}:${tint}`;
    if (backgroundCache?.key !== bgKey) {
      const bgCanvas = document.createElement('canvas');
      bgCanvas.width = canvas.width;
      bgCanvas.height = canvas.height;
      const bgCtx = bgCanvas.getContext('2d');
      if (bgCtx) {
        bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        drawStaticBackground(bgCtx, width, height, tint);
        backgroundCache = { key: bgKey, canvas: bgCanvas };
      }
    }
    if (backgroundCache) ctx.drawImage(backgroundCache.canvas, 0, 0, width, height);
  };

  const paintStaticFrame = () => {
    const { ctx, dpr } = syncCanvas();
    if (!ctx) return;
    if (!snowSprite) snowSprite = createSnowSprite();
    const tint = options.color ?? '#7dd3fc';
    ensureBackground(ctx, dpr, tint);
    drawDynamicBackground(ctx, width, height, time, snowSprite, true);
    const drawOrder = [...bubbles].sort((a, b) => b.y - a.y);
    for (const bubble of drawOrder) drawBubble(ctx, bubble, time, tint, width, height);
  };

  const draw = (frameTs = 0) => {
    if (destroyed) return;
    frameId = requestAnimationFrame(draw);
    if (paused || reduced) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    if (!snowSprite) snowSprite = createSnowSprite();

    if (!lastFrameTs) lastFrameTs = frameTs;
    const deltaMs = Math.min(40, Math.max(8, frameTs - lastFrameTs || FRAME_MS));
    lastFrameTs = frameTs;
    const frameScale = deltaMs / FRAME_MS;
    const deltaSec = deltaMs / 1000;
    time += deltaSec;

    const tint = options.color ?? '#7dd3fc';
    const currentSpeed = options.speed ?? 1;
    const maxCount = options.bubbleCount ?? 36;
    const isInteractive = options.interactive ?? true;

    ensureBackground(ctx, dpr, tint);
    drawDynamicBackground(ctx, width, height, time, snowSprite, false);

    spawnTimer += deltaSec;
    if (spawnTimer > 0.2 && bubbles.length < maxCount) {
      spawnTimer = 0;
      bubbles.push(createSeabedBubble(bubbleId++, width, height, currentSpeed));
    }

    if (pointer.active) {
      pointer.speed *= frameDamp(0.94, frameScale);
      pointer.vx *= frameDamp(0.94, frameScale);
      pointer.vy *= frameDamp(0.94, frameScale);
    }

    const mergingIds = new Set<number>();
    for (const merge of merges) {
      mergingIds.add(merge.primaryId);
      mergingIds.add(merge.secondaryId);
    }

    for (const bubble of bubbles) {
      bubble.phase += 0.008 * frameScale;
      bubble.tilt += Math.sin(time * 0.2 + bubble.deformPhase) * 0.0012 * frameScale;
      bubble.pulseBoost *= frameDamp(0.92, frameScale);
      bubble.settle *= frameDamp(0.93, frameScale);
      if (bubble.settle > 0) bubble.aspect += (0.985 - bubble.aspect) * 0.08 * frameScale;
      if (bubble.settle < 0.01) bubble.settle = 0;

      if (!mergingIds.has(bubble.id)) {
        integrateBubbleMotion(bubble, time, height, currentSpeed, frameScale);
        integrateSurfaceModes(bubble, frameScale);
        const slip = Math.hypot(bubble.vx, bubble.vy + bubble.terminalRise * 0.35);
        if (slip > 0.55) {
          const angle = Math.atan2(bubble.vy, bubble.vx);
          bubble.streamStretch = Math.min(
            0.85,
            bubble.streamStretch * frameDamp(0.9, frameScale) +
              Math.min(0.35, (slip - 0.55) * 0.08) * frameScale,
          );
          bubble.streamAngle =
            bubble.streamAngle * frameDamp(0.85, frameScale) +
            angle * (1 - frameDamp(0.85, frameScale));
        }
      } else {
        integrateSurfaceModes(bubble, frameScale);
      }

      if (isInteractive && pointer.active && pointer.speed > 0.2 && !mergingIds.has(bubble.id)) {
        const flow = samplePointerFlow(
          bubble.x,
          bubble.y,
          pointer.x,
          pointer.y,
          pointer.vx,
          pointer.vy,
          pointer.speed,
        );
        if (flow.excite > 0.01 || Math.hypot(flow.fx, flow.fy) > 0.01) {
          const inertia = 1 / (0.75 + bubble.radius * 0.035);
          bubble.vx += flow.fx * inertia * frameScale;
          bubble.vy += flow.fy * inertia * 0.82 * frameScale;
          exciteBubbleFromFlow(
            bubble,
            flow.strain,
            flow.strainAngle,
            flow.excite,
            flow.fx,
            flow.fy,
          );
        }
      }

      if (bubble.y + bubble.radius < -12) {
        const next = createSeabedBubble(bubbleId++, width, height, currentSpeed);
        Object.assign(bubble, next, { y: height + next.radius + bubbleSeed++ * 0.01 });
      }
      if (bubble.x < -bubble.radius * 1.5) bubble.x = width + bubble.radius;
      if (bubble.x > width + bubble.radius * 1.5) bubble.x = -bubble.radius;
    }

    const freeBubbles = bubbles.filter((b) => !mergingIds.has(b.id));
    applyMergeAttraction(freeBubbles);
    startNearbyMerges(freeBubbles, merges, mergingIds);
    updateMerges(bubbles, merges, currentSpeed, frameScale);

    mergingIds.clear();
    for (const merge of merges) {
      mergingIds.add(merge.primaryId);
      mergingIds.add(merge.secondaryId);
    }

    for (const merge of merges) {
      const pose = merge.pose ?? resolveMergePose(merge);
      const alpha = Math.min(0.9, 0.55 + pose.absorb * 0.2);
      drawMergingPair(
        ctx,
        pose.ax,
        pose.ay,
        pose.ar,
        pose.bx,
        pose.by,
        pose.br,
        tint,
        width,
        height,
        alpha,
      );
    }

    const drawOrder = [...bubbles].sort((a, b) => b.y - a.y);
    for (const bubble of drawOrder) {
      if (mergingIds.has(bubble.id)) continue;
      drawBubble(ctx, bubble, time, tint, width, height);
    }
  };

  const cleanup = () => {
    cancelAnimationFrame(frameId);
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerenter', onPointerEnter);
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointerleave', clearPointer);
    unbindVisibility?.();
    unbindMotion?.();
    sizeCleanup?.();
  };

  unbindVisibility = bindVisibilityPause((h) => {
    paused = h;
  });
  unbindMotion = bindPrefersReducedMotion((v) => {
    reduced = v;
    if (reduced) paintStaticFrame();
    else draw();
  });

  bindSize();
  if (reduced) paintStaticFrame();
  else draw();

  return {
    update(next) {
      options = { ...options, ...next };
      bindSize();
      if (reduced) paintStaticFrame();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cleanup();
      root.remove();
    },
  };
}
