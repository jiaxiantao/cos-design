import React, { useEffect, useMemo, useRef, useState } from 'react';
import { bindVisibilityPause } from '@cos-design/shared';
import styles from './style/index.module.less';
import type { PhotoViewMasterProps } from './types';

const DEFAULT_W = 380;
const DEFAULT_H = 420;
const DEFAULT_DISC = 300;
const DEFAULT_PEEP = 160;
const CLICK_SLOP_PX = 6;
const MAX_VELOCITY = 640;
const REST_VELOCITY = 2.2;
const IDLE_BEFORE_RELEASE_MS = 90;
const VELOCITY_SMOOTH_TAU = 0.045;
const SNAP_THRESHOLD = 0.35;
const SNAP_LERP = 14;

const cssSize = (value: number | string) => (typeof value === 'number' ? `${value}px` : value);

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const modIndex = (value: number, count: number) => {
  if (count <= 0) return 0;
  return ((value % count) + count) % count;
};

/** front index = round((-angle)/step) mod n；向右拖时 angle 减小，索引递增 */
const frontIndexFromAngle = (angle: number, step: number, count: number) => {
  if (count <= 0) return 0;
  return modIndex(Math.round(-angle / step), count);
};

const nearestSnapAngle = (angle: number, index: number, step: number) => {
  const target = -index * step;
  const k = Math.round((angle - target) / 360);
  return target + k * 360;
};

/**
 * 观景器：View-Master 风格圆盘照片玩具。
 * 水平拖拽旋转底片盘，松手带惯性与吸附；空闲时可缓慢自动旋转。
 */
const PhotoViewMaster: React.FC<PhotoViewMasterProps> = ({
  photos,
  width = DEFAULT_W,
  height = DEFAULT_H,
  discSize = DEFAULT_DISC,
  peepSize = DEFAULT_PEEP,
  dragSensitivity = 0.45,
  friction = 1.4,
  autoRotate = true,
  autoRotateSpeed = 8,
  showCaption = true,
  initialIndex = 0,
  onPhotoClick,
  onIndexChange,
  ariaLabel = '观景器',
  className,
  style
}) => {
  const count = photos.length;
  const step = count > 0 ? 360 / count : 360;
  const orbitRadius = (discSize - peepSize) / 4 + peepSize / 2;

  const rootRef = useRef<HTMLDivElement>(null);
  const discRef = useRef<HTMLDivElement>(null);

  const angleRef = useRef(-initialIndex * step);
  const velocityRef = useRef(0);
  const draggingRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const lastXRef = useRef(0);
  const lastTRef = useRef(0);
  const dragMovedRef = useRef(false);
  const dragStartXRef = useRef(0);
  const pausedRef = useRef(false);
  const indexRef = useRef(frontIndexFromAngle(-initialIndex * step, step, count));

  const onPhotoClickRef = useRef(onPhotoClick);
  const onIndexChangeRef = useRef(onIndexChange);
  const photosRef = useRef(photos);
  const autoRotateRef = useRef(autoRotate);
  const autoRotateSpeedRef = useRef(autoRotateSpeed);
  const frictionRef = useRef(friction);
  const dragSensitivityRef = useRef(dragSensitivity);
  const stepRef = useRef(step);
  const countRef = useRef(count);

  const [frontIndex, setFrontIndex] = useState(() => modIndex(initialIndex, count));

  const slotTransforms = useMemo(
    () => photos.map((_, index) => `rotate(${index * step}deg) translateY(-${orbitRadius}px)`),
    [photos, orbitRadius, step]
  );

  useEffect(() => {
    onPhotoClickRef.current = onPhotoClick;
    onIndexChangeRef.current = onIndexChange;
    photosRef.current = photos;
    autoRotateRef.current = autoRotate;
    autoRotateSpeedRef.current = autoRotateSpeed;
    frictionRef.current = friction;
    dragSensitivityRef.current = dragSensitivity;
    stepRef.current = step;
    countRef.current = count;
  }, [onPhotoClick, onIndexChange, photos, autoRotate, autoRotateSpeed, friction, dragSensitivity, step, count]);

  const applyDisc = (angle: number) => {
    angleRef.current = angle;
    if (discRef.current) {
      discRef.current.style.transform = `rotate(${angle}deg)`;
    }
    const nextIndex = frontIndexFromAngle(angle, stepRef.current, countRef.current);
    if (nextIndex !== indexRef.current) {
      indexRef.current = nextIndex;
      setFrontIndex(nextIndex);
      const photo = photosRef.current[nextIndex];
      if (photo) onIndexChangeRef.current?.(nextIndex, photo);
    }
  };

  useEffect(() => {
    const safeIndex = modIndex(initialIndex, count);
    const nextAngle = -safeIndex * step;
    velocityRef.current = 0;
    indexRef.current = safeIndex;
    angleRef.current = nextAngle;
    if (discRef.current) {
      discRef.current.style.transform = `rotate(${nextAngle}deg)`;
    }
    const frame = requestAnimationFrame(() => {
      setFrontIndex(safeIndex);
    });
    return () => cancelAnimationFrame(frame);
  }, [count, initialIndex, step]);

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

      if (draggingRef.current || countRef.current <= 0) return;

      let angle = angleRef.current;
      let velocity = velocityRef.current;
      const currentStep = stepRef.current;

      if (Math.abs(velocity) > REST_VELOCITY) {
        angle += velocity * dt;
        velocity *= Math.exp(-frictionRef.current * dt);
        if (Math.abs(velocity) <= REST_VELOCITY) velocity = 0;
      } else {
        velocity = 0;
        const idx = frontIndexFromAngle(angle, currentStep, countRef.current);
        const target = nearestSnapAngle(angle, idx, currentStep);
        const delta = target - angle;

        if (Math.abs(delta) > SNAP_THRESHOLD) {
          angle += delta * Math.min(1, SNAP_LERP * dt);
        } else {
          angle = target;
          if (autoRotateRef.current) {
            angle -= autoRotateSpeedRef.current * dt;
          }
        }
      }

      velocityRef.current = velocity;
      applyDisc(angle);
    };

    frameId = requestAnimationFrame(tick);
    applyDisc(angleRef.current);

    return () => {
      cancelAnimationFrame(frameId);
      unbindVisibility();
    };
  }, []);

  const endDrag = (time: number, keepInertia: boolean) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    pointerIdRef.current = null;

    if (!keepInertia || time - lastTRef.current > IDLE_BEFORE_RELEASE_MS) {
      velocityRef.current = 0;
      return;
    }

    velocityRef.current = clamp(velocityRef.current, -MAX_VELOCITY, MAX_VELOCITY);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || count <= 0) return;
    draggingRef.current = true;
    dragMovedRef.current = false;
    pointerIdRef.current = e.pointerId;
    dragStartXRef.current = e.clientX;
    lastXRef.current = e.clientX;
    lastTRef.current = e.timeStamp;
    velocityRef.current = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || pointerIdRef.current !== e.pointerId) return;

    const dx = e.clientX - lastXRef.current;
    const dt = Math.max(0.008, (e.timeStamp - lastTRef.current) / 1000);

    if (Math.abs(e.clientX - dragStartXRef.current) > CLICK_SLOP_PX) {
      dragMovedRef.current = true;
    }

    const sensitivity = dragSensitivityRef.current;
    // 向右拖时 angle 减小，front index 递增
    const nextAngle = angleRef.current - dx * sensitivity;
    applyDisc(nextAngle);

    const instantV = (-dx / dt) * sensitivity;
    const alpha = 1 - Math.exp(-dt / VELOCITY_SMOOTH_TAU);
    velocityRef.current = velocityRef.current + (instantV - velocityRef.current) * alpha;

    lastXRef.current = e.clientX;
    lastTRef.current = e.timeStamp;
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== e.pointerId) return;
    const wasClick = !dragMovedRef.current;
    endDrag(e.timeStamp, true);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    if (wasClick) {
      const photo = photosRef.current[indexRef.current];
      if (photo) onPhotoClickRef.current?.(indexRef.current, photo);
    }
  };

  const onPointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== e.pointerId) return;
    endDrag(e.timeStamp, false);
  };

  const frontPhoto = photos[frontIndex];
  const showFrontCaption = showCaption && frontPhoto && (frontPhoto.title || frontPhoto.description);
  const captionAria =
    showFrontCaption && frontPhoto?.title
      ? `，当前：${frontPhoto.title}${frontPhoto.description ? `，${frontPhoto.description}` : ''}`
      : '';

  if (count === 0) {
    return (
      <div
        ref={rootRef}
        className={[styles.root, className].filter(Boolean).join(' ')}
        style={{
          width: cssSize(width),
          height: cssSize(height),
          ['--pvm-disc-size' as string]: `${discSize}px`,
          ['--pvm-peep-size' as string]: `${peepSize}px`,
          ...style
        }}
        role="img"
        aria-label={ariaLabel}
      >
        <div className={styles.empty}>暂无照片</div>
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className={[styles.root, className].filter(Boolean).join(' ')}
      style={{
        width: cssSize(width),
        height: cssSize(height),
        ['--pvm-disc-size' as string]: `${discSize}px`,
        ['--pvm-peep-size' as string]: `${peepSize}px`,
        ...style
      }}
      role="img"
      aria-label={ariaLabel + captionAria}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      <div className={styles.body}>
        <div className={styles.topBulb} aria-hidden="true" />
        <div className={[styles.sideGrip, styles.left].join(' ')} aria-hidden="true" />
        <div className={[styles.sideGrip, styles.right].join(' ')} aria-hidden="true" />
        <div className={styles.bodyRidge} aria-hidden="true" />

        <div className={styles.discStage}>
          <div
            ref={discRef}
            className={styles.disc}
            style={{ transform: `rotate(${-initialIndex * step}deg)` }}
            aria-hidden="true"
          >
            {photos.map((photo, index) => (
              <div key={`${photo.src}-${index}`} className={styles.slot} style={{ transform: slotTransforms[index] }}>
                <div className={styles.slotFrame}>
                  <img className={styles.slotImage} src={photo.src} alt="" draggable={false} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.peepStack}>
          <div className={styles.peepRing} aria-hidden="true" />
          <div className={styles.peepWindow}>
            {frontPhoto ? (
              <img
                className={styles.peepImage}
                src={frontPhoto.src}
                alt={frontPhoto.alt ?? frontPhoto.title ?? `Photo ${frontIndex + 1}`}
                draggable={false}
              />
            ) : null}
            <div className={styles.peepVignette} aria-hidden="true" />
            <div className={styles.peepGlare} aria-hidden="true" />
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

export type { PhotoViewMasterItem, PhotoViewMasterProps } from './types';
export default PhotoViewMaster;
