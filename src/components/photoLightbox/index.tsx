import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './style/index.module.less';
import type { PhotoLightboxItem, PhotoLightboxProps } from './types';

const CLICK_SLOP_PX = 6;
const EXIT_MS = 260;
const SNAP_MS = 320;

const cssSize = (value: number | string) => (typeof value === 'number' ? `${value}px` : value);

const clampIndex = (index: number, length: number) => {
  if (length <= 0) return 0;
  return Math.max(0, Math.min(length - 1, Math.floor(index)));
};

type MotionPhase = 'idle' | 'dragging' | 'snapping' | 'exiting';

const PhotoLightbox: React.FC<PhotoLightboxProps> = ({
  photos,
  width = 360,
  height = 480,
  slideWidth = 200,
  slideHeight = 280,
  pullThreshold = 100,
  showCaption = true,
  initialIndex = 0,
  onPhotoClick,
  onIndexChange,
  ariaLabel = 'Photo lightbox',
  className,
  style
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointerId: number; startX: number; moved: boolean } | null>(null);
  const indexRef = useRef(clampIndex(initialIndex, photos.length));
  const onPhotoClickRef = useRef(onPhotoClick);
  const onIndexChangeRef = useRef(onIndexChange);
  const photosRef = useRef(photos);
  const exitTimerRef = useRef<number | null>(null);

  const [index, setIndex] = useState(() => clampIndex(initialIndex, photos.length));
  const [offsetX, setOffsetX] = useState(0);
  const [phase, setPhase] = useState<MotionPhase>('idle');

  const count = photos.length;
  const current = photos[index];
  const next = index < count - 1 ? photos[index + 1] : undefined;
  const canGoPrev = index > 0;
  const canGoNext = index < count - 1;

  useEffect(() => {
    onPhotoClickRef.current = onPhotoClick;
    onIndexChangeRef.current = onIndexChange;
    photosRef.current = photos;
  }, [onPhotoClick, onIndexChange, photos]);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    return () => {
      if (exitTimerRef.current != null) window.clearTimeout(exitTimerRef.current);
    };
  }, []);

  const commitIndex = useCallback((nextIndex: number) => {
    const list = photosRef.current;
    const clamped = clampIndex(nextIndex, list.length);
    setIndex(clamped);
    indexRef.current = clamped;
    const photo = list[clamped];
    if (photo) onIndexChangeRef.current?.(clamped, photo);
  }, []);

  const finishExit = useCallback(
    (targetIndex: number) => {
      commitIndex(targetIndex);
      setOffsetX(0);
      setPhase('idle');
    },
    [commitIndex]
  );

  const animateExit = useCallback(
    (direction: 1 | -1) => {
      const delta = direction * (slideWidth + 72);
      setPhase('exiting');
      setOffsetX(delta);

      if (exitTimerRef.current != null) window.clearTimeout(exitTimerRef.current);
      exitTimerRef.current = window.setTimeout(() => {
        const target = clampIndex(indexRef.current + direction, photosRef.current.length);
        finishExit(target);
      }, EXIT_MS);
    },
    [finishExit, slideWidth]
  );

  const snapBack = useCallback(() => {
    setPhase('snapping');
    setOffsetX(0);
    window.setTimeout(() => setPhase('idle'), SNAP_MS);
  }, []);

  const goBy = useCallback(
    (delta: number) => {
      const target = clampIndex(indexRef.current + delta, photosRef.current.length);
      if (target === indexRef.current) return;
      animateExit(delta > 0 ? 1 : -1);
    },
    [animateExit]
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (phase === 'exiting' || count === 0) return;
      dragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        moved: false
      };
      setPhase('dragging');
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [count, phase]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId || phase === 'exiting') return;

      const dx = event.clientX - drag.startX;
      if (Math.abs(dx) > CLICK_SLOP_PX) drag.moved = true;

      const resisted = (dx > 0 && !canGoNext) || (dx < 0 && !canGoPrev) ? dx * 0.28 : dx;
      setOffsetX(resisted);
    },
    [canGoNext, canGoPrev, phase]
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;

      dragRef.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      if (phase === 'exiting') return;

      const dx = event.clientX - drag.startX;
      if (!drag.moved) {
        setPhase('idle');
        setOffsetX(0);
        const photo = photosRef.current[indexRef.current];
        if (photo) onPhotoClickRef.current?.(indexRef.current, photo);
        return;
      }

      if (Math.abs(dx) >= pullThreshold) {
        const direction = dx > 0 ? 1 : -1;
        if ((direction > 0 && canGoNext) || (direction < 0 && canGoPrev)) {
          animateExit(direction);
          return;
        }
      }

      snapBack();
    },
    [animateExit, canGoNext, canGoPrev, phase, pullThreshold, snapBack]
  );

  const handlePointerCancel = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      dragRef.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      if (phase !== 'exiting') snapBack();
    },
    [phase, snapBack]
  );

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goBy(1);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goBy(-1);
      }
    };

    node.addEventListener('keydown', onKeyDown);
    return () => node.removeEventListener('keydown', onKeyDown);
  }, [goBy]);

  const tablePadX = Math.max(24, (typeof width === 'number' ? width : slideWidth + 48) * 0.08);
  const tablePadY = Math.max(28, (typeof height === 'number' ? height : slideHeight + 56) * 0.1);
  const tableWidth = slideWidth + tablePadX * 2;
  const tableHeight = slideHeight + tablePadY * 2;

  const behindScale = 0.94;
  const behindYOffset = 14;
  const activeTransform = `translate(-50%, -50%) translateX(${offsetX}px)`;
  const behindTransform = `translate(-50%, calc(-50% + ${behindYOffset}px)) scale(${behindScale})`;
  const transition =
    phase === 'snapping' || phase === 'exiting'
      ? `transform ${phase === 'exiting' ? EXIT_MS : SNAP_MS}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${EXIT_MS}ms ease`
      : 'none';

  const renderCaption = (photo: PhotoLightboxItem) => {
    if (!showCaption || (!photo.title && !photo.description)) return null;
    return (
      <div className={styles.caption}>
        {photo.title ? <div className={styles.captionTitle}>{photo.title}</div> : null}
        {photo.description ? <div className={styles.captionDesc}>{photo.description}</div> : null}
      </div>
    );
  };

  const renderSlide = (
    photo: PhotoLightboxItem,
    slideIndex: number,
    variant: 'active' | 'behind',
    transform: string,
    extraClass?: string
  ) => {
    const captionHeight = showCaption && (photo.title || photo.description) ? 44 : 0;
    const imageHeight = slideHeight - captionHeight;

    return (
      <div
        className={[styles.slide, variant === 'active' ? styles.slideActive : styles.slideBehind, extraClass]
          .filter(Boolean)
          .join(' ')}
        style={{
          width: slideWidth,
          height: slideHeight,
          transform,
          transition,
          opacity: variant === 'active' && phase === 'exiting' ? 0.35 : undefined
        }}
        onPointerDown={variant === 'active' ? handlePointerDown : undefined}
        onPointerMove={variant === 'active' ? handlePointerMove : undefined}
        onPointerUp={variant === 'active' ? handlePointerUp : undefined}
        onPointerCancel={variant === 'active' ? handlePointerCancel : undefined}
        role={variant === 'active' ? 'button' : undefined}
        aria-label={
          variant === 'active' ? photo.alt || photo.title || `Slide ${slideIndex + 1} of ${count}` : undefined
        }
      >
        <div className={styles.slideImageWrap} style={{ height: imageHeight }}>
          <img className={styles.slideImage} src={photo.src} alt={photo.alt || photo.title || ''} draggable={false} />
        </div>
        {renderCaption(photo)}
      </div>
    );
  };

  return (
    <div
      ref={rootRef}
      className={[styles.lightbox, className].filter(Boolean).join(' ')}
      style={{ width: cssSize(width), height: cssSize(height), ...style }}
      role="region"
      aria-label={ariaLabel}
      tabIndex={0}
    >
      <div className={styles.stage}>
        {count === 0 ? (
          <div className={styles.empty}>No photos</div>
        ) : (
          <div className={styles.table} style={{ width: tableWidth, height: tableHeight }}>
            <div className={styles.slot} style={{ width: slideWidth, height: slideHeight }}>
              {next ? renderSlide(next, index + 1, 'behind', behindTransform) : null}
              {current
                ? renderSlide(
                    current,
                    index,
                    'active',
                    activeTransform,
                    phase === 'exiting' ? styles.slideExiting : undefined
                  )
                : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoLightbox;
export type { PhotoLightboxItem, PhotoLightboxProps } from './types';
