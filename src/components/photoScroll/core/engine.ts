import { bindVisibilityPause } from '@cos-design/shared';
import type { PhotoScrollController, PhotoScrollOptions } from './types';

const P = 'cos-photo-scroll';
const CLICK_SLOP = 6;
const VELOCITY_TAU = 0.045;
const IDLE_KILL_MS = 90;
const REST_VELOCITY = 8;
const MAX_VELOCITY = 2600;
const SNAP_SPEED = 14;

const cssSize = (value: number | string) => (typeof value === 'number' ? `${value}px` : value);
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
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
  lastMoveTime: number;
  vx: number;
  moved: number;
}

export function createPhotoScroll(
  container: HTMLElement,
  initial: PhotoScrollOptions = { photos: [] },
): PhotoScrollController {
  let options: PhotoScrollOptions = {
    width: 520,
    height: 280,
    frameWidth: 160,
    frameHeight: 200,
    frameGap: 20,
    dragSensitivity: 1,
    friction: 1.5,
    showCaption: true,
    initialIndex: 0,
    ariaLabel: '卷轴照片',
    ...initial,
    photos: initial.photos ?? [],
  };
  let destroyed = false;
  let viewportWidth = 0;
  let activeIndex = options.initialIndex ?? 0;
  let ready = false;
  let requestedIndex = options.initialIndex ?? 0;
  let paused = false;
  let frameId: number | null = null;
  let lastTime = 0;
  const sim = {
    offset: 0,
    velocity: 0,
    drag: null as DragState | null,
    snapTarget: null as number | null,
  };

  const root = document.createElement('div');
  const rollerLeft = document.createElement('div');
  rollerLeft.className = `${P}__roller ${P}__roller-left`;
  rollerLeft.setAttribute('aria-hidden', 'true');
  const rollerRight = document.createElement('div');
  rollerRight.className = `${P}__roller ${P}__roller-right`;
  rollerRight.setAttribute('aria-hidden', 'true');
  const center = document.createElement('div');
  center.className = `${P}__center`;
  const viewport = document.createElement('div');
  viewport.className = `${P}__paper-viewport`;
  const paper = document.createElement('div');
  paper.className = `${P}__paper`;
  const surface = document.createElement('div');
  surface.className = `${P}__paper-surface`;
  const empty = document.createElement('div');
  empty.className = `${P}__empty`;
  empty.textContent = '暂无照片';
  paper.appendChild(surface);
  viewport.appendChild(paper);
  center.append(empty, viewport);
  root.append(rollerLeft, center, rollerRight);
  container.appendChild(root);

  const photosOf = () => options.photos ?? [];
  const countOf = () => photosOf().length;
  const frameStep = () => (options.frameWidth ?? 160) + (options.frameGap ?? 20);
  const startPadding = () =>
    viewportWidth > 0 ? viewportWidth / 2 - (options.frameWidth ?? 160) / 2 : 0;
  const paperWidth = () => {
    const count = countOf();
    if (count <= 0) return 0;
    const fw = options.frameWidth ?? 160;
    const gap = options.frameGap ?? 20;
    return startPadding() * 2 + count * fw + Math.max(0, count - 1) * gap;
  };
  const offsetForIndex = (index: number) => {
    const count = countOf();
    if (viewportWidth <= 0 || count <= 0) return 0;
    const fw = options.frameWidth ?? 160;
    const safeIndex = clamp(Math.floor(index), 0, count - 1);
    return viewportWidth / 2 - (startPadding() + safeIndex * frameStep() + fw / 2);
  };
  const indexFromOffset = (offset: number) => {
    const count = countOf();
    if (count <= 0 || viewportWidth <= 0) return 0;
    const fw = options.frameWidth ?? 160;
    return clamp(
      Math.round((viewportWidth / 2 - offset - startPadding() - fw / 2) / frameStep()),
      0,
      count - 1,
    );
  };
  const offsetBounds = () => {
    const count = countOf();
    if (count <= 0) return { min: 0, max: 0 };
    return { min: offsetForIndex(count - 1), max: offsetForIndex(0) };
  };

  const applyTransform = (offset: number) => {
    paper.style.transform = `translate3d(${offset}px, 0, 0)`;
  };

  const notifyIndex = (index: number) => {
    if (index === activeIndex) return;
    activeIndex = index;
    paintActive();
    applyAria();
    const photo = photosOf()[index];
    if (photo) options.onIndexChange?.(index, photo);
  };

  const paintActive = () => {
    surface.querySelectorAll(`.${P}__frame-cell`).forEach((cell, i) => {
      (cell as HTMLElement).dataset.active = i === activeIndex ? 'true' : 'false';
    });
  };

  const applyAria = () => {
    const photo = photosOf()[activeIndex];
    const captionAria =
      options.showCaption && photo?.title
        ? `，当前：${photo.title}${photo.description ? `，${photo.description}` : ''}`
        : '';
    root.setAttribute('aria-label', (options.ariaLabel ?? '卷轴照片') + captionAria);
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
      if (paused) return;
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
      } else if (Math.abs(sim.velocity) > REST_VELOCITY) {
        sim.velocity *= Math.exp(-(options.friction ?? 1.5) * dt);
        if (Math.abs(sim.velocity) <= REST_VELOCITY) sim.velocity = 0;
        sim.offset += sim.velocity * dt;
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
      if (keepRunning && !destroyed) frameId = window.requestAnimationFrame(tick);
      else lastTime = 0;
    };
    frameId = window.requestAnimationFrame(tick);
  };

  const rebuildFrames = () => {
    const photos = photosOf();
    const count = photos.length;
    const fw = options.frameWidth ?? 160;
    const fh = options.frameHeight ?? 200;
    const gap = options.frameGap ?? 20;
    surface.replaceChildren();
    photos.forEach((photo, index) => {
      const cell = document.createElement('div');
      cell.className = `${P}__frame-cell`;
      cell.style.width = `${fw}px`;
      cell.style.marginRight = index < count - 1 ? `${gap}px` : '0';
      cell.dataset.active = index === activeIndex ? 'true' : 'false';
      cell.dataset.photoIndex = String(index);
      const frame = document.createElement('div');
      frame.className = `${P}__frame`;
      frame.style.width = `${fw}px`;
      frame.style.height = `${fh}px`;
      const img = document.createElement('img');
      img.src = photo.src;
      img.alt = photo.alt ?? photo.title ?? `Photo ${index + 1}`;
      img.draggable = false;
      frame.appendChild(img);
      if (options.showCaption && (photo.title || photo.description)) {
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
        frame.appendChild(cap);
      }
      cell.appendChild(frame);
      surface.appendChild(cell);
    });
    const pw = paperWidth();
    const pad = startPadding();
    paper.style.minWidth = `${pw}px`;
    paper.style.boxSizing = 'border-box';
    surface.style.paddingLeft = `${pad}px`;
    surface.style.paddingRight = `${pad}px`;
    surface.style.minWidth = `${pw}px`;
  };

  const applyRoot = () => {
    const count = countOf();
    root.className = [P, options.className].filter(Boolean).join(' ');
    root.style.width = cssSize(options.width ?? 520);
    root.style.height = cssSize(options.height ?? 280);
    assignStyle(root, options.style);
    empty.hidden = count > 0;
    viewport.hidden = count === 0;
    if (count === 0) {
      root.setAttribute('role', 'img');
      root.tabIndex = -1;
      root.setAttribute('aria-label', options.ariaLabel ?? '卷轴照片');
    } else {
      root.setAttribute('role', 'region');
      root.tabIndex = 0;
      applyAria();
    }
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
      paintActive();
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
    const idleMs = event.timeStamp - drag.lastMoveTime;
    sim.velocity =
      idleMs > IDLE_KILL_MS
        ? 0
        : clamp(drag.vx * (options.dragSensitivity ?? 1), -MAX_VELOCITY, MAX_VELOCITY);
    sim.snapTarget = null;
    if (drag.moved <= CLICK_SLOP) {
      sim.velocity = 0;
      const i = indexFromOffset(sim.offset);
      const photo = photosOf()[i];
      if (photo) options.onPhotoClick?.(i, photo);
      sim.snapTarget = offsetForIndex(i);
    }
    startLoop();
  };

  const onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    if (countOf() <= 0) return;
    const now = event.timeStamp;
    sim.drag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startOffset: sim.offset,
      lastX: event.clientX,
      lastTime: now,
      lastMoveTime: now,
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
    drag.lastMoveTime = event.timeStamp;
    const dt = Math.max(event.timeStamp - drag.lastTime, 1) / 1000;
    const instantVx = (event.clientX - drag.lastX) / dt;
    const alpha = 1 - Math.exp(-dt / VELOCITY_TAU);
    drag.vx = alpha * instantVx + (1 - alpha) * drag.vx;
    drag.lastX = event.clientX;
    drag.lastTime = event.timeStamp;
    const { min, max } = offsetBounds();
    sim.offset = clamp(drag.startOffset + dx * (options.dragSensitivity ?? 1), min, max);
    applyTransform(sim.offset);
    notifyIndex(indexFromOffset(sim.offset));
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

  viewport.addEventListener('pointerdown', onPointerDown);
  viewport.addEventListener('pointermove', onPointerMove);
  viewport.addEventListener('pointerup', finishDrag);
  viewport.addEventListener('pointercancel', finishDrag);
  root.addEventListener('keydown', onKeyDown);
  const unbindVisibility = bindVisibilityPause((hidden) => {
    paused = hidden;
    if (!hidden) startLoop();
  });

  applyRoot();
  rebuildFrames();
  const measure = (w: number) => {
    if (viewportWidth === w) return;
    viewportWidth = w;
    rebuildFrames();
    settleLayout();
  };
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
      if (
        (next.photos && next.photos !== prevPhotos) ||
        next.frameWidth !== undefined ||
        next.frameHeight !== undefined ||
        next.frameGap !== undefined ||
        next.showCaption !== undefined
      ) {
        if (next.photos && next.photos !== prevPhotos) ready = false;
        rebuildFrames();
      }
      if (next.initialIndex !== undefined && next.initialIndex !== prevIndex) requestedIndex = -1;
      settleLayout();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      stopLoop();
      unbindVisibility();
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
