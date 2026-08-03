import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './style/index.module.less';
import type { PhotoCarouselProps } from './types';

const cssSize = (value: number | string) => (typeof value === 'number' ? `${value}px` : value);

const modIndex = (value: number, count: number) => {
  if (count <= 0) return 0;
  return ((value % count) + count) % count;
};

const faceIndexForAngle = (angle: number, step: number, count: number) => {
  if (count <= 0) return 0;
  return modIndex(Math.round(angle / step), count);
};

/**
 * 环形照片转盘：照片立于 CSS 3D 圆环上，可拖拽旋转并带惯性，
 * 空闲时可选缓慢自动顺时针转动；正面照片朝向镜头。
 */
const PhotoCarousel: React.FC<PhotoCarouselProps> = ({
  photos,
  width = 420,
  height = 360,
  radius = 180,
  cardWidth = 120,
  cardHeight = 160,
  autoRotate = true,
  autoRotateSpeed = 12,
  dragSensitivity = 0.35,
  friction = 2.2,
  showCaption = false,
  initialAngle = 0,
  onPhotoClick,
  onFaceChange,
  ariaLabel = 'Photo carousel',
  className,
  style
}) => {
  const count = photos.length;
  const step = count > 0 ? 360 / count : 360;

  const ringRef = useRef<HTMLDivElement>(null);
  const angleRef = useRef(initialAngle);
  const velocityRef = useRef(0);
  const draggingRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const lastPointerXRef = useRef(0);
  const lastPointerTimeRef = useRef(0);
  const faceIndexRef = useRef(faceIndexForAngle(initialAngle, step, count));
  const dragMovedRef = useRef(false);
  const dragStartXRef = useRef(0);

  const onPhotoClickRef = useRef(onPhotoClick);
  const onFaceChangeRef = useRef(onFaceChange);
  const autoRotateRef = useRef(autoRotate);
  const autoRotateSpeedRef = useRef(autoRotateSpeed);
  const frictionRef = useRef(friction);
  const dragSensitivityRef = useRef(dragSensitivity);
  const stepRef = useRef(step);
  const countRef = useRef(count);

  const [frontFaceIndex, setFrontFaceIndex] = useState(() => faceIndexForAngle(initialAngle, step, count));

  useEffect(() => {
    onPhotoClickRef.current = onPhotoClick;
    onFaceChangeRef.current = onFaceChange;
    autoRotateRef.current = autoRotate;
    autoRotateSpeedRef.current = autoRotateSpeed;
    frictionRef.current = friction;
    dragSensitivityRef.current = dragSensitivity;
    stepRef.current = step;
    countRef.current = count;
  }, [onPhotoClick, onFaceChange, autoRotate, autoRotateSpeed, friction, dragSensitivity, step, count]);

  const applyAngle = useCallback((nextAngle: number) => {
    angleRef.current = nextAngle;
    if (ringRef.current) {
      ringRef.current.style.transform = `rotateY(${-nextAngle}deg)`;
    }
    const nextFace = faceIndexForAngle(nextAngle, stepRef.current, countRef.current);
    if (nextFace !== faceIndexRef.current) {
      faceIndexRef.current = nextFace;
      setFrontFaceIndex(nextFace);
      onFaceChangeRef.current?.(nextFace);
    }
  }, []);

  useEffect(() => {
    angleRef.current = initialAngle;
    velocityRef.current = 0;
    applyAngle(initialAngle);
  }, [applyAngle, count, initialAngle, step]);

  useEffect(() => {
    let frameId = 0;
    let last: number | null = null;

    const tick = (time: number) => {
      frameId = requestAnimationFrame(tick);
      if (last == null) {
        last = time;
        return;
      }
      const dt = Math.min(0.05, (time - last) / 1000);
      last = time;

      if (draggingRef.current) return;

      let nextAngle = angleRef.current;
      let nextVelocity = velocityRef.current;
      let changed = false;

      if (Math.abs(nextVelocity) > 0.01) {
        nextAngle += nextVelocity * dt;
        nextVelocity *= Math.exp(-frictionRef.current * dt);
        if (Math.abs(nextVelocity) < 0.02) nextVelocity = 0;
        velocityRef.current = nextVelocity;
        changed = true;
      } else if (autoRotateRef.current) {
        nextAngle += autoRotateSpeedRef.current * dt;
        changed = true;
      }

      if (changed) applyAngle(nextAngle);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [applyAngle]);

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (countRef.current <= 0 || event.button !== 0) return;
    draggingRef.current = true;
    dragMovedRef.current = false;
    pointerIdRef.current = event.pointerId;
    dragStartXRef.current = event.clientX;
    lastPointerXRef.current = event.clientX;
    lastPointerTimeRef.current = performance.now();
    velocityRef.current = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current || pointerIdRef.current !== event.pointerId) return;

      const now = performance.now();
      const deltaX = event.clientX - lastPointerXRef.current;
      const dt = Math.max(0.008, (now - lastPointerTimeRef.current) / 1000);
      lastPointerXRef.current = event.clientX;
      lastPointerTimeRef.current = now;

      if (Math.abs(event.clientX - dragStartXRef.current) > 6) dragMovedRef.current = true;

      // 拖向右时正面照片跟着向右走（与托盘手势直觉一致）
      const deltaAngle = -deltaX * dragSensitivityRef.current;
      velocityRef.current = deltaAngle / dt;
      applyAngle(angleRef.current + deltaAngle);
    },
    [applyAngle]
  );

  const endDrag = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId) return;
    draggingRef.current = false;
    pointerIdRef.current = null;
    velocityRef.current = Math.max(-720, Math.min(720, velocityRef.current));
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* already released */
    }
  }, []);

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const wasClick = !dragMovedRef.current;
      endDrag(event);
      if (wasClick) {
        const photo = photos[faceIndexRef.current];
        if (photo) onPhotoClickRef.current?.(faceIndexRef.current, photo);
      }
    },
    [endDrag, photos]
  );

  const handlePointerCancel = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      velocityRef.current = 0;
      endDrag(event);
    },
    [endDrag]
  );

  const frontPhoto = photos[frontFaceIndex];
  const showFrontCaption = showCaption && frontPhoto && (frontPhoto.title || frontPhoto.description);

  const cardTransforms = useMemo(
    () => photos.map((_, index) => `rotateY(${index * step}deg) translateZ(${radius}px)`),
    [photos, radius, step]
  );

  if (count === 0) {
    return (
      <div
        className={[styles.carousel, className].filter(Boolean).join(' ')}
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
      className={[styles.carousel, className].filter(Boolean).join(' ')}
      style={{ width: cssSize(width), height: cssSize(height), ...style }}
      role="region"
      aria-label={ariaLabel}
      aria-roledescription="carousel"
      tabIndex={0}
    >
      <div className={styles.groundShadow} aria-hidden="true" />

      <div
        className={styles.perspective}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <div className={styles.scene}>
          <div className={styles.tray} aria-hidden="true">
            <div className={styles.trayRim} />
          </div>

          <div
            ref={ringRef}
            className={styles.ring}
            style={{
              width: cardWidth,
              height: cardHeight,
              transform: `rotateY(${-initialAngle}deg)`
            }}
          >
            {photos.map((photo, index) => {
              const isFront = index === frontFaceIndex;
              return (
                <div
                  key={`${photo.src}-${index}`}
                  className={[styles.card, isFront ? styles.cardFront : styles.cardBack].join(' ')}
                  style={{
                    ['--card-width' as string]: `${cardWidth}px`,
                    ['--card-height' as string]: `${cardHeight}px`,
                    transform: cardTransforms[index]
                  }}
                  aria-hidden={!isFront}
                >
                  <div className={styles.frame}>
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
              );
            })}
          </div>
        </div>
      </div>

      {showFrontCaption ? (
        <div className={styles.caption}>
          {frontPhoto?.title ? <p className={styles.captionTitle}>{frontPhoto.title}</p> : null}
          {frontPhoto?.description ? <p className={styles.captionDesc}>{frontPhoto.description}</p> : null}
        </div>
      ) : null}
    </div>
  );
};

export default PhotoCarousel;
export type { PhotoCarouselItem, PhotoCarouselProps } from './types';
