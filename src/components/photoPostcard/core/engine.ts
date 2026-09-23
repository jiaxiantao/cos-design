import { applyBlockHostBox } from '@cos-design/shared';
import type { PhotoPostcardController, PhotoPostcardItem, PhotoPostcardOptions } from './types';

const P = 'cos-photo-postcard';
const CLICK_SLOP_PX = 6;
const EXIT_MS = 280;
const SNAP_MS = 320;

const modIndex = (value: number, count: number) => {
  if (count <= 0) return 0;
  return ((value % count) + count) % count;
};
const clampIndex = (index: number, count: number) => {
  if (count <= 0) return 0;
  return Math.max(0, Math.min(count - 1, Math.floor(index)));
};
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

type MotionPhase = 'idle' | 'dragging' | 'snapping' | 'exiting';

const fillFaces = (host: HTMLElement, photo: PhotoPostcardItem, showCaption: boolean) => {
  const hasCaption = showCaption && (photo.title || photo.description);
  const greeting = photo.title ? photo.title : 'Greetings from the road';
  host.replaceChildren();
  const front = document.createElement('div');
  front.className = `${P}__face ${P}__front`;
  const frame = document.createElement('div');
  frame.className = `${P}__photo-frame${hasCaption ? ` ${P}__photo-frame-with-caption` : ''}`;
  const wrap = document.createElement('div');
  wrap.className = `${P}__photo-wrap`;
  const img = document.createElement('img');
  img.className = `${P}__photo`;
  img.src = photo.src;
  img.alt = photo.alt ?? photo.title ?? '';
  img.draggable = false;
  wrap.appendChild(img);
  frame.appendChild(wrap);
  const stamp = document.createElement('div');
  stamp.className = `${P}__corner-stamp`;
  stamp.setAttribute('aria-hidden', 'true');
  front.append(frame, stamp);
  if (hasCaption) {
    const cap = document.createElement('div');
    cap.className = `${P}__front-caption`;
    if (photo.title) {
      const t = document.createElement('p');
      t.className = `${P}__front-caption-title`;
      t.textContent = photo.title;
      cap.appendChild(t);
    }
    if (photo.description) {
      const d = document.createElement('p');
      d.className = `${P}__front-caption-desc`;
      d.textContent = photo.description;
      cap.appendChild(d);
    }
    front.appendChild(cap);
  }
  const back = document.createElement('div');
  back.className = `${P}__face ${P}__back`;
  const divider = document.createElement('div');
  divider.className = `${P}__divider`;
  divider.setAttribute('aria-hidden', 'true');
  const lined = document.createElement('div');
  lined.className = `${P}__lined-paper`;
  const greet = document.createElement('p');
  greet.className = `${P}__greeting`;
  greet.textContent = greeting;
  lined.appendChild(greet);
  const body = document.createElement('p');
  if (photo.description) {
    body.className = `${P}__body-text`;
    body.textContent = photo.description;
  } else {
    body.className = `${P}__body-placeholder`;
    body.textContent = 'Wish you were here…';
  }
  lined.appendChild(body);
  const footer = document.createElement('div');
  footer.className = `${P}__back-footer`;
  const postmark = document.createElement('div');
  postmark.className = `${P}__postmark`;
  postmark.setAttribute('aria-hidden', 'true');
  const postmarkText = document.createElement('span');
  postmarkText.className = `${P}__postmark-text`;
  postmarkText.innerHTML = 'TRAVEL<br>POST';
  postmark.appendChild(postmarkText);
  const stampSq = document.createElement('div');
  stampSq.className = `${P}__stamp-square`;
  stampSq.setAttribute('aria-hidden', 'true');
  footer.append(postmark, stampSq);
  back.append(divider, lined, footer);
  host.append(front, back);
};

/**
 * Imperative port of the v3.8.x PhotoPostcard React behavior.
 * Motion updates only touch transform/opacity/class — never detach the active card.
 */
export function createPhotoPostcard(
  container: HTMLElement,
  initial: PhotoPostcardOptions = { photos: [] },
): PhotoPostcardController {
  let options: PhotoPostcardOptions = {
    width: 360,
    height: 420,
    cardWidth: 260,
    cardHeight: 170,
    pullThreshold: 80,
    showCaption: true,
    initialIndex: 0,
    initialFlipped: false,
    ariaLabel: '明信片',
    ...initial,
    photos: Array.isArray(initial.photos) ? initial.photos : [],
  };
  let destroyed = false;
  let index = clampIndex(options.initialIndex ?? 0, options.photos.length);
  let flipped = Boolean(options.initialFlipped);
  let offsetX = 0;
  let phase: MotionPhase = 'idle';
  let drag: { pointerId: number; startX: number; moved: boolean } | null = null;
  let exitTimer: number | null = null;
  let snapTimer: number | null = null;
  let paintedPhotoKey = '';

  const root = document.createElement('div');
  const stage = document.createElement('div');
  stage.className = `${P}__stage`;
  const empty = document.createElement('div');
  empty.className = `${P}__empty`;
  empty.textContent = '暂无明信片';
  const stack = document.createElement('div');
  stack.className = `${P}__stack`;
  const cardSlot = document.createElement('div');
  cardSlot.className = `${P}__card-slot`;
  const card = document.createElement('div');
  const flipInner = document.createElement('div');
  flipInner.className = `${P}__flip-inner`;
  card.appendChild(flipInner);
  cardSlot.appendChild(card);
  const hint = document.createElement('div');
  hint.className = `${P}__hint`;
  hint.textContent = '拖拽切换 · 点击查看背面';
  stage.append(empty, stack, hint);
  root.appendChild(stage);
  container.appendChild(root);

  const photosOf = () => (Array.isArray(options.photos) ? options.photos : []);
  const countOf = () => photosOf().length;
  const photoKey = (photo: PhotoPostcardItem | undefined, showCaption: boolean) =>
    photo
      ? `${photo.src}\0${photo.title ?? ''}\0${photo.description ?? ''}\0${photo.alt ?? ''}\0${showCaption}`
      : '';

  const applyMotion = () => {
    card.className = [
      `${P}__card-active`,
      flipped ? `${P}__flipped` : '',
      phase === 'exiting' ? `${P}__card-exiting` : '',
    ]
      .filter(Boolean)
      .join(' ');
    card.style.transform = `translateX(${offsetX}px)`;
    card.style.transition =
      phase === 'snapping' || phase === 'exiting'
        ? `transform ${phase === 'exiting' ? EXIT_MS : SNAP_MS}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${EXIT_MS}ms ease`
        : 'none';
    card.style.opacity = phase === 'exiting' ? '0.55' : '1';
    card.setAttribute('aria-pressed', String(flipped));
    const current = photosOf()[index];
    card.setAttribute(
      'aria-label',
      current
        ? `${flipped ? '背面' : '正面'}：${current.alt ?? current.title ?? `明信片 ${index + 1}`}`
        : '',
    );
  };

  const rebuildStackDecor = (count: number, cardWidth: number, cardHeight: number) => {
    const keep = new Set<Element>([cardSlot]);
    for (const child of [...stack.children]) {
      if (!keep.has(child)) child.remove();
    }
    const layouts =
      count <= 1
        ? []
        : [1, 2].slice(0, Math.min(2, count - 1)).map((depth) => {
            const seed = index * 13.7 + depth * 5.3;
            return {
              depth,
              rot: (pseudoRandom(seed) * 2 - 1) * 5.5,
              dx: depth * 5 + pseudoRandom(seed + 1.1) * 4,
              dy: depth * 3 + pseudoRandom(seed + 2.4) * 3,
            };
          });
    for (const { depth, rot, dx, dy } of layouts) {
      const sc = document.createElement('div');
      sc.className = `${P}__stack-card`;
      sc.style.width = `${cardWidth}px`;
      sc.style.height = `${cardHeight}px`;
      sc.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${rot}deg)`;
      sc.style.opacity = depth === 1 ? '0.92' : '0.78';
      sc.setAttribute('aria-hidden', 'true');
      stack.insertBefore(sc, cardSlot);
    }
  };

  const paintStructure = () => {
    const photos = photosOf();
    const count = photos.length;
    const cardWidth = options.cardWidth ?? 260;
    const cardHeight = options.cardHeight ?? 170;
    const showCaption = options.showCaption !== false;

    root.className = [P, options.className].filter(Boolean).join(' ');
    applyBlockHostBox(container, root, {
      width: options.width ?? 360,
      height: options.height ?? 420,
    });
    assignStyle(root, options.style);
    root.setAttribute('role', 'region');
    root.setAttribute('aria-label', options.ariaLabel ?? '明信片');
    root.tabIndex = 0;

    empty.hidden = count > 0;
    stack.hidden = count === 0;
    hint.hidden = count <= 1;

    if (count === 0) {
      flipInner.replaceChildren();
      paintedPhotoKey = '';
      return;
    }

    stack.style.width = `${cardWidth}px`;
    stack.style.height = `${cardHeight}px`;
    if (!cardSlot.isConnected || cardSlot.parentElement !== stack) {
      stack.appendChild(cardSlot);
    }
    rebuildStackDecor(count, cardWidth, cardHeight);

    cardSlot.style.width = `${cardWidth}px`;
    cardSlot.style.height = `${cardHeight}px`;
    card.style.width = `${cardWidth}px`;
    card.style.height = `${cardHeight}px`;
    card.setAttribute('role', 'button');

    const current = photos[index];
    const nextKey = photoKey(current, showCaption);
    if (current && nextKey !== paintedPhotoKey) {
      fillFaces(flipInner, current, showCaption);
      paintedPhotoKey = nextKey;
    } else if (!current) {
      flipInner.replaceChildren();
      paintedPhotoKey = '';
    }

    applyMotion();
  };

  const commitIndex = (nextIndex: number) => {
    const list = photosOf();
    const clamped = clampIndex(nextIndex, list.length);
    index = clamped;
    flipped = false;
    options.onFlipChange?.(false);
    const photo = list[clamped];
    if (photo) options.onIndexChange?.(clamped, photo);
  };

  const finishExit = (targetIndex: number) => {
    commitIndex(targetIndex);
    offsetX = 0;
    phase = 'idle';
    paintStructure();
  };

  const animateExit = (direction: 1 | -1) => {
    const delta = direction * ((options.cardWidth ?? 260) * 0.55 + 48);
    phase = 'exiting';
    offsetX = delta;
    applyMotion();
    if (exitTimer != null) window.clearTimeout(exitTimer);
    exitTimer = window.setTimeout(() => {
      const target = modIndex(index + direction, photosOf().length);
      finishExit(target);
    }, EXIT_MS);
  };

  const snapBack = () => {
    phase = 'snapping';
    offsetX = 0;
    applyMotion();
    if (snapTimer != null) window.clearTimeout(snapTimer);
    snapTimer = window.setTimeout(() => {
      phase = 'idle';
      applyMotion();
    }, SNAP_MS);
  };

  const goBy = (delta: number) => {
    if (photosOf().length <= 1) return;
    animateExit(delta > 0 ? 1 : -1);
  };

  const toggleFlip = () => {
    flipped = !flipped;
    options.onFlipChange?.(flipped);
    applyMotion();
  };

  const onPointerDown = (event: PointerEvent) => {
    if (phase === 'exiting' || countOf() === 0) return;
    drag = { pointerId: event.pointerId, startX: event.clientX, moved: false };
    phase = 'dragging';
    card.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!drag || drag.pointerId !== event.pointerId || phase === 'exiting') return;
    const dx = event.clientX - drag.startX;
    if (Math.abs(dx) > CLICK_SLOP_PX) drag.moved = true;
    offsetX = countOf() <= 1 ? dx * 0.22 : dx;
    applyMotion();
  };

  const onPointerUp = (event: PointerEvent) => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const startX = drag.startX;
    const moved = drag.moved;
    drag = null;
    if (card.hasPointerCapture(event.pointerId)) card.releasePointerCapture(event.pointerId);
    if (phase === 'exiting') return;
    const dx = event.clientX - startX;
    if (!moved) {
      phase = 'idle';
      offsetX = 0;
      toggleFlip();
      const photo = photosOf()[index];
      if (photo) options.onPhotoClick?.(index, photo);
      return;
    }
    if (Math.abs(dx) >= (options.pullThreshold ?? 80) && countOf() > 1) {
      animateExit(dx > 0 ? 1 : -1);
      return;
    }
    snapBack();
  };

  const onPointerCancel = (event: PointerEvent) => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    drag = null;
    if (card.hasPointerCapture(event.pointerId)) card.releasePointerCapture(event.pointerId);
    if (phase !== 'exiting') snapBack();
  };

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

  card.addEventListener('pointerdown', onPointerDown);
  card.addEventListener('pointermove', onPointerMove);
  card.addEventListener('pointerup', onPointerUp);
  card.addEventListener('pointercancel', onPointerCancel);
  root.addEventListener('keydown', onKeyDown);
  paintStructure();

  return {
    update(next) {
      const photos = Array.isArray(next.photos)
        ? next.photos
        : next.photos === undefined
          ? options.photos
          : [];
      options = { ...options, ...next, photos };
      index = clampIndex(index, photosOf().length);
      paintStructure();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (exitTimer != null) window.clearTimeout(exitTimer);
      if (snapTimer != null) window.clearTimeout(snapTimer);
      card.removeEventListener('pointerdown', onPointerDown);
      card.removeEventListener('pointermove', onPointerMove);
      card.removeEventListener('pointerup', onPointerUp);
      card.removeEventListener('pointercancel', onPointerCancel);
      root.removeEventListener('keydown', onKeyDown);
      root.remove();
    },
  };
}
