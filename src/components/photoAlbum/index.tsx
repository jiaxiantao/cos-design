import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './style/index.module.less';
import type { PhotoAlbumItem, PhotoAlbumProps } from './types';

type TurnDirection = 'next' | 'previous';

/** cover：先盖住再开动画；run：正式翻页；settle：贴平后卸层 */
type TurnPhase = 'cover' | 'run' | 'settle';

interface TurnState {
  direction: TurnDirection;
  /** 翻页开始时的当前索引，整段动画期间锁定，避免中途状态错乱 */
  fromIndex: number;
  targetIndex: number;
  phase: TurnPhase;
  /**
   * 翻页叶盖住落点侧后，提前把底层切到终态并完成绘制，
   * 结束卸层时只是去掉一层已贴平的重复页，避免换图+拆层叠在同一帧。
   */
  underlaySynced?: boolean;
}

/** 已解码过的图片，避免重复预热 */
const warmedPhotos = new Set<string>();

/** 提前下载并解码即将翻到的照片，翻页首帧不会再等图片解码 */
const warmPhoto = (src?: string) => {
  if (!src || typeof Image === 'undefined' || warmedPhotos.has(src)) return;
  warmedPhotos.add(src);
  const image = new Image();
  image.src = src;
  image.decode?.().catch(() => {});
};

const cssSize = (value: number | string) => (typeof value === 'number' ? `${value}px` : value);

/** 右页索引：可为 photos.length（右页空白飞页），以便最后一叶翻完后停在「仅左页有图」 */
const clampRightIndex = (index: number, length: number) =>
  Math.max(0, Math.min(Math.floor(index), Math.max(0, length)));

const FlyleafMotif = () => (
  <svg className={styles.flyleafMotif} viewBox="0 0 120 120" aria-hidden="true">
    <g fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
      {/* 外框菱形 + 内圆，四向对称 */}
      <circle cx="60" cy="60" r="46" />
      <path d="M60 14 L106 60 L60 106 L14 60 Z" />
      <circle cx="60" cy="60" r="28" />
      <path d="M60 32 L88 60 L60 88 L32 60 Z" />
      {/* 十字与对角装饰线 */}
      <path d="M60 20 V40 M60 80 V100 M20 60 H40 M80 60 H100" />
      <path d="M34 34 L46 46 M86 34 L74 46 M34 86 L46 74 M86 86 L74 74" />
      {/* 中心小菱形 */}
      <path d="M60 50 L70 60 L60 70 L50 60 Z" />
      {/* 四角小花瓣 */}
      <path d="M60 8 L63 14 L60 20 L57 14 Z" />
      <path d="M60 100 L63 106 L60 112 L57 106 Z" />
      <path d="M8 60 L14 63 L20 60 L14 57 Z" />
      <path d="M100 60 L106 63 L112 60 L106 57 Z" />
    </g>
  </svg>
);

/** 铁圈中心间距（px），按装订轨高度自适应个数 */
const WIRE_RING_PITCH = 32;
const WIRE_RING_MIN = 4;
const WIRE_RING_MAX = 28;
/** 装订轨约占相册高度的比例（扣掉上下 inset） */
const WIRE_TRACK_RATIO = 0.916;

const DEFAULT_LABELS = {
  previous: 'Previous photo',
  next: 'Next photo',
  empty: 'No photos',
  flyleafTitle: 'Photo Album',
  flyleafSubtitle: 'Turn the page to begin',
  flyleafEndTitle: 'The End',
  flyleafEndSubtitle: 'Thank you for browsing'
} as const;

/** 相册总高 → 铁圈数 */
const wireRingCountForHeight = (albumHeightPx: number) => {
  if (!Number.isFinite(albumHeightPx) || albumHeightPx <= 0) return 16;
  const track = albumHeightPx * WIRE_TRACK_RATIO;
  return Math.max(WIRE_RING_MIN, Math.min(WIRE_RING_MAX, Math.round(track / WIRE_RING_PITCH)));
};

/** 第 index 个孔/圈的 top%（与前后半圈、打孔共用，保证对齐） */
const ringSlotTop = (index: number, count: number) => `${((index + 0.55) / count) * 100}%`;

type PhotoContentProps = {
  photo?: PhotoAlbumItem;
  index: number;
  total: number;
  objectFit: React.CSSProperties['objectFit'];
  showPageNumber: boolean;
  pageColor: string;
  flyleafTitle: string;
  flyleafSubtitle: string;
  flyleafEndTitle: string;
  flyleafEndSubtitle: string;
};

const PhotoContent = ({
  photo,
  index,
  total,
  objectFit,
  showPageNumber,
  pageColor,
  flyleafTitle,
  flyleafSubtitle,
  flyleafEndTitle,
  flyleafEndSubtitle
}: PhotoContentProps) => {
  const isFrontFlyleaf = index < 0;
  const title = isFrontFlyleaf ? flyleafTitle : flyleafEndTitle;
  const subtitle = isFrontFlyleaf ? flyleafSubtitle : flyleafEndSubtitle;

  return (
    <div className={styles.pageContent} style={{ backgroundColor: pageColor }}>
      {photo ? (
        <>
          <div className={styles.photoMount}>
            <img src={photo.src} alt={photo.alt ?? photo.title ?? ''} draggable={false} style={{ objectFit }} />
          </div>
          {(photo.title || photo.description) && (
            <div className={styles.caption}>
              {photo.title && <strong>{photo.title}</strong>}
              {photo.description && <span>{photo.description}</span>}
            </div>
          )}
          {showPageNumber && <span className={styles.pageNumber}>{`${index + 1} / ${total}`}</span>}
        </>
      ) : (
        <div className={styles.flyleaf}>
          <span className={`${styles.flyleafCorner} ${styles.flyleafCornerTl}`} aria-hidden="true" />
          <span className={`${styles.flyleafCorner} ${styles.flyleafCornerTr}`} aria-hidden="true" />
          <span className={`${styles.flyleafCorner} ${styles.flyleafCornerBl}`} aria-hidden="true" />
          <span className={`${styles.flyleafCorner} ${styles.flyleafCornerBr}`} aria-hidden="true" />
          <div className={styles.flyleafInner}>
            <span className={styles.flyleafRule} aria-hidden="true" />
            <FlyleafMotif />
            <p className={styles.flyleafTitle}>{title}</p>
            <p className={styles.flyleafSubtitle}>{subtitle}</p>
            <span className={styles.flyleafRule} aria-hidden="true" />
          </div>
        </div>
      )}
    </div>
  );
};

const PunchHoles = ({ side, count }: { side: 'left' | 'right'; count: number }) => (
  <div className={`${styles.punchHoles} ${side === 'left' ? styles.punchLeft : styles.punchRight}`} aria-hidden="true">
    {Array.from({ length: count }, (_, index) => (
      <span key={index} className={styles.punchHole} style={{ top: ringSlotTop(index, count) }} />
    ))}
  </div>
);

const WireRings = ({ count, variant }: { count: number; variant: 'back' | 'front' }) => {
  const ringClass = variant === 'back' ? styles.wireRingBack : styles.wireRingFront;
  const wrapClass = variant === 'back' ? styles.wireBindingBack : styles.wireBindingFront;
  return (
    <div className={wrapClass} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <span key={index} className={ringClass} style={{ top: ringSlotTop(index, count) }} />
      ))}
    </div>
  );
};

const PhotoAlbum: React.FC<PhotoAlbumProps> = ({
  photos,
  width = 920,
  height = 560,
  initialIndex = 0,
  pageTurnDuration = 760,
  objectFit = 'cover',
  showPageNumber = true,
  pageColor = '#f2ead8',
  coverColor = '#4a3025',
  ariaLabel = 'Photo album',
  labels,
  onPageChange,
  onIndexChange,
  className,
  style
}) => {
  const [currentIndex, setCurrentIndex] = useState(() => clampRightIndex(initialIndex, photos.length));
  const [turn, setTurn] = useState<TurnState | null>(null);
  const [wireRingCount, setWireRingCount] = useState(() =>
    typeof height === 'number' ? wireRingCountForHeight(height) : 16
  );
  const safeCurrentIndex = clampRightIndex(currentIndex, photos.length);
  const duration = Math.max(180, pageTurnDuration);
  const copy = {
    previous: labels?.previous ?? DEFAULT_LABELS.previous,
    next: labels?.next ?? DEFAULT_LABELS.next,
    empty: labels?.empty ?? DEFAULT_LABELS.empty,
    flyleafTitle: labels?.flyleafTitle ?? DEFAULT_LABELS.flyleafTitle,
    flyleafSubtitle: labels?.flyleafSubtitle ?? DEFAULT_LABELS.flyleafSubtitle,
    flyleafEndTitle: labels?.flyleafEndTitle ?? DEFAULT_LABELS.flyleafEndTitle,
    flyleafEndSubtitle: labels?.flyleafEndSubtitle ?? DEFAULT_LABELS.flyleafEndSubtitle
  };

  const turnRef = useRef(turn);
  const finishingRef = useRef(false);
  const turnTokenRef = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const albumRef = useRef<HTMLDivElement>(null);
  const settleRafRef = useRef<number[]>([]);

  const clearSettleRafs = useCallback(() => {
    settleRafRef.current.forEach((id) => window.cancelAnimationFrame(id));
    settleRafRef.current = [];
  }, []);

  useEffect(() => {
    turnRef.current = turn;
  }, [turn]);

  useEffect(() => () => clearSettleRafs(), [clearSettleRafs]);

  // 按实际渲染高度增减铁圈，避免矮相册挤成一排、高相册又太空
  useEffect(() => {
    const el = albumRef.current;
    if (!el) return;

    const update = (heightPx: number) => {
      const next = wireRingCountForHeight(heightPx);
      setWireRingCount((prev) => (prev === next ? prev : next));
    };

    update(el.getBoundingClientRect().height);

    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      update(entry.contentRect.height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [height, width]);

  const startTurn = useCallback(
    (direction: TurnDirection) => {
      if (turnRef.current || finishingRef.current || photos.length < 2) return;
      const fromIndex = safeCurrentIndex;
      // 一叶两面：往后翻带走右页及其背面，索引 +2；往前翻同理 -2
      const targetIndex = direction === 'next' ? fromIndex + 2 : fromIndex - 2;
      if (direction === 'next' && fromIndex + 1 >= photos.length) return;
      if (direction === 'previous' && fromIndex <= 0) return;
      finishingRef.current = false;
      turnTokenRef.current += 1;
      clearSettleRafs();
      // 先只盖上翻页层，底层图保持不变，下一帧再开动画并露出目标页
      setTurn({ direction, fromIndex, targetIndex, phase: 'cover' });
    },
    [clearSettleRafs, photos.length, safeCurrentIndex]
  );

  useEffect(() => {
    if (!turn || turn.phase !== 'cover') return;
    const token = turnTokenRef.current;
    let cancelled = false;
    let outer = 0;
    let inner = 0;
    outer = window.requestAnimationFrame(() => {
      inner = window.requestAnimationFrame(() => {
        if (cancelled || token !== turnTokenRef.current) return;
        setTurn((prev) => (prev && prev.phase === 'cover' ? { ...prev, phase: 'run' } : prev));
      });
    });
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(outer);
      window.cancelAnimationFrame(inner);
    };
  }, [turn]);

  const completeTurn = useCallback(() => {
    const active = turnRef.current;
    if (!active || finishingRef.current || active.phase === 'settle') return;
    finishingRef.current = true;

    const nextIndex = clampRightIndex(active.targetIndex, photos.length);
    const token = turnTokenRef.current;

    const notifyPageChange = () => {
      if (token !== turnTokenRef.current) return;
      finishingRef.current = false;
      const focused = photos[nextIndex] ?? photos[nextIndex - 1];
      const focusedIndex = photos[nextIndex] ? nextIndex : nextIndex - 1;
      if (focused && focusedIndex >= 0) {
        onPageChange?.(focusedIndex, focused);
        onIndexChange?.(focusedIndex, focused);
      }
    };

    /*
     * 收尾三步（往前/后相同）：
     * 1) 去掉 translateZ，让翻页叶贴回与静态页同一平面（透视差是中缝「跳动」主因）
     * 2) 底层已是终态，再画一帧
     * 3) visibility:hidden 后卸层——不用 opacity 淡出（两层明暗不同，淡出只会拉长闪烁）
     */
    const sheet = sheetRef.current;
    const flatTransform =
      active.direction === 'next' ? 'translateZ(0) rotateY(-180deg)' : 'translateZ(0) rotateY(0deg)';
    if (sheet) {
      sheet.style.animation = 'none';
      sheet.style.transition = 'none';
      sheet.style.willChange = 'auto';
      sheet.style.transform = flatTransform;
      sheet.style.opacity = '1';
    }

    setCurrentIndex(nextIndex);
    setTurn({ ...active, phase: 'settle', underlaySynced: true });

    clearSettleRafs();
    const outer = window.requestAnimationFrame(() => {
      const mid = window.requestAnimationFrame(() => {
        if (token !== turnTokenRef.current) return;
        const el = sheetRef.current;
        if (el) {
          el.style.visibility = 'hidden';
        }
        const inner = window.requestAnimationFrame(() => {
          if (token !== turnTokenRef.current) return;
          setTurn(null);
          notifyPageChange();
        });
        settleRafRef.current.push(inner);
      });
      settleRafRef.current.push(mid);
    });
    settleRafRef.current.push(outer);
  }, [clearSettleRafs, onIndexChange, onPageChange, photos]);

  useEffect(() => {
    if (!turn || turn.phase !== 'run') return;
    const token = turnTokenRef.current;
    const timer = window.setTimeout(() => {
      if (token === turnTokenRef.current) completeTurn();
    }, duration + 120);
    return () => window.clearTimeout(timer);
  }, [completeTurn, duration, turn]);

  // 翻页过半：落点侧已被翻页叶盖住，提前同步底层到终态并完成绘制
  useEffect(() => {
    if (!turn || turn.phase !== 'run' || turn.underlaySynced) return;
    const token = turnTokenRef.current;
    const timer = window.setTimeout(
      () => {
        if (token !== turnTokenRef.current) return;
        setTurn((prev) =>
          prev && prev.phase === 'run' && !prev.underlaySynced ? { ...prev, underlaySynced: true } : prev
        );
      },
      Math.round(duration * 0.52)
    );
    return () => window.clearTimeout(timer);
  }, [duration, turn]);

  useEffect(() => {
    for (let offset = -2; offset <= 2; offset += 1) {
      warmPhoto(photos[safeCurrentIndex + offset]?.src);
    }
  }, [photos, safeCurrentIndex]);

  /**
   * cover：底层保持翻页前画面，翻页层盖住再开跑。
   * run：露出目标页；过半后 underlaySynced 提前切底层终态。
   * settle：翻页叶贴平后卸层。
   *
   * 摊开页：左 = rightIndex - 1，右 = rightIndex。
   * 翻动的一叶正反面是相邻两张照片（front / back），每次翻页 rightIndex ± 2。
   */
  const visiblePages = useMemo(() => {
    if (!turn) {
      return { left: safeCurrentIndex - 1, right: safeCurrentIndex };
    }
    const { fromIndex, targetIndex, direction, phase } = turn;
    if (phase === 'cover') {
      return { left: fromIndex - 1, right: fromIndex };
    }
    if (phase === 'settle') {
      return { left: targetIndex - 1, right: targetIndex };
    }
    if (direction === 'next') {
      // 右页翻起后露出再下一张；过半后左页也切到终态（已被翻页叶盖住）
      return {
        left: turn.underlaySynced ? targetIndex - 1 : fromIndex - 1,
        right: targetIndex
      };
    }
    // 左页翻回：左下露出更早一页；过半后右页切到终态
    return {
      left: targetIndex - 1,
      right: turn.underlaySynced ? targetIndex : fromIndex
    };
  }, [safeCurrentIndex, turn]);

  // 翻动叶：正面 = 当前右页（或翻回后的右页），背面 = 相邻下一张
  const turningFaces = useMemo(() => {
    if (!turn) {
      return { front: safeCurrentIndex, back: safeCurrentIndex + 1 };
    }
    if (turn.direction === 'next') {
      return { front: turn.fromIndex, back: turn.fromIndex + 1 };
    }
    return { front: turn.targetIndex, back: turn.targetIndex + 1 };
  }, [safeCurrentIndex, turn]);

  const rootStyle = {
    ...style,
    '--album-width': cssSize(width),
    '--album-height': cssSize(height),
    '--album-ratio': typeof width === 'number' && typeof height === 'number' ? width / height : 1.6429,
    '--turn-duration': `${duration}ms`,
    '--cover-color': coverColor
  } as React.CSSProperties;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'ArrowRight' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      startTurn('next');
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      startTurn('previous');
    }
  };

  const handleAnimationEnd = (event: React.AnimationEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    // 只认翻页位移动画，忽略纸面阴影等子动画冒泡
    const name = event.animationName || '';
    if (name && !/turnNext|turnPrevious/i.test(name)) return;
    completeTurn();
  };

  if (photos.length === 0) {
    return (
      <div
        className={`${styles.album} ${styles.empty} ${className ?? ''}`}
        style={rootStyle}
        role="region"
        aria-label={ariaLabel}
      >
        {copy.empty}
      </div>
    );
  }

  const pageContentProps = {
    total: photos.length,
    objectFit,
    showPageNumber,
    pageColor,
    flyleafTitle: copy.flyleafTitle,
    flyleafSubtitle: copy.flyleafSubtitle,
    flyleafEndTitle: copy.flyleafEndTitle,
    flyleafEndSubtitle: copy.flyleafEndSubtitle
  };

  const turningClass = (() => {
    if (!turn) return null;
    // settle：transform 已由 JS 写成 translateZ(0) 贴平，不再套 Ready（Ready 是抬升起点）
    if (turn.phase === 'settle') {
      return styles.turningPage;
    }
    if (turn.direction === 'next') {
      return `${styles.turningPage} ${turn.phase === 'cover' ? styles.turnNextReady : styles.turnNext}`;
    }
    return `${styles.turningPage} ${turn.phase === 'cover' ? styles.turnPreviousReady : styles.turnPrevious}`;
  })();

  return (
    <div
      ref={albumRef}
      className={`${styles.album} ${className ?? ''}`}
      style={rootStyle}
      role="region"
      aria-label={ariaLabel}
      aria-roledescription="photo album"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.bookShadow} aria-hidden="true" />
      <div className={styles.stage} aria-hidden="true">
        <div className={styles.cover}>
          <span className={styles.coverEdgeTop} />
          <span className={styles.coverEdgeSide} />
        </div>
        <div className={styles.pageStackLeft} />
        <div className={styles.pageStackRight} />
      </div>
      <WireRings count={wireRingCount} variant="back" />
      <div className={styles.book}>
        <div className={`${styles.staticPage} ${styles.leftPage}`}>
          <PunchHoles side="left" count={wireRingCount} />
          <div className={styles.gutterShade} aria-hidden="true" />
          <PhotoContent photo={photos[visiblePages.left]} index={visiblePages.left} {...pageContentProps} />
        </div>
        <div className={`${styles.staticPage} ${styles.rightPage}`}>
          <PunchHoles side="right" count={wireRingCount} />
          <div className={styles.gutterShade} aria-hidden="true" />
          <PhotoContent photo={photos[visiblePages.right]} index={visiblePages.right} {...pageContentProps} />
        </div>

        {turn && turningClass && (
          <div ref={sheetRef} className={turningClass} onAnimationEnd={handleAnimationEnd} aria-hidden="true">
            <div className={`${styles.face} ${styles.front}`}>
              <div className={styles.faceSheet} style={{ backgroundColor: pageColor }}>
                <PunchHoles side="right" count={wireRingCount} />
                <PhotoContent photo={photos[turningFaces.front]} index={turningFaces.front} {...pageContentProps} />
              </div>
            </div>
            <div className={`${styles.face} ${styles.back}`}>
              <div className={styles.faceSheet} style={{ backgroundColor: pageColor }}>
                <PunchHoles side="left" count={wireRingCount} />
                <PhotoContent photo={photos[turningFaces.back]} index={turningFaces.back} {...pageContentProps} />
              </div>
            </div>
          </div>
        )}
      </div>
      {/* 书脊谷影在 book 外，翻页全程压在纸面上，卸层时不会突然冒出来 */}
      <div className={styles.bookGutter} aria-hidden="true" />
      <WireRings count={wireRingCount} variant="front" />

      <button
        type="button"
        className={`${styles.hitArea} ${styles.previousArea}`}
        onClick={() => startTurn('previous')}
        disabled={safeCurrentIndex <= 0 || Boolean(turn)}
        aria-label={copy.previous}
      />
      <button
        type="button"
        className={`${styles.hitArea} ${styles.nextArea}`}
        onClick={() => startTurn('next')}
        disabled={safeCurrentIndex + 1 >= photos.length || Boolean(turn)}
        aria-label={copy.next}
      />
    </div>
  );
};

export type { PhotoAlbumItem, PhotoAlbumLabels, PhotoAlbumProps } from './types';
export default PhotoAlbum;
