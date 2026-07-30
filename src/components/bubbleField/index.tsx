import React, { useEffect, useRef } from 'react';
import { bindVisibilityPause } from '@cos-design/shared';
import { createPointerState, FRAME_MS, MAX_DPR } from './constants';
import { drawDynamicBackground, drawStaticBackground, createSnowSprite } from './background';
import { applyMergeAttraction, startNearbyMerges, updateMerges, resolveMergePose } from './merge';
import {
  createSeabedBubble,
  exciteBubbleFromFlow,
  integrateBubbleMotion,
  integrateSurfaceModes,
  samplePointerFlow
} from './physics';
import { drawBubble, drawMergingPair } from './render';
import { frameDamp } from './utils';
import type { ActiveMerge, Bubble, BubbleFieldProps, PointerState } from './types';
import styles from './style/index.module.less';

export type { ActiveMerge, Bubble, BubbleFieldProps, PointerState } from './types';

const BubbleField: React.FC<BubbleFieldProps> = ({
  width = 800,
  height = 500,
  bubbleCount = 36,
  speed = 1,
  color = '#7dd3fc',
  interactive = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubblesRef = useRef<Bubble[]>([]);
  const mergesRef = useRef<ActiveMerge[]>([]);
  const pointerRef = useRef<PointerState>(createPointerState());
  const timeRef = useRef(0);
  const spawnTimerRef = useRef(0);
  const bubbleIdRef = useRef(1);
  const bubbleSeedRef = useRef(0);
  const backgroundCacheRef = useRef<{ key: string; canvas: HTMLCanvasElement } | null>(null);
  const snowSpriteRef = useRef<HTMLCanvasElement | null>(null);
  const propsRef = useRef({ width, height, speed, color, interactive, bubbleCount });

  useEffect(() => {
    propsRef.current = { width, height, speed, color, interactive, bubbleCount };
  }, [width, height, speed, color, interactive, bubbleCount]);

  useEffect(() => {
    bubblesRef.current = Array.from({ length: bubbleCount }, () => {
      const bubble = createSeabedBubble(bubbleIdRef.current++, width, height, speed, true);
      bubble.y = height * (0.15 + Math.random() * 0.85);
      bubble.vy = -bubble.terminalRise * (0.35 + Math.random() * 0.35);
      return bubble;
    });
    mergesRef.current = [];
    pointerRef.current = createPointerState();
    timeRef.current = 0;
    spawnTimerRef.current = 0;
    bubbleSeedRef.current = 0;
  }, [bubbleCount, height, speed, width]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!snowSpriteRef.current) snowSpriteRef.current = createSnowSprite();
    const snowSprite = snowSpriteRef.current;
    let lastFrameTs = 0;

    let frameId = 0;
    let paused = document.hidden;
    const unbindVisibility = bindVisibilityPause((hidden) => {
      paused = hidden;
    });

    const toLocalPoint = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = width / Math.max(rect.width, 1);
      const scaleY = height / Math.max(rect.height, 1);
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    };

    const updatePointer = (clientX: number, clientY: number) => {
      if (!propsRef.current.interactive) return;
      const { x, y } = toLocalPoint(clientX, clientY);
      const pointer = pointerRef.current;
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
      pointerRef.current = createPointerState();
    };

    const onPointerMove = (event: PointerEvent) => {
      updatePointer(event.clientX, event.clientY);
    };

    const onPointerEnter = (event: PointerEvent) => {
      updatePointer(event.clientX, event.clientY);
    };

    const onPointerDown = (event: PointerEvent) => {
      updatePointer(event.clientX, event.clientY);
    };

    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerenter', onPointerEnter);
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointerleave', clearPointer);

    const draw = (frameTs = 0) => {
      frameId = requestAnimationFrame(draw);
      if (paused) return;

      if (!lastFrameTs) lastFrameTs = frameTs;
      const deltaMs = Math.min(40, Math.max(8, frameTs - lastFrameTs || FRAME_MS));
      lastFrameTs = frameTs;
      const frameScale = deltaMs / FRAME_MS;
      const deltaSec = deltaMs / 1000;
      timeRef.current += deltaSec * (reduceMotion ? 0.6 : 1);
      const time = timeRef.current;
      const { color: tint, speed: currentSpeed, bubbleCount: maxCount, interactive: isInteractive } = propsRef.current;

      const bgKey = `${width}x${height}@${dpr}:${tint}`;
      if (backgroundCacheRef.current?.key !== bgKey) {
        const bgCanvas = document.createElement('canvas');
        bgCanvas.width = canvas.width;
        bgCanvas.height = canvas.height;
        const bgCtx = bgCanvas.getContext('2d');
        if (bgCtx) {
          bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
          drawStaticBackground(bgCtx, width, height, tint);
          backgroundCacheRef.current = { key: bgKey, canvas: bgCanvas };
        }
      }

      if (backgroundCacheRef.current) {
        ctx.drawImage(backgroundCacheRef.current.canvas, 0, 0, width, height);
      }
      drawDynamicBackground(ctx, width, height, time, snowSprite, reduceMotion);

      spawnTimerRef.current += deltaSec;
      if (spawnTimerRef.current > 0.2 && bubblesRef.current.length < maxCount) {
        spawnTimerRef.current = 0;
        bubblesRef.current.push(createSeabedBubble(bubbleIdRef.current++, width, height, currentSpeed));
      }

      const pointer = pointerRef.current;
      if (pointer.active) {
        pointer.speed *= frameDamp(0.94, frameScale);
        pointer.vx *= frameDamp(0.94, frameScale);
        pointer.vy *= frameDamp(0.94, frameScale);
      }

      const mergingIds = new Set<number>();
      for (const merge of mergesRef.current) {
        mergingIds.add(merge.primaryId);
        mergingIds.add(merge.secondaryId);
      }

      for (const bubble of bubblesRef.current) {
        bubble.phase += 0.008 * frameScale;
        bubble.tilt += Math.sin(time * 0.2 + bubble.deformPhase) * 0.0012 * frameScale;
        bubble.pulseBoost *= frameDamp(0.92, frameScale);
        bubble.settle *= frameDamp(0.93, frameScale);

        if (bubble.settle > 0) {
          bubble.aspect += (0.985 - bubble.aspect) * 0.08 * frameScale;
        }
        if (bubble.settle < 0.01) bubble.settle = 0;

        if (!mergingIds.has(bubble.id)) {
          integrateBubbleMotion(bubble, time, height, currentSpeed, frameScale);
          integrateSurfaceModes(bubble, frameScale);

          const slip = Math.hypot(bubble.vx, bubble.vy + bubble.terminalRise * 0.35);
          if (slip > 0.55) {
            const angle = Math.atan2(bubble.vy, bubble.vx);
            bubble.streamStretch = Math.min(
              0.85,
              bubble.streamStretch * frameDamp(0.9, frameScale) + Math.min(0.35, (slip - 0.55) * 0.08) * frameScale
            );
            bubble.streamAngle =
              bubble.streamAngle * frameDamp(0.85, frameScale) + angle * (1 - frameDamp(0.85, frameScale));
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
            pointer.speed
          );
          if (flow.excite > 0.01 || Math.hypot(flow.fx, flow.fy) > 0.01) {
            const inertia = 1 / (0.75 + bubble.radius * 0.035);
            const motionScale = reduceMotion ? 0.55 : 1;
            bubble.vx += flow.fx * inertia * frameScale * motionScale;
            bubble.vy += flow.fy * inertia * 0.82 * frameScale * motionScale;
            exciteBubbleFromFlow(bubble, flow.strain, flow.strainAngle, flow.excite, flow.fx, flow.fy);
          }
        }

        if (bubble.y + bubble.radius < -12) {
          const next = createSeabedBubble(bubbleIdRef.current++, width, height, currentSpeed);
          Object.assign(bubble, next, { y: height + next.radius + bubbleSeedRef.current++ * 0.01 });
        }

        if (bubble.x < -bubble.radius * 1.5) bubble.x = width + bubble.radius;
        if (bubble.x > width + bubble.radius * 1.5) bubble.x = -bubble.radius;
      }

      const freeBubbles = bubblesRef.current.filter((b) => !mergingIds.has(b.id));
      applyMergeAttraction(freeBubbles);
      startNearbyMerges(freeBubbles, mergesRef.current, mergingIds);
      updateMerges(bubblesRef.current, mergesRef.current, currentSpeed, frameScale);

      mergingIds.clear();
      for (const merge of mergesRef.current) {
        mergingIds.add(merge.primaryId);
        mergingIds.add(merge.secondaryId);
      }

      for (const merge of mergesRef.current) {
        const pose = merge.pose ?? resolveMergePose(merge);
        const alpha = Math.min(0.9, 0.55 + pose.absorb * 0.2);
        drawMergingPair(ctx, pose.ax, pose.ay, pose.ar, pose.bx, pose.by, pose.br, tint, width, height, alpha);
      }

      const drawOrder = [...bubblesRef.current].sort((a, b) => b.y - a.y);
      for (const bubble of drawOrder) {
        if (mergingIds.has(bubble.id)) continue;
        drawBubble(ctx, bubble, time, tint, width, height);
      }
    };

    draw();
    return () => {
      cancelAnimationFrame(frameId);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerenter', onPointerEnter);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerleave', clearPointer);
      unbindVisibility();
    };
  }, [height, width]);

  return (
    <div className={styles.bubbleField} style={{ width, height }}>
      <canvas ref={canvasRef} className={styles.canvas} style={{ width, height }} />
    </div>
  );
};

export default BubbleField;
