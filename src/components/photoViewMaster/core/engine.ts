import { bindVisibilityPause, applyBlockHostBox, setHidden } from '@cos-design/shared';
import type { PhotoViewMasterController, PhotoViewMasterOptions } from './types';

const P = 'cos-photo-view-master';
const DEFAULT_W = 380;
const DEFAULT_H = 420;
const DEFAULT_DISC = 300;
const DEFAULT_PEEP = 160;
const CLICK_SLOP_PX = 6;
const MAX_VELOCITY = 640;
const REST_VELOCITY = 2.2;
const IDLE_BEFORE_RELEASE_MS = 90;
const VELOCITY_SMOOTH_TAU = 0.045;
const SNAP_THRESHOLD = 0.35;
const SNAP_LERP = 14;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const modIndex = (value: number, count: number) => {
  if (count <= 0) return 0;
  return ((value % count) + count) % count;
};
const frontIndexFromAngle = (angle: number, step: number, count: number) => {
  if (count <= 0) return 0;
  return modIndex(Math.round(-angle / step), count);
};
const nearestSnapAngle = (angle: number, index: number, step: number) => {
  const target = -index * step;
  const k = Math.round((angle - target) / 360);
  return target + k * 360;
};

const assignStyle = (el: HTMLElement, style?: Record<string, string | number | undefined>) => {
  if (!style) return;
  for (const [k, v] of Object.entries(style)) {
    if (v == null) continue;
    if (k.startsWith('--')) el.style.setProperty(k, String(v));
    else (el.style as unknown as Record<string, string>)[k] = String(v);
  }
};

export function createPhotoViewMaster(
  container: HTMLElement,
  initial: PhotoViewMasterOptions = { photos: [] },
): PhotoViewMasterController {
  let options: PhotoViewMasterOptions = {
    dragSensitivity: 0.45,
    friction: 1.4,
    autoRotate: true,
    autoRotateSpeed: 8,
    showCaption: true,
    initialIndex: 0,
    ariaLabel: '观景器',
    ...initial,
    photos: Array.isArray(initial.photos) ? initial.photos : [],
  };
  let destroyed = false;
  let angle = 0;
  let velocity = 0;
  let dragging = false;
  let pointerId: number | null = null;
  let lastX = 0;
  let lastT = 0;
  let dragMoved = false;
  let dragStartX = 0;
  let paused = false;
  let index = 0;
  let frameId = 0;
  let lastNow = performance.now();

  const root = document.createElement('div');
  root.setAttribute('role', 'img');
  const empty = document.createElement('div');
  empty.className = `${P}__empty`;
  empty.textContent = '暂无照片';
  const body = document.createElement('div');
  body.className = `${P}__body`;
  const topBulb = document.createElement('div');
  topBulb.className = `${P}__top-bulb`;
  topBulb.setAttribute('aria-hidden', 'true');
  const leftGrip = document.createElement('div');
  leftGrip.className = `${P}__side-grip ${P}__left`;
  leftGrip.setAttribute('aria-hidden', 'true');
  const rightGrip = document.createElement('div');
  rightGrip.className = `${P}__side-grip ${P}__right`;
  rightGrip.setAttribute('aria-hidden', 'true');
  const ridge = document.createElement('div');
  ridge.className = `${P}__body-ridge`;
  ridge.setAttribute('aria-hidden', 'true');
  const discStage = document.createElement('div');
  discStage.className = `${P}__disc-stage`;
  const disc = document.createElement('div');
  disc.className = `${P}__disc`;
  disc.setAttribute('aria-hidden', 'true');
  discStage.appendChild(disc);
  const peepStack = document.createElement('div');
  peepStack.className = `${P}__peep-stack`;
  const peepRing = document.createElement('div');
  peepRing.className = `${P}__peep-ring`;
  peepRing.setAttribute('aria-hidden', 'true');
  const peepWindow = document.createElement('div');
  peepWindow.className = `${P}__peep-window`;
  const peepImage = document.createElement('img');
  peepImage.className = `${P}__peep-image`;
  peepImage.draggable = false;
  const peepVignette = document.createElement('div');
  peepVignette.className = `${P}__peep-vignette`;
  peepVignette.setAttribute('aria-hidden', 'true');
  const peepGlare = document.createElement('div');
  peepGlare.className = `${P}__peep-glare`;
  peepGlare.setAttribute('aria-hidden', 'true');
  peepWindow.append(peepImage, peepVignette, peepGlare);
  peepStack.append(peepRing, peepWindow);
  body.append(topBulb, leftGrip, rightGrip, ridge, discStage, peepStack);
  const caption = document.createElement('div');
  caption.className = `${P}__caption`;
  root.append(empty, body, caption);
  container.appendChild(root);

  const photosOf = () => (Array.isArray(options.photos) ? options.photos : []);
  const stepOf = () => {
    const count = photosOf().length;
    return count > 0 ? 360 / count : 360;
  };
  const orbitRadiusOf = () => {
    const discSize = options.discSize ?? DEFAULT_DISC;
    const peepSize = options.peepSize ?? DEFAULT_PEEP;
    return (discSize - peepSize) / 4 + peepSize / 2;
  };

  const applyDisc = (nextAngle: number) => {
    angle = nextAngle;
    disc.style.transform = `rotate(${nextAngle}deg)`;
    const count = photosOf().length;
    const nextIndex = frontIndexFromAngle(nextAngle, stepOf(), count);
    if (nextIndex !== index) {
      index = nextIndex;
      const photo = photosOf()[nextIndex];
      if (photo) options.onIndexChange?.(nextIndex, photo);
      syncPeep();
    }
  };

  const syncPeep = () => {
    const photos = photosOf();
    const front = photos[index];
    if (front) {
      peepImage.hidden = false;
      peepImage.src = front.src;
      peepImage.alt = front.alt ?? front.title ?? `Photo ${index + 1}`;
    } else {
      peepImage.hidden = true;
      peepImage.removeAttribute('src');
    }
    const show = Boolean(options.showCaption && front && (front.title || front.description));
    caption.hidden = !show;
    caption.replaceChildren();
    if (show && front) {
      if (front.title) {
        const p = document.createElement('p');
        p.className = `${P}__caption-title`;
        p.textContent = front.title;
        caption.appendChild(p);
      }
      if (front.description) {
        const p = document.createElement('p');
        p.className = `${P}__caption-desc`;
        p.textContent = front.description;
        caption.appendChild(p);
      }
    }
    const captionAria =
      show && front?.title
        ? `，当前：${front.title}${front.description ? `，${front.description}` : ''}`
        : '';
    root.setAttribute('aria-label', (options.ariaLabel ?? '观景器') + captionAria);
  };

  const rebuildSlots = () => {
    const photos = photosOf();
    const count = photos.length;
    const emptyMode = count === 0;
    setHidden(empty, !emptyMode);
    setHidden(body, emptyMode);
    // caption visibility is managed in syncPeep when photos exist
    if (emptyMode) setHidden(caption, true);
    disc.replaceChildren();
    const step = stepOf();
    const orbit = orbitRadiusOf();
    photos.forEach((photo, i) => {
      const slot = document.createElement('div');
      slot.className = `${P}__slot`;
      slot.style.transform = `rotate(${i * step}deg) translateY(-${orbit}px)`;
      const frame = document.createElement('div');
      frame.className = `${P}__slot-frame`;
      const img = document.createElement('img');
      img.className = `${P}__slot-image`;
      img.src = photo.src;
      img.alt = '';
      img.draggable = false;
      frame.appendChild(img);
      slot.appendChild(frame);
      disc.appendChild(slot);
    });
    const safeIndex = modIndex(options.initialIndex ?? 0, count);
    index = safeIndex;
    angle = -safeIndex * step;
    velocity = 0;
    disc.style.transform = `rotate(${angle}deg)`;
    syncPeep();
  };

  const applyRoot = () => {
    root.className = [P, options.className].filter(Boolean).join(' ');
    applyBlockHostBox(container, root, {
      width: options.width ?? DEFAULT_W,
      height: options.height ?? DEFAULT_H,
    });
    root.style.setProperty('--pvm-disc-size', `${options.discSize ?? DEFAULT_DISC}px`);
    root.style.setProperty('--pvm-peep-size', `${options.peepSize ?? DEFAULT_PEEP}px`);
    assignStyle(root, options.style);
  };

  const endDrag = (time: number, keepInertia: boolean) => {
    if (!dragging) return;
    dragging = false;
    pointerId = null;
    if (!keepInertia || time - lastT > IDLE_BEFORE_RELEASE_MS) velocity = 0;
    else velocity = clamp(velocity, -MAX_VELOCITY, MAX_VELOCITY);
  };

  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0 || photosOf().length <= 0) return;
    dragging = true;
    dragMoved = false;
    pointerId = e.pointerId;
    dragStartX = e.clientX;
    lastX = e.clientX;
    lastT = e.timeStamp;
    velocity = 0;
    root.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!dragging || pointerId !== e.pointerId) return;
    const dx = e.clientX - lastX;
    const dt = Math.max(0.008, (e.timeStamp - lastT) / 1000);
    if (Math.abs(e.clientX - dragStartX) > CLICK_SLOP_PX) dragMoved = true;
    const sensitivity = options.dragSensitivity ?? 0.45;
    applyDisc(angle - dx * sensitivity);
    const instantV = (-dx / dt) * sensitivity;
    const alpha = 1 - Math.exp(-dt / VELOCITY_SMOOTH_TAU);
    velocity = velocity + (instantV - velocity) * alpha;
    lastX = e.clientX;
    lastT = e.timeStamp;
  };

  const onPointerUp = (e: PointerEvent) => {
    if (pointerId !== e.pointerId) return;
    const wasClick = !dragMoved;
    endDrag(e.timeStamp, true);
    try {
      root.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    if (wasClick) {
      const photo = photosOf()[index];
      if (photo) options.onPhotoClick?.(index, photo);
    }
  };

  const onPointerCancel = (e: PointerEvent) => {
    if (pointerId !== e.pointerId) return;
    endDrag(e.timeStamp, false);
  };

  const tick = (now: number) => {
    if (destroyed) return;
    frameId = requestAnimationFrame(tick);
    if (paused) {
      lastNow = now;
      return;
    }
    const dt = Math.min(0.05, (now - lastNow) / 1000);
    lastNow = now;
    const count = photosOf().length;
    if (dragging || count <= 0) return;
    let next = angle;
    let vel = velocity;
    const currentStep = stepOf();
    if (Math.abs(vel) > REST_VELOCITY) {
      next += vel * dt;
      vel *= Math.exp(-(options.friction ?? 1.4) * dt);
      if (Math.abs(vel) <= REST_VELOCITY) vel = 0;
    } else {
      vel = 0;
      const idx = frontIndexFromAngle(next, currentStep, count);
      const target = nearestSnapAngle(next, idx, currentStep);
      const delta = target - next;
      if (Math.abs(delta) > SNAP_THRESHOLD) next += delta * Math.min(1, SNAP_LERP * dt);
      else {
        next = target;
        if (options.autoRotate ?? true) next -= (options.autoRotateSpeed ?? 8) * dt;
      }
    }
    velocity = vel;
    applyDisc(next);
  };

  applyRoot();
  rebuildSlots();
  const unbindVisibility = bindVisibilityPause((hidden) => {
    paused = hidden;
  });
  root.addEventListener('pointerdown', onPointerDown);
  root.addEventListener('pointermove', onPointerMove);
  root.addEventListener('pointerup', onPointerUp);
  root.addEventListener('pointercancel', onPointerCancel);
  frameId = requestAnimationFrame(tick);

  return {
    update(next) {
      const prevPhotos = options.photos;
      const prevDisc = options.discSize;
      const prevPeep = options.peepSize;
      const prevIndex = options.initialIndex;
      options = { ...options, ...next };
      applyRoot();
      if (
        options.photos !== prevPhotos ||
        options.discSize !== prevDisc ||
        options.peepSize !== prevPeep ||
        options.initialIndex !== prevIndex
      ) {
        rebuildSlots();
      } else {
        syncPeep();
      }
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancelAnimationFrame(frameId);
      unbindVisibility();
      root.removeEventListener('pointerdown', onPointerDown);
      root.removeEventListener('pointermove', onPointerMove);
      root.removeEventListener('pointerup', onPointerUp);
      root.removeEventListener('pointercancel', onPointerCancel);
      root.remove();
    },
  };
}
