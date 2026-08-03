import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './style/index.module.less';
import type { PhotoPostcardItem, PhotoPostcardProps } from './types';

const CLICK_SLOP_PX = 6;
const EXIT_MS = 280;
const SNAP_MS = 320;

const cssSize = (value: number | string) => (typeof value === 'number' ? `${value}px` : value);

const modIndex = (value: number, count: number) => {
  if (count <= 0) return 0;
  return ((value % count) + count) % count;
};

const clampIndex = (index: number, count: number) => {
  if (count <= 0) return 0;
  return Math.max(0, Math.min(count - 1, Math.floor(index)));
};

/** 由索引推出的稳定伪随机数，SSR 与客户端结果一致 */
const pseudoRandom = (seed: number) => {
  const value = Math.sin(seed * 127.1 + 31.7) * 43758.5453;
  return value - Math.floor(value);
};

type MotionPhase = 'idle' | 'dragging' | 'snapping' | 'exiting';

interface PostcardFacesProps {
  photo: PhotoPostcardItem;
  showCaption: boolean;
}

const PostcardFaces: React.FC<PostcardFacesProps> = ({ photo, showCaption }) => {
  const hasCaption = showCaption && (photo.title || photo.description);
  const greeting = photo.title ? photo.title : 'Greetings from the road';

  return (
    <>
      <div className={`${styles.face} ${styles.front}`}>
        <div className={`${styles.photoFrame} ${hasCaption ? styles.photoFrameWithCaption : ''}`}>
          <div className={styles.photoWrap}>
            <img className={styles.photo} src={photo.src} alt={photo.alt ?? photo.title ?? ''} draggable={false} />
          </div>
        </div>
        <div className={styles.cornerStamp} aria-hidden="true" />
        {hasCaption ? (
          <div className={styles.frontCaption}>
            {photo.title ? <p className={styles.frontCaptionTitle}>{photo.title}</p> : null}
            {photo.description ? <p className={styles.frontCaptionDesc}>{photo.description}</p> : null}
          </div>
        ) : null}
      </div>

      <div className={`${styles.face} ${styles.back}`}>
        <div className={styles.divider} aria-hidden="true" />
        <div className={styles.linedPaper}>
          <p className={styles.greeting}>{greeting}</p>
          {photo.description ? (
            <p className={styles.bodyText}>{photo.description}</p>
          ) : (
            <p className={styles.bodyPlaceholder}>Wish you were here…</p>
          )}
        </div>
        <div className={styles.backFooter}>
          <div className={styles.postmark} aria-hidden="true">
            <span className={styles.postmarkText}>
              TRAVEL
              <br />
              POST
            </span>
          </div>
          <div className={styles.stampSquare} aria-hidden="true" />
        </div>
      </div>
    </>
  );
};

/**
 * 旅行明信片堆叠：单张特色明信片可 3D 翻转，水平拖拽切换上一张/下一张。
 */
const PhotoPostcard: React.FC<PhotoPostcardProps> = ({
  photos,
  width = 360,
  height = 420,
  cardWidth = 260,
  cardHeight = 170,
  pullThreshold = 80,
  showCaption = true,
  initialIndex = 0,
  initialFlipped = false,
  onPhotoClick,
  onIndexChange,
  onFlipChange,
  ariaLabel = '明信片',
  className,
  style
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointerId: number; startX: number; moved: boolean } | null>(null);
  const indexRef = useRef(clampIndex(initialIndex, photos.length));
  const onPhotoClickRef = useRef(onPhotoClick);
  const onIndexChangeRef = useRef(onIndexChange);
  const onFlipChangeRef = useRef(onFlipChange);
  const photosRef = useRef(photos);
  const exitTimerRef = useRef<number | null>(null);

  const [index, setIndex] = useState(() => clampIndex(initialIndex, photos.length));
  const [flipped, setFlipped] = useState(initialFlipped);
  const [offsetX, setOffsetX] = useState(0);
  const [phase, setPhase] = useState<MotionPhase>('idle');

  const count = photos.length;
  const current = photos[index];

  useEffect(() => {
    onPhotoClickRef.current = onPhotoClick;
    onIndexChangeRef.current = onIndexChange;
    onFlipChangeRef.current = onFlipChange;
    photosRef.current = photos;
  }, [onPhotoClick, onIndexChange, onFlipChange, photos]);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    return () => {
      if (exitTimerRef.current != null) window.clearTimeout(exitTimerRef.current);
    };
  }, []);

  const stackLayouts = useMemo(() => {
    if (count <= 1) return [];
    return [1, 2].slice(0, Math.min(2, count - 1)).map((depth) => {
      const seed = index * 13.7 + depth * 5.3;
      const rot = (pseudoRandom(seed) * 2 - 1) * 5.5;
      const dx = depth * 5 + pseudoRandom(seed + 1.1) * 4;
      const dy = depth * 3 + pseudoRandom(seed + 2.4) * 3;
      return { depth, rot, dx, dy };
    });
  }, [count, index]);

  const commitIndex = useCallback((nextIndex: number) => {
    const list = photosRef.current;
    const clamped = clampIndex(nextIndex, list.length);
    setIndex(clamped);
    indexRef.current = clamped;
    setFlipped(false);
    onFlipChangeRef.current?.(false);
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
      const delta = direction * (cardWidth * 0.55 + 48);
      setPhase('exiting');
      setOffsetX(delta);

      if (exitTimerRef.current != null) window.clearTimeout(exitTimerRef.current);
      exitTimerRef.current = window.setTimeout(() => {
        const list = photosRef.current;
        const target = modIndex(indexRef.current + direction, list.length);
        finishExit(target);
      }, EXIT_MS);
    },
    [cardWidth, finishExit]
  );

  const snapBack = useCallback(() => {
    setPhase('snapping');
    setOffsetX(0);
    window.setTimeout(() => setPhase('idle'), SNAP_MS);
  }, []);

  const goBy = useCallback(
    (delta: number) => {
      const list = photosRef.current;
      if (list.length <= 1) return;
      animateExit(delta > 0 ? 1 : -1);
    },
    [animateExit]
  );

  const toggleFlip = useCallback(() => {
    setFlipped((prev) => {
      const next = !prev;
      onFlipChangeRef.current?.(next);
      return next;
    });
  }, []);

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

      const resisted = count <= 1 ? dx * 0.22 : dx;
      setOffsetX(resisted);
    },
    [count, phase]
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
        toggleFlip();
        const photo = photosRef.current[indexRef.current];
        if (photo) onPhotoClickRef.current?.(indexRef.current, photo);
        return;
      }

      if (Math.abs(dx) >= pullThreshold && count > 1) {
        animateExit(dx > 0 ? 1 : -1);
        return;
      }

      snapBack();
    },
    [animateExit, count, phase, pullThreshold, snapBack, toggleFlip]
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
      } else if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        toggleFlip();
      }
    };

    node.addEventListener('keydown', onKeyDown);
    return () => node.removeEventListener('keydown', onKeyDown);
  }, [goBy, toggleFlip]);

  const activeTransform = `translateX(${offsetX}px)`;
  const transition =
    phase === 'snapping' || phase === 'exiting'
      ? `transform ${phase === 'exiting' ? EXIT_MS : SNAP_MS}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${EXIT_MS}ms ease`
      : 'none';

  const rootClassName = [styles.postcard, className].filter(Boolean).join(' ');
  const cardClassName = [
    styles.cardActive,
    flipped ? styles.flipped : '',
    phase === 'exiting' ? styles.cardExiting : ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={rootRef}
      className={rootClassName}
      style={{ width: cssSize(width), height: cssSize(height), ...style }}
      role="region"
      aria-label={ariaLabel}
      tabIndex={0}
    >
      <div className={styles.stage}>
        {count === 0 ? (
          <div className={styles.empty}>暂无明信片</div>
        ) : (
          <>
            <div className={styles.stack} style={{ width: cardWidth, height: cardHeight }}>
              {stackLayouts.map(({ depth, rot, dx, dy }) => (
                <div
                  key={depth}
                  className={styles.stackCard}
                  style={{
                    width: cardWidth,
                    height: cardHeight,
                    transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${rot}deg)`,
                    opacity: depth === 1 ? 0.92 : 0.78
                  }}
                  aria-hidden="true"
                />
              ))}

              <div className={styles.cardSlot} style={{ width: cardWidth, height: cardHeight }}>
                <div
                  className={cardClassName}
                  style={{
                    width: cardWidth,
                    height: cardHeight,
                    transform: activeTransform,
                    transition,
                    opacity: phase === 'exiting' ? 0.55 : 1
                  }}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerCancel}
                  role="button"
                  aria-label={
                    current
                      ? `${flipped ? '背面' : '正面'}：${current.alt ?? current.title ?? `明信片 ${index + 1}`}`
                      : undefined
                  }
                  aria-pressed={flipped}
                >
                  {current ? (
                    <div className={styles.flipInner}>
                      <PostcardFaces photo={current} showCaption={showCaption} />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {count > 1 ? <div className={styles.hint}>拖拽切换 · 点击查看背面</div> : null}
          </>
        )}
      </div>
    </div>
  );
};

export default PhotoPostcard;
export type { PhotoPostcardItem, PhotoPostcardProps } from './types';
