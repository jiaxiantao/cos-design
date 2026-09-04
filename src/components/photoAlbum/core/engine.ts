import { applyBlockHostBox } from '@cos-design/shared';
import type { PhotoAlbumController, PhotoAlbumItem, PhotoAlbumOptions } from './types';

const P = 'cos-photo-album';
type TurnDirection = 'next' | 'previous';
type TurnPhase = 'cover' | 'run' | 'settle';

interface TurnState {
  direction: TurnDirection;
  fromIndex: number;
  targetIndex: number;
  phase: TurnPhase;
  underlaySynced?: boolean;
}

const warmedPhotos = new Set<string>();
const warmPhoto = (src?: string) => {
  if (!src || typeof Image === 'undefined' || warmedPhotos.has(src)) return;
  warmedPhotos.add(src);
  const image = new Image();
  image.src = src;
  image.decode?.().catch(() => {});
};

const cssSize = (value: number | string) => (typeof value === 'number' ? `${value}px` : value);
const clampRightIndex = (index: number, length: number) =>
  Math.max(0, Math.min(Math.floor(index), Math.max(0, length)));
const assignStyle = (el: HTMLElement, style?: Record<string, string | number | undefined>) => {
  if (!style) return;
  for (const [k, v] of Object.entries(style)) {
    if (v == null) continue;
    if (k.startsWith('--')) el.style.setProperty(k, String(v));
    else
      (el.style as unknown as Record<string, string>)[k] =
        typeof v === 'number' ? `${v}px` : String(v);
  }
};

const WIRE_RING_PITCH = 32;
const WIRE_RING_MIN = 4;
const WIRE_RING_MAX = 28;
const WIRE_TRACK_RATIO = 0.916;
const DEFAULT_LABELS = {
  previous: 'Previous photo',
  next: 'Next photo',
  empty: 'No photos',
  flyleafTitle: 'Photo Album',
  flyleafSubtitle: 'Turn the page to begin',
  flyleafEndTitle: 'The End',
  flyleafEndSubtitle: 'Thank you for browsing',
} as const;

const wireRingCountForHeight = (albumHeightPx: number) => {
  if (!Number.isFinite(albumHeightPx) || albumHeightPx <= 0) return 16;
  return Math.max(
    WIRE_RING_MIN,
    Math.min(WIRE_RING_MAX, Math.round((albumHeightPx * WIRE_TRACK_RATIO) / WIRE_RING_PITCH)),
  );
};
const ringSlotTop = (index: number, count: number) => `${((index + 0.55) / count) * 100}%`;

const FLYLEAF_SVG = `<svg class="${P}__flyleaf-motif" viewBox="0 0 120 120" aria-hidden="true">
  <g fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="60" cy="60" r="46" />
    <path d="M60 14 L106 60 L60 106 L14 60 Z" />
    <circle cx="60" cy="60" r="28" />
    <path d="M60 32 L88 60 L60 88 L32 60 Z" />
    <path d="M60 20 V40 M60 80 V100 M20 60 H40 M80 60 H100" />
    <path d="M34 34 L46 46 M86 34 L74 46 M34 86 L46 74 M86 86 L74 74" />
    <path d="M60 50 L70 60 L60 70 L50 60 Z" />
    <path d="M60 8 L63 14 L60 20 L57 14 Z" />
    <path d="M60 100 L63 106 L60 112 L57 106 Z" />
    <path d="M8 60 L14 63 L20 60 L14 57 Z" />
    <path d="M100 60 L106 63 L112 60 L106 57 Z" />
  </g>
</svg>`;

export function createPhotoAlbum(
  container: HTMLElement,
  initial: PhotoAlbumOptions = { photos: [] },
): PhotoAlbumController {
  let options: PhotoAlbumOptions = {
    width: 920,
    height: 560,
    initialIndex: 0,
    pageTurnDuration: 760,
    objectFit: 'cover',
    showPageNumber: true,
    pageColor: '#f2ead8',
    coverColor: '#4a3025',
    ariaLabel: 'Photo album',
    ...initial,
    photos: Array.isArray(initial.photos) ? initial.photos : [],
  };
  let destroyed = false;
  let currentIndex = clampRightIndex(options.initialIndex ?? 0, options.photos.length);
  let turn: TurnState | null = null;
  let wireRingCount =
    typeof options.height === 'number' ? wireRingCountForHeight(options.height) : 16;
  let finishing = false;
  let turnToken = 0;
  const settleRafs: number[] = [];
  let coverRafOuter = 0;
  let coverRafInner = 0;
  let runTimer = 0;
  let underlayTimer = 0;

  const root = document.createElement('div');
  const bookShadow = document.createElement('div');
  bookShadow.className = `${P}__book-shadow`;
  bookShadow.setAttribute('aria-hidden', 'true');
  const stage = document.createElement('div');
  stage.className = `${P}__stage`;
  stage.setAttribute('aria-hidden', 'true');
  const cover = document.createElement('div');
  cover.className = `${P}__cover`;
  const coverEdgeTop = document.createElement('span');
  coverEdgeTop.className = `${P}__cover-edge-top`;
  const coverEdgeSide = document.createElement('span');
  coverEdgeSide.className = `${P}__cover-edge-side`;
  cover.append(coverEdgeTop, coverEdgeSide);
  const pageStackLeft = document.createElement('div');
  pageStackLeft.className = `${P}__page-stack-left`;
  const pageStackRight = document.createElement('div');
  pageStackRight.className = `${P}__page-stack-right`;
  stage.append(cover, pageStackLeft, pageStackRight);
  const wireBack = document.createElement('div');
  const book = document.createElement('div');
  book.className = `${P}__book`;
  const leftPage = document.createElement('div');
  leftPage.className = `${P}__static-page ${P}__left-page`;
  const rightPage = document.createElement('div');
  rightPage.className = `${P}__static-page ${P}__right-page`;
  book.append(leftPage, rightPage);
  const bookGutter = document.createElement('div');
  bookGutter.className = `${P}__book-gutter`;
  bookGutter.setAttribute('aria-hidden', 'true');
  const wireFront = document.createElement('div');
  const prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.className = `${P}__hit-area ${P}__previous-area`;
  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = `${P}__hit-area ${P}__next-area`;
  const emptyEl = document.createElement('div');
  root.append(bookShadow, stage, wireBack, book, bookGutter, wireFront, prevBtn, nextBtn);
  container.appendChild(root);

  const photosOf = () => (Array.isArray(options.photos) ? options.photos : []);
  const copyOf = () => ({
    previous: options.labels?.previous ?? DEFAULT_LABELS.previous,
    next: options.labels?.next ?? DEFAULT_LABELS.next,
    empty: options.labels?.empty ?? DEFAULT_LABELS.empty,
    flyleafTitle: options.labels?.flyleafTitle ?? DEFAULT_LABELS.flyleafTitle,
    flyleafSubtitle: options.labels?.flyleafSubtitle ?? DEFAULT_LABELS.flyleafSubtitle,
    flyleafEndTitle: options.labels?.flyleafEndTitle ?? DEFAULT_LABELS.flyleafEndTitle,
    flyleafEndSubtitle: options.labels?.flyleafEndSubtitle ?? DEFAULT_LABELS.flyleafEndSubtitle,
  });
  const durationOf = () => Math.max(180, options.pageTurnDuration ?? 760);
  const safeIndex = () => clampRightIndex(currentIndex, photosOf().length);

  const clearSettleRafs = () => {
    settleRafs.forEach((id) => window.cancelAnimationFrame(id));
    settleRafs.length = 0;
  };

  const makePunchHoles = (side: 'left' | 'right', count: number) => {
    const wrap = document.createElement('div');
    wrap.className = `${P}__punch-holes ${side === 'left' ? `${P}__punch-left` : `${P}__punch-right`}`;
    wrap.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < count; i++) {
      const hole = document.createElement('span');
      hole.className = `${P}__punch-hole`;
      hole.style.top = ringSlotTop(i, count);
      wrap.appendChild(hole);
    }
    return wrap;
  };

  const fillWireRings = (el: HTMLElement, variant: 'back' | 'front', count: number) => {
    el.className = variant === 'back' ? `${P}__wire-binding-back` : `${P}__wire-binding-front`;
    el.setAttribute('aria-hidden', 'true');
    el.replaceChildren();
    const ringClass = variant === 'back' ? `${P}__wire-ring-back` : `${P}__wire-ring-front`;
    for (let i = 0; i < count; i++) {
      const ring = document.createElement('span');
      ring.className = ringClass;
      ring.style.top = ringSlotTop(i, count);
      el.appendChild(ring);
    }
  };

  const fillPageContent = (host: HTMLElement, photo: PhotoAlbumItem | undefined, index: number) => {
    const copy = copyOf();
    const total = photosOf().length;
    host.replaceChildren();
    host.className = `${P}__page-content`;
    host.style.backgroundColor = options.pageColor ?? '#f2ead8';
    if (photo) {
      const mount = document.createElement('div');
      mount.className = `${P}__photo-mount`;
      const img = document.createElement('img');
      img.src = photo.src;
      img.alt = photo.alt ?? photo.title ?? '';
      img.draggable = false;
      img.style.objectFit = options.objectFit ?? 'cover';
      mount.appendChild(img);
      host.appendChild(mount);
      if (photo.title || photo.description) {
        const cap = document.createElement('div');
        cap.className = `${P}__caption`;
        if (photo.title) {
          const strong = document.createElement('strong');
          strong.textContent = photo.title;
          cap.appendChild(strong);
        }
        if (photo.description) {
          const span = document.createElement('span');
          span.textContent = photo.description;
          cap.appendChild(span);
        }
        host.appendChild(cap);
      }
      if (options.showPageNumber !== false) {
        const num = document.createElement('span');
        num.className = `${P}__page-number`;
        num.textContent = `${index + 1} / ${total}`;
        host.appendChild(num);
      }
      return;
    }
    const isFrontFlyleaf = index < 0;
    const flyleaf = document.createElement('div');
    flyleaf.className = `${P}__flyleaf`;
    for (const cls of [
      `${P}__flyleaf-corner ${P}__flyleaf-corner-tl`,
      `${P}__flyleaf-corner ${P}__flyleaf-corner-tr`,
      `${P}__flyleaf-corner ${P}__flyleaf-corner-bl`,
      `${P}__flyleaf-corner ${P}__flyleaf-corner-br`,
    ]) {
      const c = document.createElement('span');
      c.className = cls;
      c.setAttribute('aria-hidden', 'true');
      flyleaf.appendChild(c);
    }
    const inner = document.createElement('div');
    inner.className = `${P}__flyleaf-inner`;
    const rule1 = document.createElement('span');
    rule1.className = `${P}__flyleaf-rule`;
    rule1.setAttribute('aria-hidden', 'true');
    const motif = document.createElement('div');
    motif.innerHTML = FLYLEAF_SVG;
    const title = document.createElement('p');
    title.className = `${P}__flyleaf-title`;
    title.textContent = isFrontFlyleaf ? copy.flyleafTitle : copy.flyleafEndTitle;
    const subtitle = document.createElement('p');
    subtitle.className = `${P}__flyleaf-subtitle`;
    subtitle.textContent = isFrontFlyleaf ? copy.flyleafSubtitle : copy.flyleafEndSubtitle;
    const rule2 = document.createElement('span');
    rule2.className = `${P}__flyleaf-rule`;
    rule2.setAttribute('aria-hidden', 'true');
    inner.append(rule1, motif.firstElementChild as Element, title, subtitle, rule2);
    flyleaf.appendChild(inner);
    host.appendChild(flyleaf);
  };

  const fillStaticPage = (page: HTMLElement, side: 'left' | 'right', photoIndex: number) => {
    page.replaceChildren();
    page.appendChild(makePunchHoles(side, wireRingCount));
    const shade = document.createElement('div');
    shade.className = `${P}__gutter-shade`;
    shade.setAttribute('aria-hidden', 'true');
    page.appendChild(shade);
    const content = document.createElement('div');
    fillPageContent(content, photosOf()[photoIndex], photoIndex);
    page.appendChild(content);
  };

  const visiblePages = () => {
    const from = safeIndex();
    if (!turn) return { left: from - 1, right: from };
    const { fromIndex, targetIndex, direction, phase } = turn;
    if (phase === 'cover') return { left: fromIndex - 1, right: fromIndex };
    if (phase === 'settle') return { left: targetIndex - 1, right: targetIndex };
    if (direction === 'next') {
      return { left: turn.underlaySynced ? targetIndex - 1 : fromIndex - 1, right: targetIndex };
    }
    return { left: targetIndex - 1, right: turn.underlaySynced ? targetIndex : fromIndex };
  };

  const turningFaces = () => {
    const from = safeIndex();
    if (!turn) return { front: from, back: from + 1 };
    if (turn.direction === 'next') return { front: turn.fromIndex, back: turn.fromIndex + 1 };
    return { front: turn.targetIndex, back: turn.targetIndex + 1 };
  };

  const turningClass = () => {
    if (!turn) return null;
    if (turn.phase === 'settle') return `${P}__turning-page`;
    if (turn.direction === 'next') {
      return `${P}__turning-page ${turn.phase === 'cover' ? `${P}__turn-next-ready` : `${P}__turn-next`}`;
    }
    return `${P}__turning-page ${turn.phase === 'cover' ? `${P}__turn-previous-ready` : `${P}__turn-previous`}`;
  };

  let sheet: HTMLDivElement | null = null;

  const completeTurn = () => {
    const active = turn;
    if (!active || finishing || active.phase === 'settle') return;
    finishing = true;
    const nextIndex = clampRightIndex(active.targetIndex, photosOf().length);
    const token = turnToken;
    const notifyPageChange = () => {
      if (token !== turnToken) return;
      finishing = false;
      const photos = photosOf();
      const focused = photos[nextIndex] ?? photos[nextIndex - 1];
      const focusedIndex = photos[nextIndex] ? nextIndex : nextIndex - 1;
      if (focused && focusedIndex >= 0) {
        options.onPageChange?.(focusedIndex, focused);
        options.onIndexChange?.(focusedIndex, focused);
      }
    };
    const flatTransform =
      active.direction === 'next'
        ? 'translateZ(0) rotateY(-180deg)'
        : 'translateZ(0) rotateY(0deg)';
    if (sheet) {
      sheet.style.animation = 'none';
      sheet.style.transition = 'none';
      sheet.style.willChange = 'auto';
      sheet.style.transform = flatTransform;
      sheet.style.opacity = '1';
    }
    currentIndex = nextIndex;
    turn = { ...active, phase: 'settle', underlaySynced: true };
    clearSettleRafs();
    const outer = window.requestAnimationFrame(() => {
      const mid = window.requestAnimationFrame(() => {
        if (token !== turnToken) return;
        if (sheet) sheet.style.visibility = 'hidden';
        const inner = window.requestAnimationFrame(() => {
          if (token !== turnToken) return;
          turn = null;
          sheet = null;
          paint();
          notifyPageChange();
        });
        settleRafs.push(inner);
      });
      settleRafs.push(mid);
    });
    settleRafs.push(outer);
    paint();
  };

  const onSheetAnimationEnd = (event: AnimationEvent) => {
    if (event.target !== event.currentTarget) return;
    const name = event.animationName || '';
    if (name && !/turnNext|turnPrevious/i.test(name)) return;
    completeTurn();
  };

  const paintTurningSheet = () => {
    const existing = book.querySelector(`.${P}__turning-page`);
    const cls = turningClass();
    if (!turn || !cls) {
      existing?.remove();
      sheet = null;
      return;
    }
    if (!sheet) {
      sheet = document.createElement('div');
      sheet.setAttribute('aria-hidden', 'true');
      sheet.addEventListener('animationend', onSheetAnimationEnd);
      book.appendChild(sheet);
    }
    sheet.className = cls;
    const faces = turningFaces();
    sheet.replaceChildren();
    const front = document.createElement('div');
    front.className = `${P}__face ${P}__front`;
    const frontSheet = document.createElement('div');
    frontSheet.className = `${P}__face-sheet`;
    frontSheet.style.backgroundColor = options.pageColor ?? '#f2ead8';
    frontSheet.appendChild(makePunchHoles('right', wireRingCount));
    const frontContent = document.createElement('div');
    fillPageContent(frontContent, photosOf()[faces.front], faces.front);
    frontSheet.appendChild(frontContent);
    front.appendChild(frontSheet);
    const back = document.createElement('div');
    back.className = `${P}__face ${P}__back`;
    const backSheet = document.createElement('div');
    backSheet.className = `${P}__face-sheet`;
    backSheet.style.backgroundColor = options.pageColor ?? '#f2ead8';
    backSheet.appendChild(makePunchHoles('left', wireRingCount));
    const backContent = document.createElement('div');
    fillPageContent(backContent, photosOf()[faces.back], faces.back);
    backSheet.appendChild(backContent);
    back.appendChild(backSheet);
    sheet.append(front, back);
  };

  const startTurn = (direction: TurnDirection) => {
    if (turn || finishing || photosOf().length < 2) return;
    const fromIndex = safeIndex();
    const targetIndex = direction === 'next' ? fromIndex + 2 : fromIndex - 2;
    if (direction === 'next' && fromIndex + 1 >= photosOf().length) return;
    if (direction === 'previous' && fromIndex <= 0) return;
    finishing = false;
    turnToken += 1;
    clearSettleRafs();
    turn = { direction, fromIndex, targetIndex, phase: 'cover' };
    paint();
    const token = turnToken;
    window.cancelAnimationFrame(coverRafOuter);
    window.cancelAnimationFrame(coverRafInner);
    coverRafOuter = window.requestAnimationFrame(() => {
      coverRafInner = window.requestAnimationFrame(() => {
        if (destroyed || token !== turnToken || !turn || turn.phase !== 'cover') return;
        turn = { ...turn, phase: 'run' };
        paint();
        window.clearTimeout(runTimer);
        runTimer = window.setTimeout(() => {
          if (token === turnToken) completeTurn();
        }, durationOf() + 120);
        window.clearTimeout(underlayTimer);
        underlayTimer = window.setTimeout(
          () => {
            if (token !== turnToken || !turn || turn.phase !== 'run' || turn.underlaySynced) return;
            turn = { ...turn, underlaySynced: true };
            paint();
          },
          Math.round(durationOf() * 0.52),
        );
      });
    });
  };

  const paint = () => {
    const photos = photosOf();
    const copy = copyOf();
    const width = options.width ?? 920;
    const height = options.height ?? 560;
    applyBlockHostBox(container, root, {
      width: typeof width === 'number' || typeof width === 'string' ? width : '100%',
      rootFillsHost: false,
    });
    root.style.setProperty('--album-width', cssSize(width));
    root.style.setProperty('--album-height', cssSize(height));
    root.style.setProperty(
      '--album-ratio',
      typeof width === 'number' && typeof height === 'number' ? String(width / height) : '1.6429',
    );
    root.style.setProperty('--turn-duration', `${durationOf()}ms`);
    root.style.setProperty('--cover-color', options.coverColor ?? '#4a3025');
    assignStyle(root, options.style);
    root.setAttribute('aria-label', options.ariaLabel ?? 'Photo album');

    if (photos.length === 0) {
      root.className = [P, `${P}__empty`, options.className].filter(Boolean).join(' ');
      root.setAttribute('role', 'region');
      root.tabIndex = -1;
      book.hidden = true;
      prevBtn.hidden = true;
      nextBtn.hidden = true;
      emptyEl.className = '';
      emptyEl.textContent = copy.empty;
      if (!emptyEl.isConnected) root.appendChild(emptyEl);
      return;
    }
    emptyEl.remove();
    book.hidden = false;
    prevBtn.hidden = false;
    nextBtn.hidden = false;
    root.className = [P, options.className].filter(Boolean).join(' ');
    root.setAttribute('role', 'region');
    root.setAttribute('aria-roledescription', 'photo album');
    root.tabIndex = 0;
    fillWireRings(wireBack, 'back', wireRingCount);
    fillWireRings(wireFront, 'front', wireRingCount);
    const pages = visiblePages();
    fillStaticPage(leftPage, 'left', pages.left);
    fillStaticPage(rightPage, 'right', pages.right);
    paintTurningSheet();
    const from = safeIndex();
    prevBtn.disabled = from <= 0 || Boolean(turn);
    prevBtn.setAttribute('aria-label', copy.previous);
    nextBtn.disabled = from + 1 >= photos.length || Boolean(turn);
    nextBtn.setAttribute('aria-label', copy.next);
    for (let offset = -2; offset <= 2; offset += 1) warmPhoto(photos[from + offset]?.src);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.target !== root) return;
    if (event.key === 'ArrowRight' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      startTurn('next');
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      startTurn('previous');
    }
  };

  prevBtn.addEventListener('click', () => startTurn('previous'));
  nextBtn.addEventListener('click', () => startTurn('next'));
  root.addEventListener('keydown', onKeyDown);

  paint();
  const updateRings = (heightPx: number) => {
    const next = wireRingCountForHeight(heightPx);
    if (next !== wireRingCount) {
      wireRingCount = next;
      paint();
    }
  };
  updateRings(root.getBoundingClientRect().height);
  const ro =
    typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver((entries) => {
          const entry = entries[0];
          if (entry) updateRings(entry.contentRect.height);
        });
  ro?.observe(root);

  return {
    update(next) {
      const nextPhotos = Array.isArray(next.photos) ? next.photos : options.photos;
      options = { ...options, ...next, photos: nextPhotos };
      currentIndex = clampRightIndex(currentIndex, photosOf().length);
      paint();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      clearSettleRafs();
      window.cancelAnimationFrame(coverRafOuter);
      window.cancelAnimationFrame(coverRafInner);
      window.clearTimeout(runTimer);
      window.clearTimeout(underlayTimer);
      ro?.disconnect();
      sheet?.removeEventListener('animationend', onSheetAnimationEnd);
      prevBtn.removeEventListener('click', () => startTurn('previous'));
      nextBtn.removeEventListener('click', () => startTurn('next'));
      root.removeEventListener('keydown', onKeyDown);
      root.remove();
    },
  };
}
