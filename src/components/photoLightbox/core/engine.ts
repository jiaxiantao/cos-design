import { applyBlockHostBox, setHidden } from '@cos-design/shared';
import type { PhotoLightboxController, PhotoLightboxItem, PhotoLightboxOptions } from './types';

const P = 'cos-photo-lightbox';
const CLICK_SLOP_PX = 6;
const EXIT_MS = 260;
const SNAP_MS = 320;

const clampIndex = (index: number, length: number) => {
  if (length <= 0) return 0;
  return Math.max(0, Math.min(length - 1, Math.floor(index)));
};
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

type MotionPhase = 'idle' | 'dragging' | 'snapping' | 'exiting';

export function createPhotoLightbox(
  container: HTMLElement,
  initial: PhotoLightboxOptions = { photos: [] },
): PhotoLightboxController {
  let options: PhotoLightboxOptions = {
    width: 360,
    height: 480,
    slideWidth: 200,
    slideHeight: 280,
    pullThreshold: 100,
    showCaption: true,
    initialIndex: 0,
    ariaLabel: 'Photo lightbox',
    ...initial,
    photos: Array.isArray(initial.photos) ? initial.photos : [],
  };
  let destroyed = false;
  let index = clampIndex(options.initialIndex ?? 0, options.photos.length);
  let offsetX = 0;
  let phase: MotionPhase = 'idle';
  let drag: { pointerId: number; startX: number; moved: boolean } | null = null;
  let exitTimer: number | null = null;
  let snapTimer: number | null = null;

  const root = document.createElement('div');
  const stage = document.createElement('div');
  stage.className = `${P}__stage`;
  const table = document.createElement('div');
  table.className = `${P}__table`;
  const slot = document.createElement('div');
  slot.className = `${P}__slot`;
  const empty = document.createElement('div');
  empty.className = `${P}__empty`;
  empty.textContent = 'No photos';
  table.appendChild(slot);
  stage.append(empty, table);
  root.appendChild(stage);
  container.appendChild(root);

  const photosOf = () => (Array.isArray(options.photos) ? options.photos : []);
  const countOf = () => photosOf().length;

  const renderCaption = (photo: PhotoLightboxItem) => {
    if (!options.showCaption || (!photo.title && !photo.description)) return null;
    const cap = document.createElement('div');
    cap.className = `${P}__caption`;
    if (photo.title) {
      const t = document.createElement('div');
      t.className = `${P}__caption-title`;
      t.textContent = photo.title;
      cap.appendChild(t);
    }
    if (photo.description) {
      const d = document.createElement('div');
      d.className = `${P}__caption-desc`;
      d.textContent = photo.description;
      cap.appendChild(d);
    }
    return cap;
  };

  const makeSlide = (
    photo: PhotoLightboxItem,
    slideIndex: number,
    variant: 'active' | 'behind',
    transform: string,
  ) => {
    const slideWidth = options.slideWidth ?? 200;
    const slideHeight = options.slideHeight ?? 280;
    const captionHeight = options.showCaption && (photo.title || photo.description) ? 44 : 0;
    const imageHeight = slideHeight - captionHeight;
    const slide = document.createElement('div');
    const extra = variant === 'active' && phase === 'exiting' ? ` ${P}__slide-exiting` : '';
    slide.className = `${P}__slide ${variant === 'active' ? `${P}__slide-active` : `${P}__slide-behind`}${extra}`;
    slide.style.width = `${slideWidth}px`;
    slide.style.height = `${slideHeight}px`;
    slide.style.transform = transform;
    slide.style.transition =
      phase === 'snapping' || phase === 'exiting'
        ? `transform ${phase === 'exiting' ? EXIT_MS : SNAP_MS}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${EXIT_MS}ms ease`
        : 'none';
    if (variant === 'active' && phase === 'exiting') slide.style.opacity = '0.35';
    if (variant === 'active') {
      slide.setAttribute('role', 'button');
      slide.setAttribute(
        'aria-label',
        photo.alt || photo.title || `Slide ${slideIndex + 1} of ${countOf()}`,
      );
    }
    const wrap = document.createElement('div');
    wrap.className = `${P}__slide-image-wrap`;
    wrap.style.height = `${imageHeight}px`;
    const img = document.createElement('img');
    img.className = `${P}__slide-image`;
    img.src = photo.src;
    img.alt = photo.alt || photo.title || '';
    img.draggable = false;
    wrap.appendChild(img);
    slide.appendChild(wrap);
    const cap = renderCaption(photo);
    if (cap) slide.appendChild(cap);
    if (variant === 'active') {
      slide.addEventListener('pointerdown', onPointerDown);
      slide.addEventListener('pointermove', onPointerMove);
      slide.addEventListener('pointerup', onPointerUp);
      slide.addEventListener('pointercancel', onPointerCancel);
    }
    return slide;
  };

  const commitIndex = (nextIndex: number) => {
    const list = photosOf();
    const clamped = clampIndex(nextIndex, list.length);
    index = clamped;
    const photo = list[clamped];
    if (photo) options.onIndexChange?.(clamped, photo);
  };

  const finishExit = (targetIndex: number) => {
    commitIndex(targetIndex);
    offsetX = 0;
    phase = 'idle';
    paint();
  };

  const animateExit = (direction: 1 | -1) => {
    const delta = direction * ((options.slideWidth ?? 200) + 72);
    phase = 'exiting';
    offsetX = delta;
    paint();
    if (exitTimer != null) window.clearTimeout(exitTimer);
    exitTimer = window.setTimeout(() => {
      const target = clampIndex(index + direction, photosOf().length);
      finishExit(target);
    }, EXIT_MS);
  };

  const snapBack = () => {
    phase = 'snapping';
    offsetX = 0;
    paint();
    if (snapTimer != null) window.clearTimeout(snapTimer);
    snapTimer = window.setTimeout(() => {
      phase = 'idle';
      paint();
    }, SNAP_MS);
  };

  const goBy = (delta: number) => {
    const target = clampIndex(index + delta, photosOf().length);
    if (target === index) return;
    animateExit(delta > 0 ? 1 : -1);
  };

  const onPointerDown = (event: PointerEvent) => {
    if (phase === 'exiting' || countOf() === 0) return;
    drag = { pointerId: event.pointerId, startX: event.clientX, moved: false };
    phase = 'dragging';
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!drag || drag.pointerId !== event.pointerId || phase === 'exiting') return;
    const dx = event.clientX - drag.startX;
    if (Math.abs(dx) > CLICK_SLOP_PX) drag.moved = true;
    const canGoPrev = index > 0;
    const canGoNext = index < countOf() - 1;
    offsetX = (dx > 0 && !canGoNext) || (dx < 0 && !canGoPrev) ? dx * 0.28 : dx;
    paint();
  };

  const onPointerUp = (event: PointerEvent) => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const startX = drag.startX;
    const moved = drag.moved;
    const target = event.currentTarget as HTMLElement;
    drag = null;
    if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
    if (phase === 'exiting') return;
    const dx = event.clientX - startX;
    if (!moved) {
      phase = 'idle';
      offsetX = 0;
      paint();
      const photo = photosOf()[index];
      if (photo) options.onPhotoClick?.(index, photo);
      return;
    }
    const canGoPrev = index > 0;
    const canGoNext = index < countOf() - 1;
    if (Math.abs(dx) >= (options.pullThreshold ?? 100)) {
      const direction: 1 | -1 = dx > 0 ? 1 : -1;
      if ((direction > 0 && canGoNext) || (direction < 0 && canGoPrev)) {
        animateExit(direction);
        return;
      }
    }
    snapBack();
  };

  const onPointerCancel = (event: PointerEvent) => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const target = event.currentTarget as HTMLElement;
    drag = null;
    if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
    if (phase !== 'exiting') snapBack();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goBy(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goBy(-1);
    }
  };

  const paint = () => {
    const photos = photosOf();
    const count = photos.length;
    const slideWidth = options.slideWidth ?? 200;
    const slideHeight = options.slideHeight ?? 280;
    const width = options.width ?? 360;
    const height = options.height ?? 480;
    root.className = [P, options.className].filter(Boolean).join(' ');
    applyBlockHostBox(container, root, {
      width: width,
      height: height,
    });
    assignStyle(root, options.style);
    root.setAttribute('role', 'region');
    root.setAttribute('aria-label', options.ariaLabel ?? 'Photo lightbox');
    root.tabIndex = 0;
    setHidden(empty, count > 0);
    setHidden(table, count === 0);
    if (count === 0) {
      slot.replaceChildren();
      return;
    }
    const tablePadX = Math.max(24, (typeof width === 'number' ? width : slideWidth + 48) * 0.08);
    const tablePadY = Math.max(28, (typeof height === 'number' ? height : slideHeight + 56) * 0.1);
    table.style.width = `${slideWidth + tablePadX * 2}px`;
    table.style.height = `${slideHeight + tablePadY * 2}px`;
    slot.style.width = `${slideWidth}px`;
    slot.style.height = `${slideHeight}px`;
    const current = photos[index];
    const next = index < count - 1 ? photos[index + 1] : undefined;
    const activeTransform = `translate(-50%, -50%) translateX(${offsetX}px)`;
    const behindTransform = `translate(-50%, calc(-50% + 14px)) scale(0.94)`;
    slot.replaceChildren();
    if (next) slot.appendChild(makeSlide(next, index + 1, 'behind', behindTransform));
    if (current) slot.appendChild(makeSlide(current, index, 'active', activeTransform));
  };

  root.addEventListener('keydown', onKeyDown);
  paint();

  return {
    update(next) {
      options = {
        ...options,
        ...next,
        photos: Array.isArray(next.photos) ? next.photos : options.photos,
      };
      index = clampIndex(index, photosOf().length);
      paint();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (exitTimer != null) window.clearTimeout(exitTimer);
      if (snapTimer != null) window.clearTimeout(snapTimer);
      root.removeEventListener('keydown', onKeyDown);
      root.remove();
    },
  };
}
