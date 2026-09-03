import type { PhotoFilmstripController, PhotoFilmstripOptions } from './types';

const P = 'cos-photo-filmstrip';
const CLICK_SLOP = 6;
const REST_VELOCITY = 8;
const MAX_VELOCITY = 2600;
const SNAP_SPEED = 14;

const cssSize = (value: number | string) => (typeof value === 'number' ? `${value}px` : value);
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const formatFrameNumber = (index: number) => String(index + 1).padStart(2, '0');

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

interface DragState {
  pointerId: number;
  startX: number;
  startOffset: number;
  lastX: number;
  lastTime: number;
  vx: number;
  moved: number;
}

export function createPhotoFilmstrip(
  container: HTMLElement,
  initial: PhotoFilmstripOptions = { photos: [] },
): PhotoFilmstripController {
  let options: PhotoFilmstripOptions = {
    width: '100%',
    height: 280,
    frameWidth: 160,
    frameHeight: 120,
    frameGap: 14,
    showCaption: true,
    friction: 2.8,
    dragSensitivity: 1,
    initialIndex: 0,
    ariaLabel: 'Photo filmstrip',
    ...initial,
    photos: initial.photos ?? [],
  };
  let destroyed = false;
  let viewportWidth = 0;
  let activeIndex = options.initialIndex ?? 0;
  let ready = false;
  let requestedIndex = options.initialIndex ?? 0;
  let frameId: number | null = null;
  let lastTime = 0;

  const sim = {
    offset: 0,
    velocity: 0,
    drag: null as DragState | null,
    snapTarget: null as number | null,
  };

  const root = document.createElement('div');
  const topBand = document.createElement('div');
  topBand.className = `${P}__sprocket-band`;
  topBand.setAttribute('aria-hidden', 'true');
  const viewport = document.createElement('div');
  viewport.className = `${P}__viewport`;
  const strip = document.createElement('div');
  strip.className = `${P}__strip`;
  const empty = document.createElement('div');
  empty.className = `${P}__empty`;
  empty.textContent = 'No photos';
  const bottomBand = document.createElement('div');
  bottomBand.className = `${P}__sprocket-band ${P}__sprocket-band-bottom`;
  bottomBand.setAttribute('aria-hidden', 'true');
  viewport.append(strip, empty);
  root.append(topBand, viewport, bottomBand);
  container.appendChild(root);

  const photosOf = () => options.photos ?? [];
  const countOf = () => photosOf().length;
  const frameStep = () => (options.frameWidth ?? 160) + (options.frameGap ?? 14);
  const startPadding = () =>
    viewportWidth > 0 ? viewportWidth / 2 - (options.frameWidth ?? 160) / 2 : 0;
  const stripWidth = () => {
    const count = countOf();
    if (count <= 0) return 0;
    const fw = options.frameWidth ?? 160;
    const gap = options.frameGap ?? 14;
    return startPadding() * 2 + count * fw + Math.max(0, count - 1) * gap;
  };
  const offsetForIndex = (index: number) => {
    const count = countOf();
    if (viewportWidth <= 0 || count <= 0) return 0;
    const fw = options.frameWidth ?? 160;
    const safeIndex = clamp(Math.floor(index), 0, count - 1);
    const center = startPadding() + safeIndex * frameStep() + fw / 2;
    return viewportWidth / 2 - center;
  };
  const indexFromOffset = (offset: number) => {
    const count = countOf();
    if (count <= 0 || viewportWidth <= 0) return 0;
    const fw = options.frameWidth ?? 160;
    const raw = (viewportWidth / 2 - offset - startPadding() - fw / 2) / frameStep();
    return clamp(Math.round(raw), 0, count - 1);
  };
  const offsetBounds = () => {
    const count = countOf();
    if (count <= 0) return { min: 0, max: 0 };
    return { min: offsetForIndex(count - 1), max: offsetForIndex(0) };
  };

  const applyTransform = (offset: number) => {
    strip.style.transform = `translate3d(${offset}px, 0, 0)`;
  };

  const notifyIndex = (index: number) => {
    if (index === activeIndex) return;
    activeIndex = index;
    const photo = photosOf()[index];
    applyAria();
    if (photo) options.onIndexChange?.(index, photo);
  };

  const applyAria = () => {
    const photo = photosOf()[activeIndex];
    const captionAria =
      options.showCaption && photo?.title
        ? `，当前：${photo.title}${photo.description ? `，${photo.description}` : ''}`
        : '';
    root.setAttribute('aria-label', (options.ariaLabel ?? 'Photo filmstrip') + captionAria);
  };

  const stopLoop = () => {
    if (frameId !== null) {
      window.cancelAnimationFrame(frameId);
      frameId = null;
    }
    lastTime = 0;
  };

  const startLoop = () => {
    if (frameId !== null || destroyed) return;
    const tick = (time: number) => {
      frameId = null;
      const previous = lastTime || time;
      lastTime = time;
      const dt = Math.min(0.05, (time - previous) / 1000);
      const { min, max } = offsetBounds();
      let keepRunning = false;
      if (sim.drag) {
        applyTransform(sim.offset);
        keepRunning = true;
      } else if (sim.snapTarget !== null) {
        const delta = sim.snapTarget - sim.offset;
        if (Math.abs(delta) <= 0.35) {
          sim.offset = sim.snapTarget;
          sim.snapTarget = null;
          sim.velocity = 0;
          notifyIndex(indexFromOffset(sim.offset));
          applyTransform(sim.offset);
        } else {
          sim.offset += delta * Math.min(1, SNAP_SPEED * dt);
          sim.velocity = 0;
          applyTransform(sim.offset);
          keepRunning = true;
        }
      } else {
        let velocity = sim.velocity;
        if (Math.abs(velocity) > REST_VELOCITY) {
          velocity *= Math.exp(-(options.friction ?? 2.8) * dt);
          if (Math.abs(velocity) <= REST_VELOCITY) velocity = 0;
          sim.velocity = velocity;
          sim.offset += velocity * dt;
          if (sim.offset < min || sim.offset > max) {
            sim.offset = clamp(sim.offset, min, max);
            sim.velocity = 0;
          }
          applyTransform(sim.offset);
          keepRunning = true;
        } else {
          sim.velocity = 0;
          const target = offsetForIndex(indexFromOffset(sim.offset));
          if (Math.abs(sim.offset - target) > 0.35) {
            sim.snapTarget = target;
            keepRunning = true;
          } else {
            sim.offset = target;
            notifyIndex(indexFromOffset(sim.offset));
            applyTransform(sim.offset);
          }
        }
      }
      if (keepRunning && !destroyed) frameId = window.requestAnimationFrame(tick);
      else lastTime = 0;
    };
    frameId = window.requestAnimationFrame(tick);
  };

  const rebuildStrip = () => {
    const photos = photosOf();
    const count = photos.length;
    const fw = options.frameWidth ?? 160;
    const fh = options.frameHeight ?? 120;
    const gap = options.frameGap ?? 14;
    const hasCaption = Boolean(options.showCaption && photos.some((p) => p.title || p.description));
    strip.replaceChildren();
    photos.forEach((photo, index) => {
      const cell = document.createElement('div');
      cell.className = `${P}__frame-cell`;
      cell.style.width = `${fw}px`;
      cell.style.marginRight = index < count - 1 ? `${gap}px` : '0';
      cell.dataset.photoIndex = String(index);
      const num = document.createElement('span');
      num.className = `${P}__frame-number`;
      num.textContent = formatFrameNumber(index);
      const win = document.createElement('div');
      win.className = `${P}__frame-window`;
      win.style.width = `${fw}px`;
      win.style.height = `${fh}px`;
      const img = document.createElement('img');
      img.src = photo.src;
      img.alt = photo.alt ?? photo.title ?? '';
      img.draggable = false;
      win.appendChild(img);
      cell.append(num, win);
      if (hasCaption && (photo.title || photo.description)) {
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
        cell.appendChild(cap);
      }
      strip.appendChild(cell);
    });
    const pad = startPadding();
    strip.style.minWidth = `${stripWidth()}px`;
    strip.style.paddingLeft = `${pad}px`;
    strip.style.paddingRight = `${pad}px`;
    strip.style.boxSizing = 'border-box';
    empty.hidden = count > 0;
    strip.hidden = count === 0;
  };

  const applyRoot = () => {
    root.className = [P, options.className].filter(Boolean).join(' ');
    root.style.width = cssSize(options.width ?? '100%');
    root.style.height = cssSize(options.height ?? 280);
    assignStyle(root, options.style);
    root.setAttribute('role', 'region');
    root.tabIndex = countOf() > 0 ? 0 : -1;
    applyAria();
  };

  const settleLayout = () => {
    const count = countOf();
    if (viewportWidth <= 0 || count <= 0) return;
    if (!ready) {
      ready = true;
      requestedIndex = options.initialIndex ?? 0;
      sim.offset = offsetForIndex(requestedIndex);
      sim.velocity = 0;
      sim.snapTarget = null;
      sim.drag = null;
      activeIndex = clamp(requestedIndex, 0, count - 1);
      applyTransform(sim.offset);
      applyAria();
      return;
    }
    if (requestedIndex !== (options.initialIndex ?? 0)) {
      requestedIndex = options.initialIndex ?? 0;
      sim.velocity = 0;
      sim.drag = null;
      sim.snapTarget = offsetForIndex(requestedIndex);
      startLoop();
      return;
    }
    const { min, max } = offsetBounds();
    sim.offset = clamp(sim.offset, min, max);
    applyTransform(sim.offset);
  };

  const finishDrag = (event: PointerEvent) => {
    const drag = sim.drag;
    if (!drag || drag.pointerId !== event.pointerId) return;
    sim.drag = null;
    if (viewport.hasPointerCapture(event.pointerId))
      viewport.releasePointerCapture(event.pointerId);
    const dt = Math.max(0.008, (event.timeStamp - drag.lastTime) / 1000);
    const vx = (event.clientX - drag.lastX) / dt;
    sim.velocity = clamp(vx * (options.dragSensitivity ?? 1), -MAX_VELOCITY, MAX_VELOCITY);
    sim.snapTarget = null;
    if (drag.moved <= CLICK_SLOP) {
      sim.velocity = 0;
      const index = indexFromOffset(sim.offset);
      const photo = photosOf()[index];
      if (photo) options.onPhotoClick?.(index, photo);
      sim.snapTarget = offsetForIndex(index);
    }
    startLoop();
  };

  const onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    if (countOf() <= 0) return;
    sim.drag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startOffset: sim.offset,
      lastX: event.clientX,
      lastTime: event.timeStamp,
      vx: 0,
      moved: 0,
    };
    sim.velocity = 0;
    sim.snapTarget = null;
    viewport.setPointerCapture(event.pointerId);
    startLoop();
  };

  const onPointerMove = (event: PointerEvent) => {
    const drag = sim.drag;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    drag.moved = Math.max(drag.moved, Math.abs(dx));
    const elapsed = Math.max(event.timeStamp - drag.lastTime, 1) / 1000;
    drag.vx = 0.7 * ((event.clientX - drag.lastX) / elapsed) + 0.3 * drag.vx;
    drag.lastX = event.clientX;
    drag.lastTime = event.timeStamp;
    const { min, max } = offsetBounds();
    sim.offset = clamp(drag.startOffset + dx * (options.dragSensitivity ?? 1), min, max);
    applyTransform(sim.offset);
    startLoop();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (countOf() <= 0) return;
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const delta = event.key === 'ArrowLeft' ? frameStep() : -frameStep();
    const { min, max } = offsetBounds();
    const from = sim.snapTarget ?? sim.offset;
    sim.velocity = 0;
    sim.drag = null;
    sim.snapTarget = clamp(from + delta, min, max);
    startLoop();
  };

  const measure = (nextWidth: number) => {
    if (viewportWidth === nextWidth) return;
    viewportWidth = nextWidth;
    rebuildStrip();
    settleLayout();
  };

  viewport.addEventListener('pointerdown', onPointerDown);
  viewport.addEventListener('pointermove', onPointerMove);
  viewport.addEventListener('pointerup', finishDrag);
  viewport.addEventListener('pointercancel', finishDrag);
  root.addEventListener('keydown', onKeyDown);

  applyRoot();
  rebuildStrip();
  measure(viewport.clientWidth);
  const ro =
    typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver((entries) => {
          const entry = entries[0];
          if (entry) measure(Math.round(entry.contentRect.width));
        });
  ro?.observe(viewport);

  return {
    update(next) {
      const prevPhotos = options.photos;
      const prevIndex = options.initialIndex;
      options = { ...options, ...next, photos: next.photos ?? options.photos };
      applyRoot();
      if (next.photos && next.photos !== prevPhotos) {
        ready = false;
        rebuildStrip();
      } else if (
        next.frameWidth !== undefined ||
        next.frameHeight !== undefined ||
        next.frameGap !== undefined ||
        next.showCaption !== undefined
      ) {
        rebuildStrip();
      }
      if (next.initialIndex !== undefined && next.initialIndex !== prevIndex) {
        requestedIndex = -1;
      }
      settleLayout();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      stopLoop();
      ro?.disconnect();
      viewport.removeEventListener('pointerdown', onPointerDown);
      viewport.removeEventListener('pointermove', onPointerMove);
      viewport.removeEventListener('pointerup', finishDrag);
      viewport.removeEventListener('pointercancel', finishDrag);
      root.removeEventListener('keydown', onKeyDown);
      root.remove();
    },
  };
}
