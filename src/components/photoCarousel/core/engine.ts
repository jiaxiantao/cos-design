import type { PhotoCarouselController, PhotoCarouselOptions } from './types';

const P = 'cos-photo-carousel';

const cssSize = (value: number | string) => (typeof value === 'number' ? `${value}px` : value);

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

const modIndex = (value: number, count: number) => {
  if (count <= 0) return 0;
  return ((value % count) + count) % count;
};

const faceIndexForAngle = (angle: number, step: number, count: number) => {
  if (count <= 0) return 0;
  return modIndex(Math.round(angle / step), count);
};

export function createPhotoCarousel(
  container: HTMLElement,
  initial: PhotoCarouselOptions = { photos: [] },
): PhotoCarouselController {
  let options: PhotoCarouselOptions = {
    width: 420,
    height: 360,
    radius: 180,
    cardWidth: 120,
    cardHeight: 160,
    autoRotate: true,
    autoRotateSpeed: 12,
    dragSensitivity: 0.35,
    friction: 2.2,
    showCaption: false,
    initialAngle: 0,
    ariaLabel: 'Photo carousel',
    ...initial,
    photos: initial.photos ?? [],
  };
  let destroyed = false;
  let angle = options.initialAngle ?? 0;
  let velocity = 0;
  let dragging = false;
  let pointerId: number | null = null;
  let lastPointerX = 0;
  let lastPointerTime = 0;
  let dragMoved = false;
  let dragStartX = 0;
  let faceIndex = 0;
  let frameId = 0;

  const root = document.createElement('div');
  const groundShadow = document.createElement('div');
  groundShadow.className = `${P}__ground-shadow`;
  groundShadow.setAttribute('aria-hidden', 'true');
  const perspective = document.createElement('div');
  perspective.className = `${P}__perspective`;
  const scene = document.createElement('div');
  scene.className = `${P}__scene`;
  const tray = document.createElement('div');
  tray.className = `${P}__tray`;
  tray.setAttribute('aria-hidden', 'true');
  const trayRim = document.createElement('div');
  trayRim.className = `${P}__tray-rim`;
  tray.appendChild(trayRim);
  const ring = document.createElement('div');
  ring.className = `${P}__ring`;
  const caption = document.createElement('div');
  caption.className = `${P}__caption`;
  const empty = document.createElement('div');
  empty.className = `${P}__empty`;
  empty.textContent = '暂无照片';
  scene.append(tray, ring);
  perspective.appendChild(scene);
  root.append(groundShadow, perspective, caption, empty);
  container.appendChild(root);

  const photosOf = () => options.photos ?? [];
  const countOf = () => photosOf().length;
  const stepOf = () => (countOf() > 0 ? 360 / countOf() : 360);

  const applyAngle = (nextAngle: number) => {
    angle = nextAngle;
    ring.style.transform = `rotateY(${-nextAngle}deg)`;
    const nextFace = faceIndexForAngle(nextAngle, stepOf(), countOf());
    if (nextFace !== faceIndex) {
      faceIndex = nextFace;
      paintCards();
      paintCaption();
      const photo = photosOf()[nextFace];
      options.onFaceChange?.(nextFace, photo);
      if (photo) options.onIndexChange?.(nextFace, photo);
    }
  };

  const paintCards = () => {
    const photos = photosOf();
    const count = photos.length;
    const step = stepOf();
    const radius = options.radius ?? 180;
    const cardWidth = options.cardWidth ?? 120;
    const cardHeight = options.cardHeight ?? 160;
    ring.style.width = `${cardWidth}px`;
    ring.style.height = `${cardHeight}px`;
    const existing = ring.querySelectorAll<HTMLElement>(`.${P}__card`);
    if (existing.length !== count) {
      ring.replaceChildren();
      photos.forEach(() => {
        const card = document.createElement('div');
        const frame = document.createElement('div');
        frame.className = `${P}__frame`;
        const wrap = document.createElement('div');
        wrap.className = `${P}__image-wrap`;
        const img = document.createElement('img');
        img.className = `${P}__image`;
        img.draggable = false;
        wrap.appendChild(img);
        frame.appendChild(wrap);
        card.appendChild(frame);
        ring.appendChild(card);
      });
    }
    const nodes = Array.from(ring.children) as HTMLElement[];
    nodes.forEach((card, index) => {
      const photo = photos[index];
      const isFront = index === faceIndex;
      card.className = `${P}__card ${isFront ? `${P}__card-front` : `${P}__card-back`}`;
      card.style.setProperty('--card-width', `${cardWidth}px`);
      card.style.setProperty('--card-height', `${cardHeight}px`);
      card.style.transform = `rotateY(${index * step}deg) translateZ(${radius}px)`;
      card.setAttribute('aria-hidden', isFront ? 'false' : 'true');
      const img = card.querySelector('img');
      if (img && photo) {
        img.src = photo.src;
        img.alt = photo.alt ?? photo.title ?? `Photo ${index + 1}`;
      }
    });
  };

  const paintCaption = () => {
    const photos = photosOf();
    const front = photos[faceIndex];
    const show = Boolean(options.showCaption && front && (front.title || front.description));
    caption.hidden = !show;
    if (!show || !front) {
      caption.replaceChildren();
      return;
    }
    caption.replaceChildren();
    if (front.title) {
      const title = document.createElement('p');
      title.className = `${P}__caption-title`;
      title.textContent = front.title;
      caption.appendChild(title);
    }
    if (front.description) {
      const desc = document.createElement('p');
      desc.className = `${P}__caption-desc`;
      desc.textContent = front.description;
      caption.appendChild(desc);
    }
  };

  const applyRoot = () => {
    const count = countOf();
    root.className = [P, options.className].filter(Boolean).join(' ');
    root.style.width = cssSize(options.width ?? 420);
    root.style.height = cssSize(options.height ?? 360);
    assignStyle(root, options.style);
    root.setAttribute('aria-label', options.ariaLabel ?? 'Photo carousel');
    if (count === 0) {
      root.setAttribute('role', 'img');
      root.removeAttribute('aria-roledescription');
      root.tabIndex = -1;
      empty.hidden = false;
      perspective.hidden = true;
      caption.hidden = true;
    } else {
      root.setAttribute('role', 'region');
      root.setAttribute('aria-roledescription', 'carousel');
      root.tabIndex = 0;
      empty.hidden = true;
      perspective.hidden = false;
    }
  };

  const onPointerDown = (event: PointerEvent) => {
    if (countOf() <= 0 || event.button !== 0) return;
    dragging = true;
    dragMoved = false;
    pointerId = event.pointerId;
    dragStartX = event.clientX;
    lastPointerX = event.clientX;
    lastPointerTime = performance.now();
    velocity = 0;
    perspective.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!dragging || pointerId !== event.pointerId) return;
    const now = performance.now();
    const deltaX = event.clientX - lastPointerX;
    const dt = Math.max(0.008, (now - lastPointerTime) / 1000);
    lastPointerX = event.clientX;
    lastPointerTime = now;
    if (Math.abs(event.clientX - dragStartX) > 6) dragMoved = true;
    const deltaAngle = -deltaX * (options.dragSensitivity ?? 0.35);
    velocity = deltaAngle / dt;
    applyAngle(angle + deltaAngle);
  };

  const endDrag = (event: PointerEvent) => {
    if (pointerId !== event.pointerId) return;
    dragging = false;
    pointerId = null;
    velocity = Math.max(-720, Math.min(720, velocity));
    try {
      perspective.releasePointerCapture(event.pointerId);
    } catch {
      /* already released */
    }
  };

  const onPointerUp = (event: PointerEvent) => {
    const wasClick = !dragMoved;
    endDrag(event);
    if (wasClick) {
      const photo = photosOf()[faceIndex];
      if (photo) options.onPhotoClick?.(faceIndex, photo);
    }
  };

  const onPointerCancel = (event: PointerEvent) => {
    velocity = 0;
    endDrag(event);
  };

  const tick = (time: number) => {
    frameId = requestAnimationFrame(tick);
    if (destroyed || dragging) {
      lastTick = time;
      return;
    }
    if (lastTick == null) {
      lastTick = time;
      return;
    }
    const dt = Math.min(0.05, (time - lastTick) / 1000);
    lastTick = time;
    let nextAngle = angle;
    let nextVelocity = velocity;
    let changed = false;
    if (Math.abs(nextVelocity) > 0.01) {
      nextAngle += nextVelocity * dt;
      nextVelocity *= Math.exp(-(options.friction ?? 2.2) * dt);
      if (Math.abs(nextVelocity) < 0.02) nextVelocity = 0;
      velocity = nextVelocity;
      changed = true;
    } else if (options.autoRotate !== false) {
      nextAngle += (options.autoRotateSpeed ?? 12) * dt;
      changed = true;
    }
    if (changed) applyAngle(nextAngle);
  };
  let lastTick: number | null = null;

  perspective.addEventListener('pointerdown', onPointerDown);
  perspective.addEventListener('pointermove', onPointerMove);
  perspective.addEventListener('pointerup', onPointerUp);
  perspective.addEventListener('pointercancel', onPointerCancel);

  faceIndex = faceIndexForAngle(angle, stepOf(), countOf());
  applyRoot();
  paintCards();
  paintCaption();
  ring.style.transform = `rotateY(${-angle}deg)`;
  frameId = requestAnimationFrame(tick);

  return {
    update(next) {
      const prevCount = countOf();
      const prevInitial = options.initialAngle;
      options = { ...options, ...next, photos: next.photos ?? options.photos };
      applyRoot();
      if (
        countOf() !== prevCount ||
        (next.initialAngle !== undefined && next.initialAngle !== prevInitial)
      ) {
        angle = options.initialAngle ?? 0;
        velocity = 0;
        faceIndex = faceIndexForAngle(angle, stepOf(), countOf());
      }
      paintCards();
      paintCaption();
      applyAngle(angle);
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancelAnimationFrame(frameId);
      perspective.removeEventListener('pointerdown', onPointerDown);
      perspective.removeEventListener('pointermove', onPointerMove);
      perspective.removeEventListener('pointerup', onPointerUp);
      perspective.removeEventListener('pointercancel', onPointerCancel);
      root.remove();
    },
  };
}
