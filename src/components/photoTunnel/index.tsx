import React, { useCallback, useEffect, useRef, useState } from 'react';
import { bindVisibilityPause } from '@cos-design/shared';
import styles from './style/index.module.less';
import type { PhotoTunnelProps } from './types';

const CLICK_SLOP = 6;
const REST_VELOCITY = 0.35;
const MAX_VELOCITY = 8;
const SNAP_SPEED = 10;
const IDLE_BEFORE_RELEASE_MS = 90;
const VELOCITY_SMOOTH_TAU = 0.045;

const cssSize = (value: number | string) => (typeof value === 'number' ? `${value}px` : value);

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const nearestIndex = (progress: number, count: number) => {
  if (count <= 0) return 0;
  return clamp(Math.round(progress), 0, count - 1);
};

/**
 * 纵深照片隧道：照片沿 Z 轴叠成隧道，拖拽或惯性滑过，
 * 空闲时可选缓慢自动前进；当前帧最大最清晰。
 */
const PhotoTunnel: React.FC<PhotoTunnelProps> = ({
  photos,
  width = 380,
  height = 480,
  depthStep = 180,
  dragSensitivity = 0.008,
  friction = 1.5,
  autoAdvance = false,
  autoAdvanceSpeed = 0.15,
  showCaption = true,
  initialIndex = 0,
  onPhotoClick,
  onIndexChange,
  ariaLabel = '纵深照片隧道',
  className,
  style
}) => {
  const count = photos.length;

  const stageRef = useRef<HTMLDivElement>(null);
  const frameRefs = useRef<(HTMLDivElement | null)[]>([]);

  const progressRef = useRef(initialIndex);
  const velocityRef = useRef(0);
  const snapTargetRef = useRef<number | null>(null);
  const draggingRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const dragStartXRef = useRef(0);
  const dragStartYRef = useRef(0);
  const dragStartProgressRef = useRef(0);
  const lastXRef = useRef(0);
  const lastYRef = useRef(0);
  const lastTRef = useRef(0);
  const dragMovedRef = useRef(false);
  const pausedRef = useRef(false);
  const activeIndexRef = useRef(nearestIndex(initialIndex, count));

  const onPhotoClickRef = useRef(onPhotoClick);
  const onIndexChangeRef = useRef(onIndexChange);
  const photosRef = useRef(photos);
  const depthStepRef = useRef(depthStep);
  const dragSensitivityRef = useRef(dragSensitivity);
  const frictionRef = useRef(friction);
  const autoAdvanceRef = useRef(autoAdvance);
  const autoAdvanceSpeedRef = useRef(autoAdvanceSpeed);
  const countRef = useRef(count);

  const [activeIndex, setActiveIndex] = useState(() => nearestIndex(initialIndex, count));

  useEffect(() => {
    onPhotoClickRef.current = onPhotoClick;
    onIndexChangeRef.current = onIndexChange;
    photosRef.current = photos;
    depthStepRef.current = depthStep;
    dragSensitivityRef.current = dragSensitivity;
    frictionRef.current = friction;
    autoAdvanceRef.current = autoAdvance;
    autoAdvanceSpeedRef.current = autoAdvanceSpeed;
    countRef.current = count;
  }, [autoAdvance, autoAdvanceSpeed, count, depthStep, dragSensitivity, friction, onIndexChange, onPhotoClick, photos]);

  const notifyIndex = useCallback((index: number) => {
    if (index === activeIndexRef.current) return;
    activeIndexRef.current = index;
    setActiveIndex(index);
    const photo = photosRef.current[index];
    if (photo) onIndexChangeRef.current?.(index, photo);
  }, []);

  const applyProgress = useCallback((progress: number) => {
    progressRef.current = progress;
    const step = depthStepRef.current;
    const total = countRef.current;

    for (let i = 0; i < total; i += 1) {
      const frame = frameRefs.current[i];
      if (!frame) continue;

      const offset = i - progress;
      const dist = Math.abs(offset);
      const z = offset * step;
      const scale = Math.max(0.52, 1 - dist * 0.14);
      const opacity = Math.max(0.12, 1 - dist * 0.32);
      const blur = dist > 0.45 ? Math.min(4, (dist - 0.45) * 2.4) : 0;
      const isCurrent = dist < 0.55;

      frame.style.transform = `translate3d(-50%, -50%, ${z}px) scale(${scale})`;
      frame.style.opacity = String(opacity);
      frame.style.filter = blur > 0.05 ? `blur(${blur}px)` : 'none';
      frame.classList.toggle(styles.frameCurrent, isCurrent);
      frame.setAttribute('aria-hidden', isCurrent ? 'false' : 'true');
    }
  }, []);

  useEffect(() => {
    const safeInitial = nearestIndex(initialIndex, count);
    progressRef.current = safeInitial;
    velocityRef.current = 0;
    snapTargetRef.current = null;
    activeIndexRef.current = safeInitial;
    applyProgress(safeInitial);
    const frame = requestAnimationFrame(() => {
      setActiveIndex(safeInitial);
    });
    return () => cancelAnimationFrame(frame);
  }, [applyProgress, count, initialIndex]);

  useEffect(() => {
    const unbindVisibility = bindVisibilityPause((hidden) => {
      pausedRef.current = hidden;
    });

    let frameId = 0;
    let last = performance.now();

    const tick = (now: number) => {
      frameId = requestAnimationFrame(tick);
      if (pausedRef.current) {
        last = now;
        return;
      }

      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (draggingRef.current) return;

      const maxProgress = Math.max(0, countRef.current - 1);
      let progress = progressRef.current;
      let velocity = velocityRef.current;
      let changed = false;

      if (snapTargetRef.current !== null) {
        const delta = snapTargetRef.current - progress;
        if (Math.abs(delta) <= 0.004) {
          progress = snapTargetRef.current;
          snapTargetRef.current = null;
          velocity = 0;
          notifyIndex(nearestIndex(progress, countRef.current));
          changed = true;
        } else {
          progress += delta * Math.min(1, SNAP_SPEED * dt);
          velocity = 0;
          changed = true;
        }
      } else if (Math.abs(velocity) > REST_VELOCITY) {
        velocity *= Math.exp(-frictionRef.current * dt);
        if (Math.abs(velocity) <= REST_VELOCITY) velocity = 0;
        progress = clamp(progress + velocity * dt, 0, maxProgress);
        changed = true;

        if (velocity === 0 || progress <= 0 || progress >= maxProgress) {
          snapTargetRef.current = nearestIndex(progress, countRef.current);
        }
      } else if (autoAdvanceRef.current && countRef.current > 1) {
        progress += autoAdvanceSpeedRef.current * dt;
        if (progress >= maxProgress) {
          progress = maxProgress;
        } else {
          changed = true;
        }
        const nextIndex = nearestIndex(progress, countRef.current);
        if (nextIndex !== activeIndexRef.current) {
          notifyIndex(nextIndex);
        }
      } else {
        const target = nearestIndex(progress, countRef.current);
        if (Math.abs(progress - target) > 0.004) {
          snapTargetRef.current = target;
          changed = true;
        } else if (progress !== target) {
          progress = target;
          notifyIndex(target);
          changed = true;
        }
      }

      velocityRef.current = velocity;
      if (changed) applyProgress(progress);
    };

    frameId = requestAnimationFrame(tick);
    applyProgress(progressRef.current);

    return () => {
      cancelAnimationFrame(frameId);
      unbindVisibility();
    };
  }, [applyProgress, notifyIndex]);

  const endDrag = useCallback((time: number, keepInertia: boolean) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    pointerIdRef.current = null;

    if (!keepInertia || time - lastTRef.current > IDLE_BEFORE_RELEASE_MS) {
      velocityRef.current = 0;
    } else {
      velocityRef.current = clamp(velocityRef.current, -MAX_VELOCITY, MAX_VELOCITY);
    }

    snapTargetRef.current = null;
  }, []);

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (countRef.current <= 0 || event.button !== 0) return;

    draggingRef.current = true;
    dragMovedRef.current = false;
    pointerIdRef.current = event.pointerId;
    dragStartXRef.current = event.clientX;
    dragStartYRef.current = event.clientY;
    dragStartProgressRef.current = progressRef.current;
    lastXRef.current = event.clientX;
    lastYRef.current = event.clientY;
    lastTRef.current = event.timeStamp;
    velocityRef.current = 0;
    snapTargetRef.current = null;
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current || pointerIdRef.current !== event.pointerId) return;

      const dx = event.clientX - dragStartXRef.current;
      const dy = event.clientY - dragStartYRef.current;
      if (Math.hypot(dx, dy) > CLICK_SLOP) dragMovedRef.current = true;

      const stepDx = event.clientX - lastXRef.current;
      const stepDy = event.clientY - lastYRef.current;
      const dt = Math.max(0.008, (event.timeStamp - lastTRef.current) / 1000);

      const sensitivity = dragSensitivityRef.current;
      const dragDelta = Math.abs(stepDy) >= Math.abs(stepDx) ? -stepDy * sensitivity : -stepDx * sensitivity;
      const instantVelocity = dragDelta / dt;
      const alpha = 1 - Math.exp(-dt / VELOCITY_SMOOTH_TAU);
      velocityRef.current = velocityRef.current + (instantVelocity - velocityRef.current) * alpha;

      const totalDrag = Math.abs(dy) >= Math.abs(dx) ? -dy * sensitivity : -dx * sensitivity;
      const maxProgress = Math.max(0, countRef.current - 1);
      const nextProgress = clamp(dragStartProgressRef.current + totalDrag, 0, maxProgress);

      lastXRef.current = event.clientX;
      lastYRef.current = event.clientY;
      lastTRef.current = event.timeStamp;

      applyProgress(nextProgress);
      notifyIndex(nearestIndex(nextProgress, countRef.current));
    },
    [applyProgress, notifyIndex]
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (pointerIdRef.current !== event.pointerId) return;

      const wasClick = !dragMovedRef.current;
      endDrag(event.timeStamp, true);

      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        /* already released */
      }

      if (wasClick) {
        const index = activeIndexRef.current;
        const photo = photosRef.current[index];
        if (photo) onPhotoClickRef.current?.(index, photo);
      }
    },
    [endDrag]
  );

  const handlePointerCancel = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (pointerIdRef.current !== event.pointerId) return;
      endDrag(event.timeStamp, false);
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        /* already released */
      }
    },
    [endDrag]
  );

  const activePhoto = photos[activeIndex];
  const showActiveCaption = showCaption && activePhoto && (activePhoto.title || activePhoto.description);
  const captionAria =
    showActiveCaption && activePhoto?.title
      ? `，当前：${activePhoto.title}${activePhoto.description ? `，${activePhoto.description}` : ''}`
      : '';

  if (count === 0) {
    return (
      <div
        className={[styles.tunnel, className].filter(Boolean).join(' ')}
        style={{ width: cssSize(width), height: cssSize(height), ...style }}
        role="img"
        aria-label={ariaLabel}
      >
        <div className={styles.empty}>暂无照片</div>
      </div>
    );
  }

  return (
    <div
      className={[styles.tunnel, className].filter(Boolean).join(' ')}
      style={{ width: cssSize(width), height: cssSize(height), ...style }}
      role="region"
      aria-label={ariaLabel + captionAria}
      aria-roledescription="carousel"
      tabIndex={0}
    >
      <div className={styles.depthFog} aria-hidden="true" />
      <div className={styles.vignette} aria-hidden="true" />

      <div
        ref={stageRef}
        className={styles.stage}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <div className={styles.track}>
          {photos.map((photo, index) => (
            <div
              key={`${photo.src}-${index}`}
              ref={(node) => {
                frameRefs.current[index] = node;
              }}
              className={styles.frame}
              data-photo-index={index}
              aria-hidden={index !== activeIndex}
            >
              <div className={styles.frameInner}>
                <div className={styles.imageWrap}>
                  <img
                    className={styles.image}
                    src={photo.src}
                    alt={photo.alt ?? photo.title ?? `Photo ${index + 1}`}
                    draggable={false}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showActiveCaption ? (
        <div className={styles.caption}>
          {activePhoto?.title ? <p className={styles.captionTitle}>{activePhoto.title}</p> : null}
          {activePhoto?.description ? <p className={styles.captionDesc}>{activePhoto.description}</p> : null}
        </div>
      ) : null}
    </div>
  );
};

export default PhotoTunnel;
export type { PhotoTunnelItem, PhotoTunnelProps } from './types';
