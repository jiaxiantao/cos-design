import { bindVisibilityPause } from '@cos-design/shared';
import type { PhotoPrismItem } from '../types';
import type { PhotoPrismController, PhotoPrismOptions } from './types';

const P = 'cos-photo-prism';
const FACE_COUNT = 6;
const CLICK_SLOP_PX = 6;
const MAX_VELOCITY = 640;
const REST_VELOCITY = 2.2;
const IDLE_BEFORE_RELEASE_MS = 90;
const VELOCITY_SMOOTH_TAU = 0.045;
const AUTO_ROTATE_SPEED = 7.5;
const FLOAT_AMPLITUDE = 5;
const FLOAT_PERIOD = 4.8;
const DEFAULT_W = 380;
const DEFAULT_H = 380;
const DEFAULT_SIZE = 200;
const FACE_KEYS = ['front', 'back', 'right', 'left', 'top', 'bottom'] as const;

const cssSize = (value: number | string) => (typeof value === 'number' ? `${value}px` : value);
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const wrap180 = (deg: number) => {
  let a = ((deg % 360) + 360) % 360;
  if (a > 180) a -= 360;
  return a;
};
const frontFaceIndex = (rx: number, ry: number) => {
  const x = wrap180(rx);
  const y = ((ry % 360) + 360) % 360;
  if (x > 45) return 4;
  if (x < -45) return 5;
  if (y >= 315 || y < 45) return 0;
  if (y >= 45 && y < 135) return 2;
  if (y >= 135 && y < 225) return 1;
  return 3;
};

const assignStyle = (el: HTMLElement, style?: Record<string, string | number | undefined>) => {
  if (!style) return;
  for (const [k, v] of Object.entries(style)) {
    if (v == null) continue;
    if (k.startsWith('--')) el.style.setProperty(k, String(v));
    else (el.style as unknown as Record<string, string>)[k] = String(v);
  }
};

export function createPhotoPrism(
  container: HTMLElement,
  initial: PhotoPrismOptions = { photos: [] },
): PhotoPrismController {
  let options: PhotoPrismOptions = {
    autoRotate: true,
    dragSensitivity: 0.4,
    friction: 1.35,
    showCaption: true,
    ariaLabel: '照片棱镜',
    ...initial,
    photos: initial.photos ?? [],
  };
  let destroyed = false;
  let rx = -12;
  let ry = -28;
  let vx = 0;
  let vy = 0;
  let dragging = false;
  let pointerId: number | null = null;
  let lastX = 0;
  let lastY = 0;
  let lastT = 0;
  let dragMoved = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let paused = false;
  let faceIndex = frontFaceIndex(rx, ry);
  let frameId = 0;
  let lastNow = performance.now();
  let timeAcc = 0;

  const root = document.createElement('div');
  root.setAttribute('role', 'img');
  const glow = document.createElement('div');
  glow.className = `${P}__glow`;
  glow.setAttribute('aria-hidden', 'true');
  const stage = document.createElement('div');
  stage.className = `${P}__stage`;
  const floatWrap = document.createElement('div');
  floatWrap.className = `${P}__float-wrap`;
  const cube = document.createElement('div');
  cube.className = `${P}__cube`;
  floatWrap.appendChild(cube);
  stage.appendChild(floatWrap);
  root.append(glow, stage);
  container.appendChild(root);

  const facesOf = () =>
    Array.from({ length: FACE_COUNT }, (_, i) => (options.photos ?? [])[i]) as (
      | PhotoPrismItem
      | undefined
    )[];

  const renderFaces = () => {
    cube.replaceChildren();
    const faces = facesOf();
    FACE_KEYS.forEach((key, index) => {
      const photo = faces[index];
      const face = document.createElement('div');
      face.className = `${P}__face ${P}__${key}`;
      face.dataset.faceIndex = String(index);
      if (photo) {
        const img = document.createElement('img');
        img.className = `${P}__photo`;
        img.src = photo.src;
        img.alt = photo.alt ?? photo.title ?? `Photo ${index + 1}`;
        img.draggable = false;
        face.appendChild(img);
      } else {
        const ph = document.createElement('div');
        ph.className = `${P}__placeholder`;
        ph.setAttribute('aria-hidden', 'true');
        face.appendChild(ph);
      }
      const hasCaption = Boolean(
        options.showCaption && photo && (photo.title || photo.description),
      );
      if (hasCaption && photo) {
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
        face.appendChild(cap);
      }
      cube.appendChild(face);
    });
  };

  const applyRoot = () => {
    root.className = [P, options.className].filter(Boolean).join(' ');
    root.style.width = cssSize(options.width ?? DEFAULT_W);
    root.style.height = cssSize(options.height ?? DEFAULT_H);
    root.style.setProperty('--prism-size', `${options.size ?? DEFAULT_SIZE}px`);
    assignStyle(root, options.style);
    const faces = facesOf();
    const frontPhoto = faces[faceIndex];
    const captionAria =
      options.showCaption && frontPhoto?.title
        ? `，当前：${frontPhoto.title}${frontPhoto.description ? `，${frontPhoto.description}` : ''}`
        : '';
    root.setAttribute('aria-label', (options.ariaLabel ?? '照片棱镜') + captionAria);
  };

  const applyTransform = (floatY: number) => {
    cube.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    floatWrap.style.transform = `translateY(${floatY}px)`;
    const nextFace = frontFaceIndex(rx, ry);
    if (nextFace !== faceIndex) {
      faceIndex = nextFace;
      applyRoot();
    }
  };

  const endDrag = (time: number, keepInertia: boolean) => {
    if (!dragging) return;
    dragging = false;
    pointerId = null;
    if (!keepInertia || time - lastT > IDLE_BEFORE_RELEASE_MS) {
      vx = 0;
      vy = 0;
      return;
    }
    vx = clamp(vx, -MAX_VELOCITY, MAX_VELOCITY);
    vy = clamp(vy, -MAX_VELOCITY, MAX_VELOCITY);
  };

  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    dragging = true;
    dragMoved = false;
    pointerId = e.pointerId;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    lastX = e.clientX;
    lastY = e.clientY;
    lastT = e.timeStamp;
    vx = 0;
    vy = 0;
    root.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!dragging || pointerId !== e.pointerId) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    const dt = Math.max(0.008, (e.timeStamp - lastT) / 1000);
    if (Math.hypot(e.clientX - dragStartX, e.clientY - dragStartY) > CLICK_SLOP_PX)
      dragMoved = true;
    const sensitivity = options.dragSensitivity ?? 0.4;
    ry -= dx * sensitivity;
    rx -= dy * sensitivity;
    const instantVx = (-dx / dt) * sensitivity;
    const instantVy = (-dy / dt) * sensitivity;
    const alpha = 1 - Math.exp(-dt / VELOCITY_SMOOTH_TAU);
    vx = vx + (instantVx - vx) * alpha;
    vy = vy + (instantVy - vy) * alpha;
    lastX = e.clientX;
    lastY = e.clientY;
    lastT = e.timeStamp;
    cube.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    const nextFace = frontFaceIndex(rx, ry);
    if (nextFace !== faceIndex) {
      faceIndex = nextFace;
      applyRoot();
    }
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
      const target = (e.target as HTMLElement | null)?.closest?.(
        '[data-face-index]',
      ) as HTMLElement | null;
      const raw = target ? Number(target.dataset.faceIndex) : faceIndex;
      const index = Number.isFinite(raw) ? raw : faceIndex;
      const photo = facesOf()[index];
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
    timeAcc += dt;
    if (!dragging) {
      if (Math.abs(vx) > REST_VELOCITY || Math.abs(vy) > REST_VELOCITY) {
        const decay = Math.exp(-(options.friction ?? 1.35) * dt);
        vx *= decay;
        vy *= decay;
        if (Math.abs(vx) <= REST_VELOCITY) vx = 0;
        if (Math.abs(vy) <= REST_VELOCITY) vy = 0;
        rx += vy * dt;
        ry += vx * dt;
      } else if (options.autoRotate ?? true) {
        ry += AUTO_ROTATE_SPEED * dt;
      }
    }
    const floatY =
      dragging || Math.abs(vx) > REST_VELOCITY || Math.abs(vy) > REST_VELOCITY
        ? 0
        : Math.sin((timeAcc / FLOAT_PERIOD) * Math.PI * 2) * FLOAT_AMPLITUDE;
    applyTransform(floatY);
  };

  applyRoot();
  renderFaces();
  applyTransform(0);
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
      options = { ...options, ...next };
      applyRoot();
      renderFaces();
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
