import { applyBlockHostBox, setHidden } from '@cos-design/shared';
import type { PhotoFridgeController, PhotoFridgeOptions } from './types';

const P = 'cos-photo-fridge';
const CLICK_SLOP_PX = 6;
const MAX_VELOCITY = 1200;
const MIN_VELOCITY = 0.08;
const DRAG_LIFT = 1.05;
const DOOR_PADDING = 10;
const HANDLE_RESERVE = 32;
const CAPTION_RATIO = 0.24;
const MAGNET_COLORS = ['magnet-red', 'magnet-blue', 'magnet-green', 'magnet-yellow'] as const;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const pseudoRandom = (seed: number) => {
  const value = Math.sin(seed * 127.1 + 31.7) * 43758.5453;
  return value - Math.floor(value);
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
  scatter: number,
) => {
  if (count <= 0 || viewportW <= 0 || viewportH <= 0) return [];
  const maxX = Math.max(DOOR_PADDING, viewportW - cardW - DOOR_PADDING - HANDLE_RESERVE);
  const maxY = Math.max(DOOR_PADDING, viewportH - cardH - DOOR_PADDING);
  const spreadX = Math.max(0, maxX - DOOR_PADDING) * 0.55 * scatter;
  const spreadY = Math.max(0, maxY - DOOR_PADDING) * 0.5 * scatter;
  const centerX = DOOR_PADDING + (maxX - DOOR_PADDING) * 0.5 - cardW * 0.5;
  const centerY = DOOR_PADDING + (maxY - DOOR_PADDING) * 0.5 - cardH * 0.5;
  return Array.from({ length: count }, (_, index) => {
    const t = count <= 1 ? 0.5 : index / (count - 1);
    return {
      x: clamp(
        centerX +
          (t - 0.5) * spreadX * 1.4 +
          (pseudoRandom(index * 7.13 + 2.1) * 2 - 1) * spreadX * 0.45,
        DOOR_PADDING,
        maxX,
      ),
      y: clamp(
        centerY +
          Math.sin(t * Math.PI * 1.2) * spreadY * 0.35 +
          (pseudoRandom(index * 11.37 + 5.9) * 2 - 1) * spreadY * 0.42,
        DOOR_PADDING,
        maxY,
      ),
      rot: (pseudoRandom(index * 3.71 + 1.4) * 2 - 1) * 12 * scatter,
    };
  });
};

const clampMotion = (
  motion: CardMotion,
  cardW: number,
  cardH: number,
  viewportW: number,
  viewportH: number,
) => {
  motion.x = clamp(
    motion.x,
    DOOR_PADDING,
    Math.max(DOOR_PADDING, viewportW - cardW - DOOR_PADDING - HANDLE_RESERVE),
  );
  motion.y = clamp(
    motion.y,
    DOOR_PADDING,
    Math.max(DOOR_PADDING, viewportH - cardH - DOOR_PADDING),
  );
};

export function createPhotoFridge(
  container: HTMLElement,
  initial: PhotoFridgeOptions = { photos: [] },
): PhotoFridgeController {
  let options: PhotoFridgeOptions = {
    width: '100%',
    height: 480,
    cardWidth: 120,
    cardHeight: 140,
    scatter: 1,
    friction: 2.0,
    showCaption: true,
    initialIndex: 0,
    ariaLabel: '冰箱磁贴照片墙',
    ...initial,
    photos: Array.isArray(initial.photos) ? initial.photos : [],
  };
  let destroyed = false;
  let viewport = { width: 0, height: 0 };
  let activeIndex: number | null = null;
  let layoutCount = -1;
  let raf: number | null = null;
  let lastFrame = 0;
  const motions: CardMotion[] = [];
  const zOrder: number[] = [];
  let topZ = 0;
  let drag: DragState | null = null;
  const cardEls: HTMLDivElement[] = [];

  const root = document.createElement('div');
  const handle = document.createElement('div');
  handle.className = `${P}__handle`;
  handle.setAttribute('aria-hidden', 'true');
  const stage = document.createElement('div');
  stage.className = `${P}__stage`;
  const empty = document.createElement('div');
  empty.className = `${P}__empty`;
  empty.textContent = '暂无照片';
  stage.appendChild(empty);
  root.append(handle, stage);
  container.appendChild(root);

  const photosOf = () => (Array.isArray(options.photos) ? options.photos : []);
  const countOf = () => photosOf().length;
  const scatterOf = () => clamp(options.scatter ?? 1, 0, 2.5);

  const paintCard = (i: number) => {
    const node = cardEls[i];
    const motion = motions[i];
    if (!node || !motion) return;
    const scale = activeIndex === i ? DRAG_LIFT : 1;
    node.style.zIndex = String(zOrder[i] ?? i);
    node.style.transform = `translate3d(${motion.x}px, ${motion.y}px, 0) rotate(${motion.rot}deg) scale(${scale})`;
    node.className = `${P}__card${activeIndex === i ? ` ${P}__card-dragging` : ''}`;
  };

  const applyInitialLayout = () => {
    const w = options.cardWidth ?? 120;
    const h = options.cardHeight ?? 140;
    const rest = buildRestLayouts(countOf(), viewport.width, viewport.height, w, h, scatterOf());
    motions.length = 0;
    zOrder.length = 0;
    rest.forEach((layout, i) => {
      motions.push({ x: layout.x, y: layout.y, rot: layout.rot, vx: 0, vy: 0, vRot: 0 });
      zOrder[i] = i;
    });
    topZ = Math.max(countOf() - 1, 0);
    const front = clamp(Math.floor(options.initialIndex ?? 0), 0, Math.max(0, countOf() - 1));
    if (countOf() > 0) {
      topZ += 1;
      zOrder[front] = topZ;
    }
    motions.forEach((m) => clampMotion(m, w, h, viewport.width, viewport.height));
    layoutCount = countOf();
    motions.forEach((_, i) => paintCard(i));
  };

  const stepPhysics = (time: number) => {
    const dt = lastFrame ? Math.min((time - lastFrame) / 1000, 0.032) : 0.016;
    lastFrame = time;
    const w = options.cardWidth ?? 120;
    const h = options.cardHeight ?? 140;
    const decay = Math.exp(-(options.friction ?? 2) * dt * 60);
    let moving = false;
    for (let i = 0; i < motions.length; i++) {
      if (activeIndex === i) continue;
      const m = motions[i];
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      m.rot += m.vRot * dt;
      m.vx *= decay;
      m.vy *= decay;
      m.vRot *= decay;
      clampMotion(m, w, h, viewport.width, viewport.height);
      if (
        Math.abs(m.vx) > MIN_VELOCITY ||
        Math.abs(m.vy) > MIN_VELOCITY ||
        Math.abs(m.vRot) > MIN_VELOCITY * 0.3
      ) {
        moving = true;
      } else {
        m.vx = 0;
        m.vy = 0;
        m.vRot = 0;
      }
      paintCard(i);
    }
    if (moving && !destroyed) raf = requestAnimationFrame(stepPhysics);
    else raf = null;
  };

  const ensureLoop = () => {
    if (raf !== null) return;
    lastFrame = 0;
    raf = requestAnimationFrame(stepPhysics);
  };

  const bringToFront = (i: number) => {
    topZ += 1;
    zOrder[i] = topZ;
    paintCard(i);
  };

  const onPointerDown = (i: number) => (event: PointerEvent) => {
    if (event.button !== 0) return;
    const motion = motions[i];
    if (!motion) return;
    const rect = stage.getBoundingClientRect();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    event.preventDefault();
    bringToFront(i);
    activeIndex = i;
    paintCard(i);
    drag = {
      pointerId: event.pointerId,
      index: i,
      grabDx: event.clientX - rect.left - motion.x,
      grabDy: event.clientY - rect.top - motion.y,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      lastTime: event.timeStamp,
      moved: 0,
      vx: 0,
      vy: 0,
    };
    motion.vx = 0;
    motion.vy = 0;
    motion.vRot = 0;
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const rect = stage.getBoundingClientRect();
    const dxTotal = event.clientX - drag.startX;
    const dyTotal = event.clientY - drag.startY;
    drag.moved = Math.max(drag.moved, Math.hypot(dxTotal, dyTotal));
    const elapsed = Math.max(event.timeStamp - drag.lastTime, 1) / 1000;
    drag.vx = clamp(
      0.65 * ((event.clientX - drag.lastX) / elapsed) + 0.35 * drag.vx,
      -MAX_VELOCITY,
      MAX_VELOCITY,
    );
    drag.vy = clamp(
      0.65 * ((event.clientY - drag.lastY) / elapsed) + 0.35 * drag.vy,
      -MAX_VELOCITY,
      MAX_VELOCITY,
    );
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
    drag.lastTime = event.timeStamp;
    const motion = motions[drag.index];
    if (!motion) return;
    const w = options.cardWidth ?? 120;
    const h = options.cardHeight ?? 140;
    motion.x = event.clientX - rect.left - drag.grabDx;
    motion.y = event.clientY - rect.top - drag.grabDy;
    motion.rot += drag.vx * 0.0035;
    clampMotion(motion, w, h, viewport.width, viewport.height);
    paintCard(drag.index);
  };

  const finishDrag = (event: PointerEvent) => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const current = drag;
    drag = null;
    activeIndex = null;
    const target = event.currentTarget as HTMLElement;
    if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
    const motion = motions[current.index];
    if (!motion) return;
    if (current.moved <= CLICK_SLOP_PX) {
      const photo = photosOf()[current.index];
      if (photo) options.onPhotoClick?.(current.index, photo);
      paintCard(current.index);
      return;
    }
    motion.vx = current.vx * 0.5;
    motion.vy = current.vy * 0.5;
    motion.vRot = current.vx * 0.008;
    ensureLoop();
    paintCard(current.index);
  };

  const rebuildCards = () => {
    const photos = photosOf();
    const count = photos.length;
    const cardW = options.cardWidth ?? 120;
    const cardH = options.cardHeight ?? 140;
    const imageHeight = Math.round(cardH * (options.showCaption ? 1 - CAPTION_RATIO : 1));
    const hasCaption = Boolean(options.showCaption && photos.some((p) => p.title || p.description));
    setHidden(empty, count > 0);
    cardEls.splice(0);
    stage.querySelectorAll(`.${P}__card`).forEach((n) => n.remove());
    photos.forEach((photo, index) => {
      const card = document.createElement('div');
      card.style.width = `${cardW}px`;
      card.style.height = `${cardH}px`;
      const magnetRow = document.createElement('div');
      magnetRow.className = `${P}__magnet-row`;
      magnetRow.setAttribute('aria-hidden', 'true');
      const m1 = document.createElement('span');
      m1.className = `${P}__magnet ${P}__${MAGNET_COLORS[index % MAGNET_COLORS.length]}`;
      const m2 = document.createElement('span');
      m2.className = `${P}__magnet ${P}__${MAGNET_COLORS[(index + 1) % MAGNET_COLORS.length]}`;
      magnetRow.append(m1, m2);
      const frame = document.createElement('div');
      frame.className = `${P}__photo-frame`;
      frame.style.height = `${imageHeight}px`;
      const img = document.createElement('img');
      img.className = `${P}__image`;
      img.src = photo.src;
      img.alt = photo.alt ?? photo.title ?? '';
      img.draggable = false;
      frame.appendChild(img);
      card.append(magnetRow, frame);
      if (hasCaption && (photo.title || photo.description)) {
        const cap = document.createElement('div');
        cap.className = `${P}__caption`;
        if (photo.title) {
          const t = document.createElement('p');
          t.className = `${P}__title`;
          t.textContent = photo.title;
          cap.appendChild(t);
        }
        if (photo.description) {
          const d = document.createElement('p');
          d.className = `${P}__description`;
          d.textContent = photo.description;
          cap.appendChild(d);
        }
        card.appendChild(cap);
      }
      card.addEventListener('pointerdown', onPointerDown(index));
      card.addEventListener('pointermove', onPointerMove);
      card.addEventListener('pointerup', finishDrag);
      card.addEventListener('pointercancel', finishDrag);
      stage.appendChild(card);
      cardEls.push(card);
    });
  };

  const applyRoot = () => {
    root.className = [P, options.className].filter(Boolean).join(' ');
    applyBlockHostBox(container, root, {
      width: options.width ?? '100%',
      height: options.height ?? 480,
    });
    assignStyle(root, options.style);
    root.setAttribute('role', 'region');
    root.setAttribute('aria-label', options.ariaLabel ?? '冰箱磁贴照片墙');
  };

  const onResize = () => {
    viewport = { width: stage.clientWidth, height: stage.clientHeight };
    if (viewport.width <= 0 || viewport.height <= 0) return;
    if (layoutCount !== countOf() || motions.length !== countOf()) applyInitialLayout();
    else {
      const w = options.cardWidth ?? 120;
      const h = options.cardHeight ?? 140;
      motions.forEach((m, i) => {
        clampMotion(m, w, h, viewport.width, viewport.height);
        paintCard(i);
      });
    }
  };

  applyRoot();
  rebuildCards();
  const ro =
    typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(() => {
          onResize();
        });
  ro?.observe(stage);
  onResize();

  return {
    update(next) {
      const prevPhotos = options.photos;
      options = {
        ...options,
        ...next,
        photos: Array.isArray(next.photos) ? next.photos : options.photos,
      };
      applyRoot();
      if (next.photos && next.photos !== prevPhotos) {
        layoutCount = -1;
        rebuildCards();
        applyInitialLayout();
      } else if (
        next.cardWidth !== undefined ||
        next.cardHeight !== undefined ||
        next.showCaption !== undefined
      ) {
        rebuildCards();
        applyInitialLayout();
      } else if (next.scatter !== undefined || next.initialIndex !== undefined) {
        applyInitialLayout();
      }
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (raf !== null) cancelAnimationFrame(raf);
      ro?.disconnect();
      root.remove();
    },
  };
}
