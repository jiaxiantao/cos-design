import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { bindVisibilityPause } from '@cos-design/shared';
import styles from './style/index.module.less';
import type { PhotoScrollProps } from './types';

const CLICK_SLOP = 6;
const VELOCITY_TAU = 0.045;
const IDLE_KILL_MS = 90;
const REST_VELOCITY = 8;
const MAX_VELOCITY = 2600;
const SNAP_SPEED = 14;

const cssSize = (value: number | string) => (typeof value === 'number' ? `${value}px` : value);

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

interface DragState {
  pointerId: number;
  startX: number;
  startOffset: number;
  lastX: number;
  lastTime: number;
  lastMoveTime: number;
  vx: number;
  moved: number;
}

interface SimState {
  offset: number;
  velocity: number;
  drag: DragState | null;
  snapTarget: number | null;
}

/**
 * 中式手卷轴照片浏览：左右木轴固定，中间宣纸横向拖拽滚动，
 * 松手后带指数摩擦惯性并吸附到最近照片中心。
 */
const PhotoScroll: React.FC<PhotoScrollProps> = ({
  photos,
  width = 520,
  height = 280,
  frameWidth = 160,
  frameHeight = 200,
  frameGap = 20,
  dragSensitivity = 1,
  friction = 1.5,
  showCaption = true,
  initialIndex = 0,
  onPhotoClick,
  onIndexChange,
  ariaLabel = '卷轴照片',
  className,
  style
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);

  const simRef = useRef<SimState>({
    offset: 0,
    velocity: 0,
    drag: null,
    snapTarget: null
  });
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const pausedRef = useRef(false);
  const activeIndexRef = useRef(0);
  const readyRef = useRef(false);
  const requestedIndexRef = useRef(initialIndex);

  const onPhotoClickRef = useRef(onPhotoClick);
  const onIndexChangeRef = useRef(onIndexChange);
  const photosRef = useRef(photos);
  const frictionRef = useRef(friction);
  const dragSensitivityRef = useRef(dragSensitivity);

  const [viewportWidth, setViewportWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  const count = photos.length;
  const frameStep = frameWidth + frameGap;

  useEffect(() => {
    onPhotoClickRef.current = onPhotoClick;
    onIndexChangeRef.current = onIndexChange;
    photosRef.current = photos;
    frictionRef.current = friction;
    dragSensitivityRef.current = dragSensitivity;
  }, [dragSensitivity, friction, onIndexChange, onPhotoClick, photos]);

  const startPadding = useMemo(
    () => (viewportWidth > 0 ? viewportWidth / 2 - frameWidth / 2 : 0),
    [frameWidth, viewportWidth]
  );

  const paperWidth = useMemo(() => {
    if (count <= 0) return 0;
    return startPadding * 2 + count * frameWidth + Math.max(0, count - 1) * frameGap;
  }, [count, frameGap, frameWidth, startPadding]);

  const offsetForIndex = useCallback(
    (index: number) => {
      if (viewportWidth <= 0 || count <= 0) return 0;
      const safeIndex = clamp(Math.floor(index), 0, count - 1);
      const center = startPadding + safeIndex * frameStep + frameWidth / 2;
      return viewportWidth / 2 - center;
    },
    [count, frameStep, frameWidth, startPadding, viewportWidth]
  );

  const indexFromOffset = useCallback(
    (offset: number) => {
      if (count <= 0 || viewportWidth <= 0) return 0;
      const raw = (viewportWidth / 2 - offset - startPadding - frameWidth / 2) / frameStep;
      return clamp(Math.round(raw), 0, count - 1);
    },
    [count, frameStep, frameWidth, startPadding, viewportWidth]
  );

  const offsetBounds = useCallback(() => {
    if (count <= 0) return { min: 0, max: 0 };
    return {
      min: offsetForIndex(count - 1),
      max: offsetForIndex(0)
    };
  }, [count, offsetForIndex]);

  const applyTransform = useCallback((offset: number) => {
    const paper = paperRef.current;
    if (!paper) return;
    paper.style.transform = `translate3d(${offset}px, 0, 0)`;
  }, []);

  const notifyIndex = useCallback((index: number) => {
    if (index === activeIndexRef.current) return;
    activeIndexRef.current = index;
    setActiveIndex(index);
    const photo = photosRef.current[index];
    if (photo) onIndexChangeRef.current?.(index, photo);
  }, []);

  const stopLoop = useCallback(() => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    lastTimeRef.current = 0;
  }, []);

  const startLoop = useCallback(() => {
    if (frameRef.current !== null || typeof window === 'undefined') return;

    const tick = (time: number) => {
      frameRef.current = null;
      if (pausedRef.current) return;

      const previous = lastTimeRef.current || time;
      lastTimeRef.current = time;
      const dt = Math.min(0.05, (time - previous) / 1000);

      const state = simRef.current;
      const { min, max } = offsetBounds();
      let keepRunning = false;

      if (state.drag) {
        applyTransform(state.offset);
        keepRunning = true;
      } else if (state.snapTarget !== null) {
        const delta = state.snapTarget - state.offset;
        if (Math.abs(delta) <= 0.35) {
          state.offset = state.snapTarget;
          state.snapTarget = null;
          state.velocity = 0;
          notifyIndex(indexFromOffset(state.offset));
          applyTransform(state.offset);
        } else {
          state.offset += delta * Math.min(1, SNAP_SPEED * dt);
          state.velocity = 0;
          applyTransform(state.offset);
          keepRunning = true;
        }
      } else {
        let velocity = state.velocity;
        if (Math.abs(velocity) > REST_VELOCITY) {
          velocity *= Math.exp(-frictionRef.current * dt);
          if (Math.abs(velocity) <= REST_VELOCITY) velocity = 0;
          state.velocity = velocity;
          state.offset += velocity * dt;

          if (state.offset < min || state.offset > max) {
            state.offset = clamp(state.offset, min, max);
            state.velocity = 0;
          }

          applyTransform(state.offset);
          keepRunning = true;
        } else {
          state.velocity = 0;
          const target = offsetForIndex(indexFromOffset(state.offset));
          if (Math.abs(state.offset - target) > 0.35) {
            state.snapTarget = target;
            keepRunning = true;
          } else {
            state.offset = target;
            notifyIndex(indexFromOffset(state.offset));
            applyTransform(state.offset);
          }
        }
      }

      if (keepRunning) {
        frameRef.current = window.requestAnimationFrame(tick);
      } else {
        lastTimeRef.current = 0;
      }
    };

    frameRef.current = window.requestAnimationFrame(tick);
  }, [applyTransform, indexFromOffset, notifyIndex, offsetBounds, offsetForIndex]);

  useEffect(() => {
    const unbindVisibility = bindVisibilityPause((hidden) => {
      pausedRef.current = hidden;
      if (!hidden) startLoop();
    });
    return unbindVisibility;
  }, [startLoop]);

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;

    const measure = (nextWidth: number) => {
      setViewportWidth((prev) => (prev === nextWidth ? prev : nextWidth));
    };

    measure(element.clientWidth);
    if (typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) measure(Math.round(entry.contentRect.width));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (viewportWidth <= 0 || count <= 0) return;
    const state = simRef.current;

    if (!readyRef.current) {
      readyRef.current = true;
      requestedIndexRef.current = initialIndex;
      state.offset = offsetForIndex(initialIndex);
      state.velocity = 0;
      state.snapTarget = null;
      state.drag = null;
      activeIndexRef.current = clamp(initialIndex, 0, count - 1);
      setActiveIndex(activeIndexRef.current);
      applyTransform(state.offset);
      return;
    }

    if (requestedIndexRef.current !== initialIndex) {
      requestedIndexRef.current = initialIndex;
      state.velocity = 0;
      state.drag = null;
      state.snapTarget = offsetForIndex(initialIndex);
      startLoop();
      return;
    }

    const { min, max } = offsetBounds();
    state.offset = clamp(state.offset, min, max);
    applyTransform(state.offset);
  }, [applyTransform, count, initialIndex, offsetBounds, offsetForIndex, startLoop, viewportWidth]);

  useEffect(
    () => () => {
      stopLoop();
    },
    [stopLoop]
  );

  const finishDrag = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const state = simRef.current;
      const drag = state.drag;
      if (!drag || drag.pointerId !== event.pointerId) return;

      state.drag = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      const idleMs = event.timeStamp - drag.lastMoveTime;
      if (idleMs > IDLE_KILL_MS) {
        state.velocity = 0;
      } else {
        state.velocity = clamp(drag.vx * dragSensitivityRef.current, -MAX_VELOCITY, MAX_VELOCITY);
      }
      state.snapTarget = null;

      if (drag.moved <= CLICK_SLOP) {
        state.velocity = 0;
        const index = indexFromOffset(state.offset);
        const photo = photosRef.current[index];
        if (photo) onPhotoClickRef.current?.(index, photo);
        state.snapTarget = offsetForIndex(index);
      }

      startLoop();
    },
    [indexFromOffset, offsetForIndex, startLoop]
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0 && event.pointerType === 'mouse') return;
      if (count <= 0) return;

      const now = event.timeStamp;
      const state = simRef.current;
      state.drag = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startOffset: state.offset,
        lastX: event.clientX,
        lastTime: now,
        lastMoveTime: now,
        vx: 0,
        moved: 0
      };
      state.velocity = 0;
      state.snapTarget = null;
      event.currentTarget.setPointerCapture(event.pointerId);
      startLoop();
    },
    [count, startLoop]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const state = simRef.current;
      const drag = state.drag;
      if (!drag || drag.pointerId !== event.pointerId) return;

      const dx = event.clientX - drag.startX;
      drag.moved = Math.max(drag.moved, Math.abs(dx));
      drag.lastMoveTime = event.timeStamp;

      const dt = Math.max(event.timeStamp - drag.lastTime, 1) / 1000;
      const instantVx = (event.clientX - drag.lastX) / dt;
      const alpha = 1 - Math.exp(-dt / VELOCITY_TAU);
      drag.vx = alpha * instantVx + (1 - alpha) * drag.vx;
      drag.lastX = event.clientX;
      drag.lastTime = event.timeStamp;

      const { min, max } = offsetBounds();
      state.offset = clamp(drag.startOffset + dx * dragSensitivityRef.current, min, max);
      applyTransform(state.offset);
      notifyIndex(indexFromOffset(state.offset));
      startLoop();
    },
    [applyTransform, indexFromOffset, notifyIndex, offsetBounds, startLoop]
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      finishDrag(event);
    },
    [finishDrag]
  );

  const handlePointerCancel = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      finishDrag(event);
    },
    [finishDrag]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (count <= 0) return;
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

      event.preventDefault();
      const state = simRef.current;
      const delta = event.key === 'ArrowLeft' ? frameStep : -frameStep;
      const { min, max } = offsetBounds();
      const from = state.snapTarget ?? state.offset;
      state.velocity = 0;
      state.drag = null;
      state.snapTarget = clamp(from + delta, min, max);
      startLoop();
    },
    [count, frameStep, offsetBounds, startLoop]
  );

  const activePhoto = photos[activeIndex];
  const captionAria =
    showCaption && activePhoto?.title
      ? `，当前：${activePhoto.title}${activePhoto.description ? `，${activePhoto.description}` : ''}`
      : '';

  if (count === 0) {
    return (
      <div
        className={[styles.scroll, className].filter(Boolean).join(' ')}
        style={{ width: cssSize(width), height: cssSize(height), ...style }}
        role="img"
        aria-label={ariaLabel}
      >
        <div className={[styles.roller, styles.rollerLeft].join(' ')} aria-hidden="true" />
        <div className={styles.center}>
          <div className={styles.empty}>暂无照片</div>
        </div>
        <div className={[styles.roller, styles.rollerRight].join(' ')} aria-hidden="true" />
      </div>
    );
  }

  return (
    <div
      className={[styles.scroll, className].filter(Boolean).join(' ')}
      style={{ width: cssSize(width), height: cssSize(height), ...style }}
      role="region"
      aria-label={ariaLabel + captionAria}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className={[styles.roller, styles.rollerLeft].join(' ')} aria-hidden="true" />

      <div className={styles.center}>
        <div
          ref={viewportRef}
          className={styles.paperViewport}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
        >
          <div
            ref={paperRef}
            className={styles.paper}
            style={{
              minWidth: paperWidth,
              boxSizing: 'border-box'
            }}
          >
            <div
              className={styles.paperSurface}
              style={{
                paddingLeft: startPadding,
                paddingRight: startPadding,
                minWidth: paperWidth
              }}
            >
              {photos.map((photo, index) => {
                const hasCaption = showCaption && (photo.title || photo.description);
                return (
                  <div
                    key={`${photo.src}-${index}`}
                    className={styles.frameCell}
                    style={{ width: frameWidth, marginRight: index < count - 1 ? frameGap : 0 }}
                    data-active={index === activeIndex ? 'true' : 'false'}
                    data-photo-index={index}
                  >
                    <div className={styles.frame} style={{ width: frameWidth, height: frameHeight }}>
                      <img src={photo.src} alt={photo.alt ?? photo.title ?? `Photo ${index + 1}`} draggable={false} />
                      {hasCaption ? (
                        <div className={styles.caption}>
                          {photo.title ? <strong>{photo.title}</strong> : null}
                          {photo.description ? <span>{photo.description}</span> : null}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className={[styles.roller, styles.rollerRight].join(' ')} aria-hidden="true" />
    </div>
  );
};

export default PhotoScroll;
export type { PhotoScrollItem, PhotoScrollProps } from './types';
