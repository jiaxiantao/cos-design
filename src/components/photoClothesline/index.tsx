import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CLICK_SLOP_PX,
  MAX_FLING_SPEED,
  MAX_FRAME_MS,
  MAX_RELEASE_SPEED,
  OVERSCROLL_DAMP,
  PHYSICS_STEP_MS,
  PHYSICS_STEP_S,
  PIN_GRIP
} from './constants';
import { buildLayout, buildPhysics } from './layout';
import { clamp, cssSize } from './math';
import { createHangerNode, type DragState, type Point2 } from './model';
import {
  getOffsetBounds,
  isSimulationSettled,
  paintSimulation,
  settleSimulation,
  stepPhysics,
  type SimPaintCache,
  type SimPaintTargets,
  type SimState
} from './simulation';
import styles from './style/index.module.less';
import type { PhotoClotheslineItem, PhotoClotheslineProps } from './types';

const PhotoClothesline: React.FC<PhotoClotheslineProps> = ({
  photos,
  width = '100%',
  height = 480,
  photoWidth = 150,
  photoHeight = 200,
  photoGap = 46,
  ropeTop = 66,
  ropeSag = 26,
  bandLength = 34,
  bandWidth = 5,
  maxPull = 110,
  stiffness = 1,
  damping = 0.16,
  tension = 0.35,
  tilt = 5,
  ropeColor = '#8d7a5c',
  bandColor,
  pinColor = '#d8a761',
  frameColor = '#fffdf7',
  background,
  objectFit = 'cover',
  showCaption = true,
  initialIndex = 0,
  onIndexChange,
  onPhotoClick,
  ariaLabel = 'Photo clothesline',
  className,
  style
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const ropePathsRef = useRef<Array<SVGPathElement | null>>([]);
  const bandPathsRef = useRef<Array<SVGPathElement | null>>([]);
  const bandGlossRef = useRef<Array<SVGPathElement | null>>([]);
  const knotsRef = useRef<Array<SVGCircleElement | null>>([]);
  const cardsRef = useRef<Array<HTMLDivElement | null>>([]);

  const paintCacheRef = useRef<SimPaintCache>({
    bands: [],
    cards: [],
    rope: '',
    rail: ''
  });

  const simRef = useRef<SimState>({
    nodes: [],
    layout: null,
    physics: null,
    offset: 0,
    offsetVelocity: 0,
    snapTarget: null,
    drag: null,
    impulse: null,
    buffer: [] as Point2[]
  });

  const loopRef = useRef<((time: number) => void) | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const accRef = useRef(0);
  const readyRef = useRef(false);
  const requestedIndexRef = useRef(initialIndex);
  const lastIndexRef = useRef(initialIndex);
  const onIndexChangeRef = useRef(onIndexChange);
  const onPhotoClickRef = useRef(onPhotoClick);
  const photosRef = useRef(photos);

  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  const count = photos.length;
  const hasCaption = showCaption && photos.some((photo) => photo.title || photo.description);

  useEffect(() => {
    onIndexChangeRef.current = onIndexChange;
    onPhotoClickRef.current = onPhotoClick;
    photosRef.current = photos;
  }, [onIndexChange, onPhotoClick, photos]);

  const layout = useMemo(
    () =>
      buildLayout({
        count,
        viewportWidth: viewport.width,
        viewportHeight: viewport.height,
        photoWidth,
        photoHeight,
        photoGap,
        ropeTop,
        ropeSag,
        bandLength,
        maxPull,
        tilt
      }),
    [
      bandLength,
      count,
      maxPull,
      photoGap,
      photoHeight,
      photoWidth,
      ropeSag,
      ropeTop,
      tilt,
      viewport.height,
      viewport.width
    ]
  );

  const physics = useMemo(
    () => buildPhysics({ bandLength, damping, maxPull, stiffness, tension }),
    [bandLength, damping, maxPull, stiffness, tension]
  );

  const canPan = Math.min(0, viewport.width - layout.railWidth) < -0.5;

  const viewWidth = useCallback(() => viewportRef.current?.clientWidth ?? viewport.width, [viewport.width]);

  const paintTargets = useCallback(
    (): SimPaintTargets => ({
      rail: railRef.current,
      ropePaths: ropePathsRef.current,
      bandPaths: bandPathsRef.current,
      bandGloss: bandGlossRef.current,
      knots: knotsRef.current,
      cards: cardsRef.current
    }),
    []
  );

  const paint = useCallback(
    (alpha: number, dt: number) => {
      paintSimulation(simRef.current, paintTargets(), paintCacheRef.current, alpha, dt);
    },
    [paintTargets]
  );

  const startLoop = useCallback(() => {
    if (frameRef.current !== null || typeof window === 'undefined') return;
    const loop = loopRef.current;
    if (!loop) return;
    lastTimeRef.current = 0;
    accRef.current = 0;
    frameRef.current = window.requestAnimationFrame(loop);
  }, []);

  // 帧循环装在 ref 里，指针事件与键盘都能随时把它唤起
  useEffect(() => {
    const loop = (time: number) => {
      frameRef.current = null;
      const previous = lastTimeRef.current || time;
      lastTimeRef.current = time;
      const frameMs = Math.min(time - previous, MAX_FRAME_MS);
      accRef.current += frameMs;
      const state = simRef.current;
      const vw = viewWidth();

      let guard = 0;
      while (accRef.current >= PHYSICS_STEP_MS && guard < 12) {
        stepPhysics(state, vw, PHYSICS_STEP_S);
        accRef.current -= PHYSICS_STEP_MS;
        guard += 1;
      }
      if (guard >= 12) accRef.current = 0;

      if (isSimulationSettled(state, vw)) {
        settleSimulation(state);
        paint(1, 0);
        lastTimeRef.current = 0;
        accRef.current = 0;
        const centers = state.layout?.centers;
        if (centers && centers.length > 0) {
          const viewCenter = vw / 2 - state.offset;
          let nearest = 0;
          let best = Number.POSITIVE_INFINITY;
          for (let i = 0; i < centers.length; i++) {
            const distance = Math.abs(centers[i] - viewCenter);
            if (distance < best) {
              best = distance;
              nearest = i;
            }
          }
          if (nearest !== lastIndexRef.current) {
            lastIndexRef.current = nearest;
            const photo = photosRef.current[nearest];
            if (photo) onIndexChangeRef.current?.(nearest, photo);
          }
        }
        return;
      }

      paint(accRef.current / PHYSICS_STEP_MS, frameMs / 1000);
      frameRef.current = window.requestAnimationFrame(loop);
    };
    loopRef.current = loop;
    return () => {
      loopRef.current = null;
    };
  }, [paint, viewWidth]);

  useEffect(() => {
    const state = simRef.current;
    state.layout = layout;
    state.physics = physics;
  }, [layout, physics]);

  // 尺寸或照片数变化后重新挂绳，避免质点留在旧的夹点下面
  useEffect(() => {
    const state = simRef.current;
    state.nodes = Array.from({ length: count }, (_, index) => createHangerNode(layout, physics, index));
    cardsRef.current.length = count;
    paintCacheRef.current.rope = '';
    paintCacheRef.current.rail = '';
  }, [count, layout, physics]);

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const measure = (nextWidth: number, nextHeight: number) =>
      setViewport((prev) =>
        prev.width === nextWidth && prev.height === nextHeight ? prev : { width: nextWidth, height: nextHeight }
      );
    measure(element.clientWidth, element.clientHeight);
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) measure(Math.round(entry.contentRect.width), Math.round(entry.contentRect.height));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  /** 让某张照片停在可视区中央（首次渲染直接就位，之后平滑滑过去） */
  const offsetForIndex = useCallback(
    (index: number) => {
      const view = viewWidth();
      const center = simRef.current.layout?.centers[clamp(index, 0, Math.max(0, count - 1))];
      if (center === undefined) return 0;
      const { min, max } = getOffsetBounds(view, simRef.current.layout?.railWidth ?? 0);
      return clamp(view / 2 - center, min, max);
    },
    [count, viewWidth]
  );

  useEffect(() => {
    if (viewport.width <= 0) return;
    const state = simRef.current;
    if (!readyRef.current) {
      readyRef.current = true;
      requestedIndexRef.current = initialIndex;
      state.offset = offsetForIndex(initialIndex);
      paint(1, 0);
      return;
    }
    if (requestedIndexRef.current !== initialIndex) {
      requestedIndexRef.current = initialIndex;
      state.snapTarget = offsetForIndex(initialIndex);
      startLoop();
      return;
    }
    const { min, max } = getOffsetBounds(viewWidth(), state.layout?.railWidth ?? 0);
    state.offset = clamp(state.offset, min, max);
    paint(1, 0);
  }, [count, initialIndex, layout, offsetForIndex, paint, startLoop, viewWidth, viewport.width]);

  useEffect(
    () => () => {
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    },
    []
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0 && event.pointerType === 'mouse') return;
      const target = event.target as HTMLElement | null;
      const hanger = target?.closest?.('[data-photo-index]') as HTMLElement | null;
      const rawIndex = hanger ? Number(hanger.dataset.photoIndex) : -1;
      const photoIndex = Number.isFinite(rawIndex) ? rawIndex : -1;

      const rect = viewportRef.current?.getBoundingClientRect();
      const rectLeft = rect?.left ?? 0;
      const rectTop = rect?.top ?? 0;
      const state = simRef.current;
      const pointerX = event.clientX - rectLeft - state.offset;
      const pointerY = event.clientY - rectTop;
      const node = photoIndex >= 0 ? state.nodes[photoIndex] : undefined;
      const end = node?.chain[node.chain.length - 1];

      state.snapTarget = null;
      state.offsetVelocity = 0;
      state.drag = {
        pointerId: event.pointerId,
        // 抓住照片就是抓住吊牌，任意方向甩；空白处拖拽才是横向浏览
        mode: end ? 'photo' : 'pan',
        photoIndex,
        grabDx: end ? pointerX - end.x : 0,
        grabDy: end ? pointerY - end.y : 0,
        pointerX,
        pointerY,
        smoothX: pointerX,
        smoothY: pointerY,
        rectLeft,
        rectTop,
        startX: event.clientX,
        startY: event.clientY,
        startOffset: state.offset,
        lastX: event.clientX,
        lastY: event.clientY,
        lastTime: event.timeStamp,
        vx: 0,
        vy: 0,
        moved: 0
      } satisfies DragState;
      event.currentTarget.setPointerCapture(event.pointerId);
      startLoop();
    },
    [startLoop]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const state = simRef.current;
      const drag = state.drag;
      if (!drag || drag.pointerId !== event.pointerId) return;

      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      drag.moved = Math.max(drag.moved, Math.hypot(dx, dy));

      const elapsed = Math.max(event.timeStamp - drag.lastTime, 1) / 1000;
      drag.vx = 0.7 * ((event.clientX - drag.lastX) / elapsed) + 0.3 * drag.vx;
      drag.vy = 0.7 * ((event.clientY - drag.lastY) / elapsed) + 0.3 * drag.vy;
      drag.lastX = event.clientX;
      drag.lastY = event.clientY;
      drag.lastTime = event.timeStamp;

      if (drag.mode === 'pan') {
        const { min, max } = getOffsetBounds(viewWidth(), state.layout?.railWidth ?? 0);
        const next = drag.startOffset + dx;
        const overshoot = next > max ? next - max : next < min ? next - min : 0;
        state.offset = next - overshoot * (1 - OVERSCROLL_DAMP);
        startLoop();
        return;
      }

      drag.pointerX = event.clientX - drag.rectLeft - state.offset;
      drag.pointerY = event.clientY - drag.rectTop;
      startLoop();
    },
    [startLoop, viewWidth]
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

      if (drag.mode === 'pan') {
        state.offsetVelocity = clamp(drag.vx, -MAX_FLING_SPEED, MAX_FLING_SPEED);
      } else if (drag.moved <= CLICK_SLOP_PX && drag.photoIndex >= 0) {
        const photo = photosRef.current[drag.photoIndex];
        if (photo) onPhotoClickRef.current?.(drag.photoIndex, photo);
      } else if (drag.photoIndex >= 0) {
        // 用整段手势测出来的速度甩出去，不然刚好落在两次 pointermove 之间松手就会没有惯性
        state.impulse = {
          index: drag.photoIndex,
          vx: clamp(drag.vx, -MAX_RELEASE_SPEED, MAX_RELEASE_SPEED),
          vy: clamp(drag.vy, -MAX_RELEASE_SPEED, MAX_RELEASE_SPEED)
        };
      }
      startLoop();
    },
    [startLoop]
  );

  const handlePointerCancel = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const state = simRef.current;
      const drag = state.drag;
      if (!drag || drag.pointerId !== event.pointerId) return;
      state.drag = null;
      startLoop();
    },
    [startLoop]
  );

  // 触控板横向滚动 / Shift + 滚轮平移；非被动监听才能阻止页面横滚
  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.shiftKey ? event.deltaY : 0;
      if (delta === 0) return;
      const state = simRef.current;
      const { min, max } = getOffsetBounds(viewWidth(), state.layout?.railWidth ?? 0);
      if (min >= max) return;
      event.preventDefault();
      state.snapTarget = null;
      state.offsetVelocity = 0;
      state.offset = clamp(state.offset - delta, min, max);
      startLoop();
    };
    element.addEventListener('wheel', onWheel, { passive: false });
    return () => element.removeEventListener('wheel', onWheel);
  }, [startLoop, viewWidth]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const hanger = (event.target as HTMLElement | null)?.closest?.('[data-photo-index]') as HTMLElement | null;
      const index = hanger ? Number(hanger.dataset.photoIndex) : -1;
      const state = simRef.current;

      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        const { min, max } = getOffsetBounds(viewWidth(), state.layout?.railWidth ?? 0);
        if (min >= max) return;
        event.preventDefault();
        const step = photoWidth + photoGap;
        const from = state.snapTarget ?? state.offset;
        state.snapTarget = clamp(from + (event.key === 'ArrowLeft' ? step : -step), min, max);
        startLoop();
        return;
      }
      if (index < 0) return;
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        state.impulse = { index, vx: 0, vy: event.key === 'ArrowDown' ? 1500 : -1000 };
        startLoop();
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        const photo = photosRef.current[index];
        if (!photo || !onPhotoClickRef.current) return;
        event.preventDefault();
        onPhotoClickRef.current(index, photo);
      }
    },
    [photoGap, photoWidth, startLoop, viewWidth]
  );

  const hangerStyle = (index: number) =>
    ({
      left: layout.cardLefts[index],
      top: layout.cardTops[index],
      width: photoWidth,
      height: photoHeight,
      transform: `translate3d(0, 0, 0) rotate(${layout.baseRots[index]}deg)`,
      '--pin-x': `${layout.pinOffsets[index]}px`,
      '--pin-grip': `${-PIN_GRIP}px`
    }) as React.CSSProperties;

  const rootStyle = {
    ...style,
    width: cssSize(width),
    height: cssSize(height),
    '--rope-color': ropeColor,
    '--band-color': bandColor ?? ropeColor,
    '--band-width': `${Math.max(1, bandWidth)}px`,
    '--pin-color': pinColor,
    '--frame-color': frameColor,
    ...(background ? { '--clothesline-bg': background } : null)
  } as React.CSSProperties;

  return (
    <div className={`${styles.clothesline} ${className ?? ''}`} style={rootStyle} role="region" aria-label={ariaLabel}>
      <div
        ref={viewportRef}
        className={`${styles.viewport} ${canPan ? styles.pannable : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={handlePointerCancel}
        onKeyDown={handleKeyDown}
      >
        <div ref={railRef} className={styles.rail} style={{ width: layout.railWidth }}>
          <svg
            className={styles.strings}
            width={layout.railWidth}
            height={layout.stageHeight}
            viewBox={`0 0 ${layout.railWidth} ${layout.stageHeight}`}
            aria-hidden="true"
          >
            <path
              ref={(element) => {
                ropePathsRef.current[0] = element;
              }}
              className={styles.ropeShadow}
            />
            <path
              ref={(element) => {
                ropePathsRef.current[1] = element;
              }}
              className={styles.ropeShadowCore}
            />
            <path
              ref={(element) => {
                ropePathsRef.current[2] = element;
              }}
              className={styles.ropeBody}
            />
            <path
              ref={(element) => {
                ropePathsRef.current[3] = element;
              }}
              className={styles.ropeTwist}
            />
            {photos.map((photo, index) => (
              <g key={`band-${photo.src}-${index}`}>
                <path
                  ref={(element) => {
                    bandPathsRef.current[index] = element;
                    // 元素换新的了，缓存里的 d 作废，否则相同字符串会被跳过、吊带画不出来
                    paintCacheRef.current.bands[index] = '';
                  }}
                  className={styles.bandBody}
                />
                <path
                  ref={(element) => {
                    bandGlossRef.current[index] = element;
                  }}
                  className={styles.bandGloss}
                />
                <circle
                  ref={(element) => {
                    knotsRef.current[index] = element;
                  }}
                  className={styles.bandKnot}
                  r={4.2}
                />
              </g>
            ))}
          </svg>

          {photos.map((photo, index) => (
            <PhotoHanger
              key={`${photo.src}-${index}`}
              photo={photo}
              index={index}
              style={hangerStyle(index)}
              objectFit={objectFit}
              hasCaption={hasCaption}
              clickable={Boolean(onPhotoClick)}
              onCardRef={(element) => {
                cardsRef.current[index] = element;
                paintCacheRef.current.cards[index] = '';
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface PhotoHangerProps {
  photo: PhotoClotheslineItem;
  index: number;
  style: React.CSSProperties;
  objectFit: React.CSSProperties['objectFit'];
  hasCaption: boolean;
  clickable: boolean;
  onCardRef: (element: HTMLDivElement | null) => void;
}

const PhotoHanger = React.memo(
  ({ photo, index, style, objectFit, hasCaption, clickable, onCardRef }: PhotoHangerProps) => (
    <div
      ref={onCardRef}
      className={styles.hanger}
      data-photo-index={index}
      style={style}
      tabIndex={0}
      role={clickable ? 'button' : 'group'}
      aria-label={photo.title ?? photo.alt ?? undefined}
    >
      <span className={styles.pin} aria-hidden="true">
        <span className={styles.pinSpring} />
      </span>
      <figure className={styles.frame}>
        <span className={styles.photo}>
          <img src={photo.src} alt={photo.alt ?? photo.title ?? ''} draggable={false} style={{ objectFit }} />
        </span>
        {hasCaption && (
          <figcaption className={styles.caption}>
            {photo.title && <strong>{photo.title}</strong>}
            {photo.description && <span>{photo.description}</span>}
          </figcaption>
        )}
      </figure>
    </div>
  )
);

PhotoHanger.displayName = 'PhotoHanger';

export type { PhotoClotheslineItem, PhotoClotheslineProps } from './types';
export default PhotoClothesline;
