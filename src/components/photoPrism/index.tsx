import React, { useEffect, useMemo, useRef, useState } from 'react';
import { bindVisibilityPause } from '@cos-design/shared';
import styles from './style/index.module.less';
import type { PhotoPrismItem, PhotoPrismProps } from './types';

const FACE_COUNT = 6;
const CLICK_SLOP_PX = 6;
const MAX_VELOCITY = 640;
const REST_VELOCITY = 2.2;
/** 松手前静止超过该时长则丢弃惯性（ms） */
const IDLE_BEFORE_RELEASE_MS = 90;
/** 拖拽速度指数平滑时间常数（秒） */
const VELOCITY_SMOOTH_TAU = 0.045;
const AUTO_ROTATE_SPEED = 7.5;
const FLOAT_AMPLITUDE = 5;
const FLOAT_PERIOD = 4.8;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const DEFAULT_W = 380;
const DEFAULT_H = 380;
const DEFAULT_SIZE = 200;

const cssSize = (value: number | string) => (typeof value === 'number' ? `${value}px` : value);

/** 六面名称，与 photos 索引一一对应：0 front / 1 back / 2 right / 3 left / 4 top / 5 bottom */
const FACE_KEYS = ['front', 'back', 'right', 'left', 'top', 'bottom'] as const;

const wrap180 = (deg: number) => {
  let a = ((deg % 360) + 360) % 360;
  if (a > 180) a -= 360;
  return a;
};

/** 根据立方体姿态估算朝向镜头的那一面 */
const frontFaceIndex = (rx: number, ry: number) => {
  const x = wrap180(rx);
  const y = ((ry % 360) + 360) % 360;

  if (x > 45) return 4; // top
  if (x < -45) return 5; // bottom

  if (y >= 315 || y < 45) return 0; // front
  if (y >= 45 && y < 135) return 2; // right
  if (y >= 135 && y < 225) return 1; // back
  return 3; // left
};

/**
 * 照片棱镜：CSS 3D 立方体，最多六面贴图。
 * 拖拽翻滚并带惯性，空闲时缓慢自转与轻微浮动。
 */
const PhotoPrism: React.FC<PhotoPrismProps> = ({
  photos,
  width = DEFAULT_W,
  height = DEFAULT_H,
  size = DEFAULT_SIZE,
  autoRotate = true,
  dragSensitivity = 0.4,
  friction = 1.35,
  showCaption = true,
  onPhotoClick,
  ariaLabel = '照片棱镜',
  className,
  style
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const cubeRef = useRef<HTMLDivElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);

  const rxRef = useRef(-12);
  const ryRef = useRef(-28);
  const vxRef = useRef(0);
  const vyRef = useRef(0);

  const draggingRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const lastXRef = useRef(0);
  const lastYRef = useRef(0);
  const lastTRef = useRef(0);
  const dragMovedRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartYRef = useRef(0);
  const pausedRef = useRef(false);
  const faceIndexRef = useRef(frontFaceIndex(-12, -28));

  const onPhotoClickRef = useRef(onPhotoClick);
  const facesRef = useRef<(PhotoPrismItem | undefined)[]>([]);
  const autoRotateRef = useRef(autoRotate);
  const frictionRef = useRef(friction);
  const dragSensitivityRef = useRef(dragSensitivity);

  const [frontIndex, setFrontIndex] = useState(() => frontFaceIndex(-12, -28));

  const faces = useMemo(
    () => Array.from({ length: FACE_COUNT }, (_, i) => photos[i]) as (PhotoPrismItem | undefined)[],
    [photos]
  );

  useEffect(() => {
    facesRef.current = faces;
    onPhotoClickRef.current = onPhotoClick;
    autoRotateRef.current = autoRotate;
    frictionRef.current = friction;
    dragSensitivityRef.current = dragSensitivity;
  }, [faces, onPhotoClick, autoRotate, friction, dragSensitivity]);

  useEffect(() => {
    const unbindVisibility = bindVisibilityPause((hidden) => {
      pausedRef.current = hidden;
    });

    let frameId = 0;
    let last = performance.now();
    let timeAcc = 0;

    const applyTransform = (floatY: number) => {
      const cube = cubeRef.current;
      const floatWrap = floatRef.current;
      if (!cube || !floatWrap) return;
      cube.style.transform = `rotateX(${rxRef.current}deg) rotateY(${ryRef.current}deg)`;
      floatWrap.style.transform = `translateY(${floatY}px)`;

      const nextFace = frontFaceIndex(rxRef.current, ryRef.current);
      if (nextFace !== faceIndexRef.current) {
        faceIndexRef.current = nextFace;
        setFrontIndex(nextFace);
      }
    };

    const tick = (now: number) => {
      frameId = requestAnimationFrame(tick);
      if (pausedRef.current) {
        last = now;
        return;
      }

      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      timeAcc += dt;

      if (!draggingRef.current) {
        let vx = vxRef.current;
        let vy = vyRef.current;

        if (Math.abs(vx) > REST_VELOCITY || Math.abs(vy) > REST_VELOCITY) {
          const decay = Math.exp(-frictionRef.current * dt);
          vx *= decay;
          vy *= decay;
          if (Math.abs(vx) <= REST_VELOCITY) vx = 0;
          if (Math.abs(vy) <= REST_VELOCITY) vy = 0;
          vxRef.current = vx;
          vyRef.current = vy;
          rxRef.current += vy * dt;
          ryRef.current += vx * dt;
        } else if (autoRotateRef.current) {
          ryRef.current += AUTO_ROTATE_SPEED * dt;
        }
      }

      const floatY =
        draggingRef.current || Math.abs(vxRef.current) > REST_VELOCITY || Math.abs(vyRef.current) > REST_VELOCITY
          ? 0
          : Math.sin((timeAcc / FLOAT_PERIOD) * Math.PI * 2) * FLOAT_AMPLITUDE;

      applyTransform(floatY);
    };

    frameId = requestAnimationFrame(tick);
    applyTransform(0);

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
      vxRef.current = 0;
      vyRef.current = 0;
      return;
    }

    vxRef.current = clamp(vxRef.current, -MAX_VELOCITY, MAX_VELOCITY);
    vyRef.current = clamp(vyRef.current, -MAX_VELOCITY, MAX_VELOCITY);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    draggingRef.current = true;
    dragMovedRef.current = false;
    pointerIdRef.current = e.pointerId;
    dragStartXRef.current = e.clientX;
    dragStartYRef.current = e.clientY;
    lastXRef.current = e.clientX;
    lastYRef.current = e.clientY;
    lastTRef.current = e.timeStamp;
    vxRef.current = 0;
    vyRef.current = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || pointerIdRef.current !== e.pointerId) return;
    const dx = e.clientX - lastXRef.current;
    const dy = e.clientY - lastYRef.current;
    const dt = Math.max(0.008, (e.timeStamp - lastTRef.current) / 1000);
    if (Math.hypot(e.clientX - dragStartXRef.current, e.clientY - dragStartYRef.current) > CLICK_SLOP_PX) {
      dragMovedRef.current = true;
    }

    const sensitivity = dragSensitivityRef.current;
    // 拖向右/下时棱镜随手势同向翻滚（抓取物体的直觉）
    ryRef.current -= dx * sensitivity;
    rxRef.current -= dy * sensitivity;

    // 在拖拽过程中持续估计角速度；松手常用与最后一次 move 同坐标，不能再靠「抬起位移」算惯性
    const instantVx = (-dx / dt) * sensitivity;
    const instantVy = (-dy / dt) * sensitivity;
    const alpha = 1 - Math.exp(-dt / VELOCITY_SMOOTH_TAU);
    vxRef.current = vxRef.current + (instantVx - vxRef.current) * alpha;
    vyRef.current = vyRef.current + (instantVy - vyRef.current) * alpha;

    lastXRef.current = e.clientX;
    lastYRef.current = e.clientY;
    lastTRef.current = e.timeStamp;

    const cube = cubeRef.current;
    if (cube) cube.style.transform = `rotateX(${rxRef.current}deg) rotateY(${ryRef.current}deg)`;
    const nextFace = frontFaceIndex(rxRef.current, ryRef.current);
    if (nextFace !== faceIndexRef.current) {
      faceIndexRef.current = nextFace;
      setFrontIndex(nextFace);
    }
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
      const target = (e.target as HTMLElement | null)?.closest?.('[data-face-index]') as HTMLElement | null;
      const raw = target ? Number(target.dataset.faceIndex) : faceIndexRef.current;
      const index = Number.isFinite(raw) ? raw : faceIndexRef.current;
      const photo = facesRef.current[index];
      if (photo) onPhotoClickRef.current?.(index, photo);
    }
  };

  const onPointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== e.pointerId) return;
    endDrag(e.timeStamp, false);
  };

  const frontPhoto = faces[frontIndex];
  const captionAria =
    showCaption && frontPhoto?.title
      ? `，当前：${frontPhoto.title}${frontPhoto.description ? `，${frontPhoto.description}` : ''}`
      : '';

  return (
    <div
      ref={rootRef}
      className={[styles.root, className].filter(Boolean).join(' ')}
      style={{
        width: cssSize(width),
        height: cssSize(height),
        ['--prism-size' as string]: `${size}px`,
        ...style
      }}
      role="img"
      aria-label={ariaLabel + captionAria}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.stage}>
        <div ref={floatRef} className={styles.floatWrap}>
          <div ref={cubeRef} className={styles.cube}>
            {FACE_KEYS.map((key, index) => {
              const photo = faces[index];
              const hasCaption = showCaption && photo && (photo.title || photo.description);
              return (
                <div key={key} className={[styles.face, styles[key]].join(' ')} data-face-index={index}>
                  {photo ? (
                    <img
                      className={styles.photo}
                      src={photo.src}
                      alt={photo.alt ?? photo.title ?? `Photo ${index + 1}`}
                      draggable={false}
                    />
                  ) : (
                    <div className={styles.placeholder} aria-hidden="true" />
                  )}
                  {hasCaption ? (
                    <div className={styles.caption}>
                      {photo?.title ? <strong>{photo.title}</strong> : null}
                      {photo?.description ? <span>{photo.description}</span> : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export type { PhotoPrismItem, PhotoPrismProps } from './types';
export default PhotoPrism;
