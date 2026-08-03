import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './style/index.module.less';
import type { PhotoFridgeProps } from './types';

const CLICK_SLOP_PX = 6;
const MAX_VELOCITY = 1200;
const MIN_VELOCITY = 0.08;
const DRAG_LIFT = 1.05;
const DOOR_PADDING = 10;
const HANDLE_RESERVE = 32;
const CAPTION_RATIO = 0.24;
const MAGNET_COLORS = ['magnetRed', 'magnetBlue', 'magnetGreen', 'magnetYellow'] as const;

const cssSize = (value: number | string) => (typeof value === 'number' ? `${value}px` : value);

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** 由索引推出的稳定伪随机数，SSR 与客户端结果一致 */
const pseudoRandom = (seed: number) => {
  const value = Math.sin(seed * 127.1 + 31.7) * 43758.5453;
  return value - Math.floor(value);
};

interface CardMotion {
  x: number;
  y: number;
  rot: number;
  vx: number;
  vy: number;
  vRot: number;
}

interface DragState {
  pointerId: number;
  index: number;
  grabDx: number;
  grabDy: number;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  lastTime: number;
  moved: number;
  vx: number;
  vy: number;
}

const buildRestLayouts = (
  count: number,
  viewportW: number,
  viewportH: number,
  cardW: number,
  cardH: number,
  scatter: number
): Array<{ x: number; y: number; rot: number }> => {
  if (count <= 0 || viewportW <= 0 || viewportH <= 0) return [];

  const maxX = Math.max(DOOR_PADDING, viewportW - cardW - DOOR_PADDING - HANDLE_RESERVE);
  const maxY = Math.max(DOOR_PADDING, viewportH - cardH - DOOR_PADDING);
  const spreadX = Math.max(0, maxX - DOOR_PADDING) * 0.55 * scatter;
  const spreadY = Math.max(0, maxY - DOOR_PADDING) * 0.5 * scatter;
  const centerX = DOOR_PADDING + (maxX - DOOR_PADDING) * 0.5 - cardW * 0.5;
  const centerY = DOOR_PADDING + (maxY - DOOR_PADDING) * 0.5 - cardH * 0.5;

  return Array.from({ length: count }, (_, index) => {
    const t = count <= 1 ? 0.5 : index / (count - 1);
    const laneX = (t - 0.5) * spreadX * 1.4;
    const laneY = Math.sin(t * Math.PI * 1.2) * spreadY * 0.35;
    const jitterX = (pseudoRandom(index * 7.13 + 2.1) * 2 - 1) * spreadX * 0.45;
    const jitterY = (pseudoRandom(index * 11.37 + 5.9) * 2 - 1) * spreadY * 0.42;
    const rot = (pseudoRandom(index * 3.71 + 1.4) * 2 - 1) * 12 * scatter;

    return {
      x: clamp(centerX + laneX + jitterX, DOOR_PADDING, maxX),
      y: clamp(centerY + laneY + jitterY, DOOR_PADDING, maxY),
      rot
    };
  });
};

const clampMotion = (motion: CardMotion, cardW: number, cardH: number, viewportW: number, viewportH: number) => {
  const maxX = Math.max(DOOR_PADDING, viewportW - cardW - DOOR_PADDING - HANDLE_RESERVE);
  const maxY = Math.max(DOOR_PADDING, viewportH - cardH - DOOR_PADDING);
  motion.x = clamp(motion.x, DOOR_PADDING, maxX);
  motion.y = clamp(motion.y, DOOR_PADDING, maxY);
};

const PhotoFridge: React.FC<PhotoFridgeProps> = ({
  photos,
  width = '100%',
  height = 480,
  cardWidth = 120,
  cardHeight = 140,
  scatter = 1,
  friction = 2.0,
  showCaption = true,
  initialIndex = 0,
  onPhotoClick,
  ariaLabel = '冰箱磁贴照片墙',
  className,
  style
}) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const motionRef = useRef<CardMotion[]>([]);
  const zOrderRef = useRef<number[]>([]);
  const topZRef = useRef(0);
  const dragRef = useRef<DragState | null>(null);
  const activeIndexRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef(0);
  const layoutCountRef = useRef(-1);

  const onPhotoClickRef = useRef(onPhotoClick);
  const photosRef = useRef(photos);
  const frictionRef = useRef(friction);
  const cardSizeRef = useRef({ w: cardWidth, h: cardHeight });
  const viewportRef = useRef({ width: 0, height: 0 });

  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const count = photos.length;
  const scatterClamped = clamp(scatter, 0, 2.5);
  const imageHeight = Math.round(cardHeight * (showCaption ? 1 - CAPTION_RATIO : 1));
  const hasCaption = showCaption && photos.some((photo) => photo.title || photo.description);

  useEffect(() => {
    onPhotoClickRef.current = onPhotoClick;
    photosRef.current = photos;
    frictionRef.current = friction;
    cardSizeRef.current = { w: cardWidth, h: cardHeight };
  }, [onPhotoClick, photos, friction, cardWidth, cardHeight]);

  useEffect(() => {
    viewportRef.current = viewport;
  }, [viewport]);

  const restLayouts = useMemo(
    () => buildRestLayouts(count, viewport.width, viewport.height, cardWidth, cardHeight, scatterClamped),
    [cardHeight, cardWidth, count, scatterClamped, viewport.height, viewport.width]
  );

  const paintCard = useCallback((index: number) => {
    const node = cardRefs.current[index];
    const motion = motionRef.current[index];
    const z = zOrderRef.current[index] ?? index;
    if (!node || !motion) return;

    const lifted = activeIndexRef.current === index;
    const scale = lifted ? DRAG_LIFT : 1;
    node.style.zIndex = String(z);
    node.style.transform = `translate3d(${motion.x}px, ${motion.y}px, 0) rotate(${motion.rot}deg) scale(${scale})`;
  }, []);

  const paintAll = useCallback(() => {
    for (let i = 0; i < motionRef.current.length; i += 1) paintCard(i);
  }, [paintCard]);

  const applyInitialLayout = useCallback(() => {
    const { w, h } = cardSizeRef.current;
    const vp = viewportRef.current;

    motionRef.current = restLayouts.map((layout) => ({
      x: layout.x,
      y: layout.y,
      rot: layout.rot,
      vx: 0,
      vy: 0,
      vRot: 0
    }));

    zOrderRef.current = Array.from({ length: count }, (_, i) => i);
    topZRef.current = Math.max(count - 1, 0);

    const front = clamp(Math.floor(initialIndex), 0, Math.max(0, count - 1));
    if (count > 0) {
      topZRef.current += 1;
      zOrderRef.current[front] = topZRef.current;
    }

    motionRef.current.forEach((motion) => clampMotion(motion, w, h, vp.width, vp.height));
    layoutCountRef.current = count;
    paintAll();
  }, [count, initialIndex, paintAll, restLayouts]);

  const clampAllMotions = useCallback(() => {
    const { w, h } = cardSizeRef.current;
    const vp = viewportRef.current;
    if (vp.width <= 0 || vp.height <= 0) return;

    motionRef.current.forEach((motion, index) => {
      clampMotion(motion, w, h, vp.width, vp.height);
      paintCard(index);
    });
  }, [paintCard]);

  useEffect(() => {
    if (viewport.width <= 0 || viewport.height <= 0) return;

    if (layoutCountRef.current !== count || motionRef.current.length !== count) {
      applyInitialLayout();
    } else {
      clampAllMotions();
    }
  }, [applyInitialLayout, clampAllMotions, count, viewport.height, viewport.width]);

  useEffect(() => {
    const node = stageRef.current;
    if (!node) return undefined;

    const observer = new ResizeObserver(([entry]) => {
      const { width: w, height: h } = entry.contentRect;
      setViewport({ width: w, height: h });
    });
    observer.observe(node);
    setViewport({ width: node.clientWidth, height: node.clientHeight });

    return () => observer.disconnect();
  }, []);

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const stepPhysicsRef = useRef<(time: number) => void>(() => undefined);

  useEffect(() => {
    stepPhysicsRef.current = (time: number) => {
      const dt = lastFrameRef.current ? Math.min((time - lastFrameRef.current) / 1000, 0.032) : 0.016;
      lastFrameRef.current = time;

      const { w, h } = cardSizeRef.current;
      const vp = viewportRef.current;
      const decay = Math.exp(-frictionRef.current * dt * 60);

      let moving = false;
      const motions = motionRef.current;

      for (let i = 0; i < motions.length; i += 1) {
        if (activeIndexRef.current === i) continue;

        const m = motions[i];
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        m.rot += m.vRot * dt;

        m.vx *= decay;
        m.vy *= decay;
        m.vRot *= decay;

        clampMotion(m, w, h, vp.width, vp.height);

        if (Math.abs(m.vx) > MIN_VELOCITY || Math.abs(m.vy) > MIN_VELOCITY || Math.abs(m.vRot) > MIN_VELOCITY * 0.3) {
          moving = true;
        } else {
          m.vx = 0;
          m.vy = 0;
          m.vRot = 0;
        }

        paintCard(i);
      }

      if (moving) {
        rafRef.current = requestAnimationFrame((t) => stepPhysicsRef.current(t));
      } else {
        rafRef.current = null;
      }
    };
  }, [paintCard]);

  const ensureLoop = useCallback(() => {
    if (rafRef.current !== null) return;
    lastFrameRef.current = 0;
    rafRef.current = requestAnimationFrame((t) => stepPhysicsRef.current(t));
  }, []);

  useEffect(() => () => stopLoop(), [stopLoop]);

  const bringToFront = useCallback(
    (index: number) => {
      topZRef.current += 1;
      zOrderRef.current[index] = topZRef.current;
      paintCard(index);
    },
    [paintCard]
  );

  const handlePointerDown = (index: number) => (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;

    const motion = motionRef.current[index];
    if (!motion) return;

    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();

    bringToFront(index);
    activeIndexRef.current = index;
    setActiveIndex(index);

    const pointerX = event.clientX - rect.left;
    const pointerY = event.clientY - rect.top;

    dragRef.current = {
      pointerId: event.pointerId,
      index,
      grabDx: pointerX - motion.x,
      grabDy: pointerY - motion.y,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      lastTime: event.timeStamp,
      moved: 0,
      vx: 0,
      vy: 0
    };

    motion.vx = 0;
    motion.vy = 0;
    motion.vRot = 0;
    paintCard(index);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;

    const dxTotal = event.clientX - drag.startX;
    const dyTotal = event.clientY - drag.startY;
    drag.moved = Math.max(drag.moved, Math.hypot(dxTotal, dyTotal));

    const elapsed = Math.max(event.timeStamp - drag.lastTime, 1) / 1000;
    drag.vx = clamp(0.65 * ((event.clientX - drag.lastX) / elapsed) + 0.35 * drag.vx, -MAX_VELOCITY, MAX_VELOCITY);
    drag.vy = clamp(0.65 * ((event.clientY - drag.lastY) / elapsed) + 0.35 * drag.vy, -MAX_VELOCITY, MAX_VELOCITY);
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
    drag.lastTime = event.timeStamp;

    const motion = motionRef.current[drag.index];
    if (!motion) return;

    const { w, h } = cardSizeRef.current;
    motion.x = event.clientX - rect.left - drag.grabDx;
    motion.y = event.clientY - rect.top - drag.grabDy;
    motion.rot += drag.vx * 0.0035;
    clampMotion(motion, w, h, viewportRef.current.width, viewportRef.current.height);
    paintCard(drag.index);
  };

  const finishDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    dragRef.current = null;
    activeIndexRef.current = null;
    setActiveIndex(null);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const motion = motionRef.current[drag.index];
    if (!motion) return;

    if (drag.moved <= CLICK_SLOP_PX) {
      const photo = photosRef.current[drag.index];
      if (photo) onPhotoClickRef.current?.(drag.index, photo);
      paintCard(drag.index);
      return;
    }

    motion.vx = drag.vx * 0.5;
    motion.vy = drag.vy * 0.5;
    motion.vRot = drag.vx * 0.008;
    ensureLoop();
    paintCard(drag.index);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    finishDrag(event);
  };

  const handlePointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    finishDrag(event);
  };

  const rootClassName = [styles.fridge, className].filter(Boolean).join(' ');

  return (
    <div
      className={rootClassName}
      style={{ width: cssSize(width), height: cssSize(height), ...style }}
      role="region"
      aria-label={ariaLabel}
    >
      <div className={styles.handle} aria-hidden="true" />
      <div ref={stageRef} className={styles.stage}>
        {count === 0 ? (
          <div className={styles.empty}>暂无照片</div>
        ) : (
          photos.map((photo, index) => {
            const captionVisible = hasCaption && (photo.title || photo.description);
            const magnetClass = styles[MAGNET_COLORS[index % MAGNET_COLORS.length]];
            const cardClass = [styles.card, activeIndex === index ? styles.cardDragging : ''].filter(Boolean).join(' ');

            return (
              <div
                key={`${photo.src}-${index}`}
                ref={(node) => {
                  cardRefs.current[index] = node;
                }}
                className={cardClass}
                style={{ width: cardWidth, height: cardHeight }}
                onPointerDown={handlePointerDown(index)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
              >
                <div className={styles.magnetRow} aria-hidden="true">
                  <span className={`${styles.magnet} ${magnetClass}`} />
                  <span className={`${styles.magnet} ${styles[MAGNET_COLORS[(index + 1) % MAGNET_COLORS.length]]}`} />
                </div>
                <div className={styles.photoFrame} style={{ height: imageHeight }}>
                  <img
                    className={styles.image}
                    src={photo.src}
                    alt={photo.alt ?? photo.title ?? ''}
                    draggable={false}
                  />
                </div>
                {captionVisible ? (
                  <div className={styles.caption}>
                    {photo.title ? <p className={styles.title}>{photo.title}</p> : null}
                    {photo.description ? <p className={styles.description}>{photo.description}</p> : null}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PhotoFridge;
export type { PhotoFridgeItem, PhotoFridgeProps } from './types';
