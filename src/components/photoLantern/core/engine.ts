import { bindVisibilityPause, applyBlockHostBox } from '@cos-design/shared';
import { FACE_COUNT, createLanternScene, frontFaceIndex, type LanternSceneApi } from '../scene';
import type { PhotoLanternItem } from '../types';
import type { PhotoLanternController, PhotoLanternOptions } from './types';

const P = 'cos-photo-lantern';
const CLICK_SLOP_PX = 6;
const MAX_VELOCITY = 720;
const REST_VELOCITY = 2.5;
const IDLE_BEFORE_RELEASE_MS = 90;
const VELOCITY_SMOOTH_TAU = 0.045;
const DEFAULT_W = 360;
const DEFAULT_H = 480;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const resolvePx = (value: number | string | undefined, fallback: number, parentSize: number) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.endsWith('%')) {
      const pct = Number.parseFloat(trimmed);
      if (Number.isFinite(pct)) return (parentSize * pct) / 100;
    }
    const n = Number.parseFloat(trimmed);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
};

const hexBackground = (background: string | undefined) =>
  typeof background === 'string' && background.startsWith('#') ? background : undefined;

const assignStyle = (el: HTMLElement, style?: Record<string, string | number | undefined>) => {
  if (!style) return;
  for (const [k, v] of Object.entries(style)) {
    if (v == null) continue;
    if (k.startsWith('--')) el.style.setProperty(k, String(v));
    else (el.style as unknown as Record<string, string>)[k] = String(v);
  }
};

export function createPhotoLantern(
  container: HTMLElement,
  initial: PhotoLanternOptions = { photos: [] },
): PhotoLanternController {
  let options: PhotoLanternOptions = {
    autoRotate: true,
    autoRotateSpeed: 14,
    dragSensitivity: 0.42,
    friction: 1.4,
    frameColor: '#5c4033',
    paperColor: '#faf4e8',
    lightColor: '#f0b35a',
    lightSway: 1,
    showAccessories: true,
    tasselColor: '#c94b3a',
    objectFit: 'cover',
    silhouette: false,
    showCaption: false,
    initialAngle: 0,
    ariaLabel: '走马灯图片预览',
    ...initial,
    photos: Array.isArray(initial.photos) ? initial.photos : [],
  };
  let destroyed = false;
  let angle = options.initialAngle ?? 0;
  let velocity = 0;
  let dragging = false;
  let pointerId: number | null = null;
  let lastX = 0;
  let lastT = 0;
  let dragMoved = false;
  let dragStartX = 0;
  let paused = false;
  let frontIndex = frontFaceIndex(angle);
  let viewW = DEFAULT_W;
  let viewH = DEFAULT_H;
  let scene: LanternSceneApi | null = null;
  let frameId = 0;
  let lastNow = performance.now();
  let sizeRo: ResizeObserver | null = null;

  const root = document.createElement('div');
  root.className = [P, options.className].filter(Boolean).join(' ');
  root.setAttribute('role', 'img');
  const canvas = document.createElement('canvas');
  canvas.className = `${P}__canvas`;
  root.appendChild(canvas);
  container.appendChild(root);

  const facesOf = () =>
    Array.from(
      { length: FACE_COUNT },
      (_, i) => (Array.isArray(options.photos) ? options.photos : [])[i],
    ) as (PhotoLanternItem | undefined)[];

  const applyRootStyle = () => {
    applyBlockHostBox(container, root, {
      width: options.width ?? DEFAULT_W,
      height: options.height ?? DEFAULT_H,
    });
    if (options.background !== undefined) root.style.background = options.background;
    assignStyle(root, options.style);
    root.className = [P, options.className].filter(Boolean).join(' ');
  };

  const syncCaptionAria = () => {
    const faces = facesOf();
    const frontPhoto = faces[frontIndex];
    const captionAria =
      options.showCaption && frontPhoto?.title
        ? `，当前：${frontPhoto.title}${frontPhoto.description ? `，${frontPhoto.description}` : ''}`
        : '';
    root.setAttribute('aria-label', (options.ariaLabel ?? '走马灯图片预览') + captionAria);
  };

  const rebuildScene = () => {
    scene?.dispose();
    scene = null;
    if (viewW <= 0 || viewH <= 0) return;
    scene = createLanternScene(canvas, {
      width: viewW,
      height: viewH,
      photos: facesOf(),
      frameColor: options.frameColor ?? '#5c4033',
      paperColor: options.paperColor ?? '#faf4e8',
      lightColor: options.lightColor ?? '#f0b35a',
      tasselColor: options.tasselColor ?? '#c94b3a',
      showAccessories: options.showAccessories ?? true,
      showCaption: options.showCaption ?? false,
      silhouette: options.silhouette ?? false,
      objectFit: options.objectFit || 'cover',
      background: hexBackground(options.background),
      initialAngleDeg: angle,
      onReady: () => canvas.classList.add(`${P}__canvas-ready`),
    });
  };

  const measure = () => {
    const parent = root.parentElement;
    const parentW = parent?.clientWidth || window.innerWidth;
    const parentH = parent?.clientHeight || window.innerHeight;
    const nextW = resolvePx(options.width, DEFAULT_W, parentW);
    const nextH = resolvePx(options.height, DEFAULT_H, parentH);
    if (nextW === viewW && nextH === viewH) return;
    viewW = nextW;
    viewH = nextH;
    rebuildScene();
  };

  const endDrag = (time: number, keepInertia: boolean) => {
    if (!dragging) return;
    dragging = false;
    pointerId = null;
    if (!keepInertia || time - lastT > IDLE_BEFORE_RELEASE_MS) {
      velocity = 0;
    } else {
      velocity = clamp(velocity, -MAX_VELOCITY, MAX_VELOCITY);
    }
  };

  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
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
    const sensitivity = options.dragSensitivity ?? 0.42;
    angle -= dx * sensitivity;
    scene?.setAngleDeg(angle);
    const instantVelocity = (-dx / dt) * sensitivity;
    const alpha = 1 - Math.exp(-dt / VELOCITY_SMOOTH_TAU);
    velocity = velocity + (instantVelocity - velocity) * alpha;
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
      const photo = facesOf()[frontIndex];
      if (photo) options.onPhotoClick?.(frontIndex, photo);
    }
  };

  const onPointerCancel = (e: PointerEvent) => {
    if (pointerId !== e.pointerId) return;
    endDrag(e.timeStamp, false);
  };

  const tick = (now: number) => {
    if (destroyed) return;
    frameId = requestAnimationFrame(tick);
    const api = scene;
    if (!api || paused) {
      lastNow = now;
      return;
    }
    const dt = Math.min(0.05, (now - lastNow) / 1000);
    lastNow = now;
    if (!dragging) {
      if (Math.abs(velocity) > REST_VELOCITY) {
        velocity *= Math.exp(-(options.friction ?? 1.4) * dt);
        if (Math.abs(velocity) <= REST_VELOCITY) velocity = 0;
        angle += velocity * dt;
        api.setAngleDeg(angle);
      } else if (options.autoRotate ?? true) {
        angle += (options.autoRotateSpeed ?? 14) * dt;
        api.setAngleDeg(angle);
      }
    }
    const nextFront = frontFaceIndex(angle);
    if (nextFront !== frontIndex) {
      frontIndex = nextFront;
      const photo = facesOf()[nextFront];
      options.onFaceChange?.(nextFront, photo);
      if (photo) options.onIndexChange?.(nextFront, photo);
      syncCaptionAria();
    }
    api.setLightSway(now / 1000, options.lightSway ?? 1);
    api.render();
  };

  applyRootStyle();
  syncCaptionAria();
  measure();
  sizeRo = new ResizeObserver(measure);
  sizeRo.observe(root);
  if (root.parentElement) sizeRo.observe(root.parentElement);

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
      const prev = options;
      options = { ...options, ...next };
      applyRootStyle();
      const appearanceChanged =
        prev.frameColor !== options.frameColor ||
        prev.paperColor !== options.paperColor ||
        prev.lightColor !== options.lightColor ||
        prev.tasselColor !== options.tasselColor ||
        prev.showAccessories !== options.showAccessories ||
        prev.background !== options.background ||
        prev.width !== options.width ||
        prev.height !== options.height;
      if (appearanceChanged) {
        measure();
        rebuildScene();
      } else {
        scene?.updatePhotos(
          facesOf(),
          options.silhouette ?? false,
          options.objectFit || 'cover',
          options.showCaption ?? false,
        );
      }
      syncCaptionAria();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancelAnimationFrame(frameId);
      unbindVisibility();
      sizeRo?.disconnect();
      scene?.dispose();
      scene = null;
      root.removeEventListener('pointerdown', onPointerDown);
      root.removeEventListener('pointermove', onPointerMove);
      root.removeEventListener('pointerup', onPointerUp);
      root.removeEventListener('pointercancel', onPointerCancel);
      root.remove();
    },
  };
}
