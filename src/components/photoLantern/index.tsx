import React, { useEffect, useMemo, useRef, useState } from 'react';
import { bindVisibilityPause } from '@cos-design/shared';
import { FACE_COUNT, createLanternScene, frontFaceIndex, type LanternSceneApi } from './scene';
import styles from './style/index.module.less';
import type { PhotoLanternItem, PhotoLanternProps } from './types';

const CLICK_SLOP_PX = 6;
const MAX_VELOCITY = 720;
const REST_VELOCITY = 2.5;
/** 松手前静止超过该时长则丢弃惯性（ms） */
const IDLE_BEFORE_RELEASE_MS = 90;
/** 拖拽速度指数平滑时间常数（秒） */
const VELOCITY_SMOOTH_TAU = 0.045;
const DEFAULT_W = 360;
const DEFAULT_H = 480;

const cssSize = (value: number | string) => (typeof value === 'number' ? `${value}px` : value);

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const resolvePx = (value: number | string | undefined, fallback: number, parentSize: number) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.endsWith('%')) {
      const pct = Number.parseFloat(trimmed);
      if (Number.isFinite(pct)) return (parentSize * pct) / 100;
    }
    const n = Number.parseFloat(trimmed);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
};

const hexBackground = (background: string | undefined) =>
  typeof background === 'string' && background.startsWith('#') ? background : undefined;

const PhotoLantern: React.FC<PhotoLanternProps> = ({
  photos,
  width = DEFAULT_W,
  height = DEFAULT_H,
  autoRotate = true,
  autoRotateSpeed = 14,
  dragSensitivity = 0.42,
  friction = 1.4,
  frameColor = '#5c4033',
  paperColor = '#faf4e8',
  lightColor = '#f0b35a',
  background,
  lightSway = 1,
  showAccessories = true,
  tasselColor = '#c94b3a',
  objectFit = 'cover',
  silhouette = false,
  showCaption = false,
  initialAngle = 0,
  onFaceChange,
  onIndexChange,
  onPhotoClick,
  ariaLabel = '走马灯图片预览',
  className,
  style
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<LanternSceneApi | null>(null);

  const angleRef = useRef(initialAngle);
  const velocityRef = useRef(0);
  const draggingRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const lastXRef = useRef(0);
  const lastTRef = useRef(0);
  const dragMovedRef = useRef(false);
  const dragStartXRef = useRef(0);
  const pausedRef = useRef(false);
  const frontIndexRef = useRef(frontFaceIndex(initialAngle));

  const onFaceChangeRef = useRef(onFaceChange);
  const onIndexChangeRef = useRef(onIndexChange);
  const onPhotoClickRef = useRef(onPhotoClick);
  const facesRef = useRef<(PhotoLanternItem | undefined)[]>([]);
  const autoRotateRef = useRef(autoRotate);
  const autoRotateSpeedRef = useRef(autoRotateSpeed);
  const frictionRef = useRef(friction);
  const lightSwayRef = useRef(lightSway);
  const dragSensitivityRef = useRef(dragSensitivity);

  const [frontIndex, setFrontIndex] = useState(() => frontFaceIndex(initialAngle));
  const [viewSize, setViewSize] = useState({ w: DEFAULT_W, h: DEFAULT_H });
  const [canvasReady, setCanvasReady] = useState(false);

  const faces = useMemo(
    () => Array.from({ length: FACE_COUNT }, (_, i) => photos[i]) as (PhotoLanternItem | undefined)[],
    [photos]
  );

  useEffect(() => {
    facesRef.current = faces;
    onFaceChangeRef.current = onFaceChange;
    onIndexChangeRef.current = onIndexChange;
    onPhotoClickRef.current = onPhotoClick;
    autoRotateRef.current = autoRotate;
    autoRotateSpeedRef.current = autoRotateSpeed;
    frictionRef.current = friction;
    lightSwayRef.current = lightSway;
    dragSensitivityRef.current = dragSensitivity;
  }, [
    faces,
    onFaceChange,
    onIndexChange,
    onPhotoClick,
    autoRotate,
    autoRotateSpeed,
    friction,
    lightSway,
    dragSensitivity
  ]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const measure = () => {
      const parent = root.parentElement;
      const parentW = parent?.clientWidth || window.innerWidth;
      const parentH = parent?.clientHeight || window.innerHeight;
      setViewSize({
        w: resolvePx(width, DEFAULT_W, parentW),
        h: resolvePx(height, DEFAULT_H, parentH)
      });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    if (root.parentElement) ro.observe(root.parentElement);
    return () => ro.disconnect();
  }, [width, height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || viewSize.w <= 0 || viewSize.h <= 0) return;

    const api = createLanternScene(canvas, {
      width: viewSize.w,
      height: viewSize.h,
      photos: facesRef.current,
      frameColor,
      paperColor,
      lightColor,
      tasselColor,
      showAccessories,
      showCaption,
      silhouette,
      objectFit: objectFit || 'cover',
      background: hexBackground(background),
      initialAngleDeg: angleRef.current,
      onReady: () => setCanvasReady(true)
    });
    sceneRef.current = api;

    return () => {
      api.dispose();
      sceneRef.current = null;
    };
    // 几何/外观重建；照片纹理由下方 effect 热更新
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewSize.w, viewSize.h, frameColor, paperColor, lightColor, tasselColor, showAccessories, background]);

  useEffect(() => {
    sceneRef.current?.updatePhotos(faces, silhouette, objectFit || 'cover', showCaption);
  }, [faces, silhouette, objectFit, showCaption]);

  useEffect(() => {
    const unbindVisibility = bindVisibilityPause((hidden) => {
      pausedRef.current = hidden;
    });

    let frameId = 0;
    let last = performance.now();

    const tick = (now: number) => {
      frameId = requestAnimationFrame(tick);
      const api = sceneRef.current;
      if (!api || pausedRef.current) {
        last = now;
        return;
      }

      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (!draggingRef.current) {
        let velocity = velocityRef.current;
        if (Math.abs(velocity) > REST_VELOCITY) {
          velocity *= Math.exp(-frictionRef.current * dt);
          if (Math.abs(velocity) <= REST_VELOCITY) velocity = 0;
          velocityRef.current = velocity;
          angleRef.current += velocity * dt;
          api.setAngleDeg(angleRef.current);
        } else if (autoRotateRef.current) {
          angleRef.current += autoRotateSpeedRef.current * dt;
          api.setAngleDeg(angleRef.current);
        }
      }

      const nextFront = frontFaceIndex(angleRef.current);
      if (nextFront !== frontIndexRef.current) {
        frontIndexRef.current = nextFront;
        setFrontIndex(nextFront);
        const photo = facesRef.current[nextFront];
        onFaceChangeRef.current?.(nextFront, photo);
        if (photo) onIndexChangeRef.current?.(nextFront, photo);
      }

      api.setLightSway(now / 1000, lightSwayRef.current);
      api.render();
    };

    frameId = requestAnimationFrame(tick);
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
    if (e.button !== 0) return;
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
    if (Math.abs(e.clientX - dragStartXRef.current) > CLICK_SLOP_PX) dragMovedRef.current = true;

    const sensitivity = dragSensitivityRef.current;
    angleRef.current -= dx * sensitivity;
    sceneRef.current?.setAngleDeg(angleRef.current);

    // 拖拽中持续估计角速度；松手点常与最后一次 move 重合，不能靠抬起位移算惯性
    const instantVelocity = (-dx / dt) * sensitivity;
    const alpha = 1 - Math.exp(-dt / VELOCITY_SMOOTH_TAU);
    velocityRef.current = velocityRef.current + (instantVelocity - velocityRef.current) * alpha;

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
      const photo = facesRef.current[frontIndexRef.current];
      if (photo) onPhotoClickRef.current?.(frontIndexRef.current, photo);
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
        ...(background !== undefined ? { background } : null),
        ...style
      }}
      role="img"
      aria-label={ariaLabel + captionAria}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      <canvas
        ref={canvasRef}
        className={[styles.canvas, canvasReady ? styles.canvasReady : ''].filter(Boolean).join(' ')}
      />
    </div>
  );
};

export type { PhotoLanternItem, PhotoLanternProps } from './types';
export default PhotoLantern;
