import { bindVisibilityPause, applyBlockHostBox, setHidden } from '@cos-design/shared';
import type { PhotoTunnelController, PhotoTunnelOptions } from './types';

const P = 'cos-photo-tunnel';
const CLICK_SLOP = 6;
const REST_VELOCITY = 0.35;
const MAX_VELOCITY = 8;
const SNAP_SPEED = 10;
const IDLE_BEFORE_RELEASE_MS = 90;
const VELOCITY_SMOOTH_TAU = 0.045;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const nearestIndex = (progress: number, count: number) => {
  if (count <= 0) return 0;
  return clamp(Math.round(progress), 0, count - 1);
};

const assignStyle = (el: HTMLElement, style?: Record<string, string | number | undefined>) => {
  if (!style) return;
  for (const [k, v] of Object.entries(style)) {
    if (v == null) continue;
    if (k.startsWith('--')) el.style.setProperty(k, String(v));
    else (el.style as unknown as Record<string, string>)[k] = String(v);
  }
};

export function createPhotoTunnel(
  container: HTMLElement,
  initial: PhotoTunnelOptions = { photos: [] },
): PhotoTunnelController {
  let options: PhotoTunnelOptions = {
    depthStep: 180,
    dragSensitivity: 0.008,
    friction: 1.5,
    autoAdvance: false,
    autoAdvanceSpeed: 0.15,
    showCaption: true,
    initialIndex: 0,
    ariaLabel: '纵深照片隧道',
    ...initial,
    photos: Array.isArray(initial.photos) ? initial.photos : [],
  };
  let destroyed = false;
  let progress = options.initialIndex ?? 0;
  let velocity = 0;
  let snapTarget: number | null = null;
  let dragging = false;
  let pointerId: number | null = null;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragStartProgress = 0;
  let lastX = 0;
  let lastY = 0;
  let lastT = 0;
  let dragMoved = false;
  let paused = false;
  let activeIndex = nearestIndex(options.initialIndex ?? 0, (options.photos ?? []).length);
  let frameId = 0;
  const frames: HTMLDivElement[] = [];
  let captionEl: HTMLDivElement | null = null;

  const root = document.createElement('div');
  const fog = document.createElement('div');
  fog.className = `${P}__depth-fog`;
  fog.setAttribute('aria-hidden', 'true');
  const vignette = document.createElement('div');
  vignette.className = `${P}__vignette`;
  vignette.setAttribute('aria-hidden', 'true');
  const stage = document.createElement('div');
  stage.className = `${P}__stage`;
  const track = document.createElement('div');
  track.className = `${P}__track`;
  stage.appendChild(track);
  const empty = document.createElement('div');
  empty.className = `${P}__empty`;
  empty.textContent = '暂无照片';
  root.append(fog, vignette, stage, empty);
  container.appendChild(root);

  const photosOf = () => (Array.isArray(options.photos) ? options.photos : []);

  const applyProgress = (next: number) => {
    progress = next;
    const step = options.depthStep ?? 180;
    const total = photosOf().length;
    for (let i = 0; i < total; i += 1) {
      const frame = frames[i];
      if (!frame) continue;
      const offset = i - progress;
      const dist = Math.abs(offset);
      const z = offset * step;
      const scale = Math.max(0.52, 1 - dist * 0.14);
      const opacity = Math.max(0.12, 1 - dist * 0.32);
      const blur = dist > 0.45 ? Math.min(4, (dist - 0.45) * 2.4) : 0;
      const isCurrent = dist < 0.55;
      frame.style.transform = `translate3d(-50%, -50%, ${z}px) scale(${scale})`;
      frame.style.opacity = String(opacity);
      frame.style.filter = blur > 0.05 ? `blur(${blur}px)` : 'none';
      frame.classList.toggle(`${P}__frame-current`, isCurrent);
      frame.setAttribute('aria-hidden', isCurrent ? 'false' : 'true');
    }
  };

  const notifyIndex = (index: number) => {
    if (index === activeIndex) return;
    activeIndex = index;
    const photo = photosOf()[index];
    if (photo) options.onIndexChange?.(index, photo);
    syncCaption();
  };

  const syncCaption = () => {
    captionEl?.remove();
    captionEl = null;
    const photos = photosOf();
    const activePhoto = photos[activeIndex];
    const show = Boolean(
      options.showCaption && activePhoto && (activePhoto.title || activePhoto.description),
    );
    const captionAria =
      show && activePhoto?.title
        ? `，当前：${activePhoto.title}${activePhoto.description ? `，${activePhoto.description}` : ''}`
        : '';
    root.setAttribute('aria-label', (options.ariaLabel ?? '纵深照片隧道') + captionAria);
    if (!show || !activePhoto) return;
    captionEl = document.createElement('div');
    captionEl.className = `${P}__caption`;
    if (activePhoto.title) {
      const p = document.createElement('p');
      p.className = `${P}__caption-title`;
      p.textContent = activePhoto.title;
      captionEl.appendChild(p);
    }
    if (activePhoto.description) {
      const p = document.createElement('p');
      p.className = `${P}__caption-desc`;
      p.textContent = activePhoto.description;
      captionEl.appendChild(p);
    }
    root.appendChild(captionEl);
  };

  const rebuild = () => {
    const photos = photosOf();
    root.className = [P, options.className].filter(Boolean).join(' ');
    applyBlockHostBox(container, root, {
      width: options.width ?? 380,
      height: options.height ?? 480,
    });
    assignStyle(root, options.style);
    const emptyMode = photos.length === 0;
    setHidden(empty, !emptyMode);
    setHidden(fog, emptyMode);
    setHidden(vignette, emptyMode);
    setHidden(stage, emptyMode);
    root.setAttribute('role', emptyMode ? 'img' : 'region');
    if (!emptyMode) {
      root.setAttribute('aria-roledescription', 'carousel');
      root.tabIndex = 0;
    }
    track.replaceChildren();
    frames.length = 0;
    photos.forEach((photo, index) => {
      const frame = document.createElement('div');
      frame.className = `${P}__frame`;
      frame.dataset.photoIndex = String(index);
      const inner = document.createElement('div');
      inner.className = `${P}__frame-inner`;
      const wrap = document.createElement('div');
      wrap.className = `${P}__image-wrap`;
      const img = document.createElement('img');
      img.className = `${P}__image`;
      img.src = photo.src;
      img.alt = photo.alt ?? photo.title ?? `Photo ${index + 1}`;
      img.draggable = false;
      wrap.appendChild(img);
      inner.appendChild(wrap);
      frame.appendChild(inner);
      track.appendChild(frame);
      frames[index] = frame;
    });
    const count = photos.length;
    const safe = nearestIndex(options.initialIndex ?? 0, count);
    progress = safe;
    velocity = 0;
    snapTarget = null;
    activeIndex = safe;
    applyProgress(safe);
    syncCaption();
  };

  const endDrag = (time: number, keepInertia: boolean) => {
    if (!dragging) return;
    dragging = false;
    pointerId = null;
    if (!keepInertia || time - lastT > IDLE_BEFORE_RELEASE_MS) velocity = 0;
    else velocity = clamp(velocity, -MAX_VELOCITY, MAX_VELOCITY);
    snapTarget = null;
  };

  const onPointerDown = (event: PointerEvent) => {
    if (photosOf().length <= 0 || event.button !== 0) return;
    dragging = true;
    dragMoved = false;
    pointerId = event.pointerId;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    dragStartProgress = progress;
    lastX = event.clientX;
    lastY = event.clientY;
    lastT = event.timeStamp;
    velocity = 0;
    snapTarget = null;
    stage.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!dragging || pointerId !== event.pointerId) return;
    const dx = event.clientX - dragStartX;
    const dy = event.clientY - dragStartY;
    if (Math.hypot(dx, dy) > CLICK_SLOP) dragMoved = true;
    const stepDx = event.clientX - lastX;
    const stepDy = event.clientY - lastY;
    const dt = Math.max(0.008, (event.timeStamp - lastT) / 1000);
    const sensitivity = options.dragSensitivity ?? 0.008;
    const dragDelta =
      Math.abs(stepDy) >= Math.abs(stepDx) ? -stepDy * sensitivity : -stepDx * sensitivity;
    const instantVelocity = dragDelta / dt;
    const alpha = 1 - Math.exp(-dt / VELOCITY_SMOOTH_TAU);
    velocity = velocity + (instantVelocity - velocity) * alpha;
    const totalDrag = Math.abs(dy) >= Math.abs(dx) ? -dy * sensitivity : -dx * sensitivity;
    const maxProgress = Math.max(0, photosOf().length - 1);
    const nextProgress = clamp(dragStartProgress + totalDrag, 0, maxProgress);
    lastX = event.clientX;
    lastY = event.clientY;
    lastT = event.timeStamp;
    applyProgress(nextProgress);
    notifyIndex(nearestIndex(nextProgress, photosOf().length));
  };

  const onPointerUp = (event: PointerEvent) => {
    if (pointerId !== event.pointerId) return;
    const wasClick = !dragMoved;
    endDrag(event.timeStamp, true);
    try {
      stage.releasePointerCapture(event.pointerId);
    } catch {
      /* already released */
    }
    if (wasClick) {
      const photo = photosOf()[activeIndex];
      if (photo) options.onPhotoClick?.(activeIndex, photo);
    }
  };

  const onPointerCancel = (event: PointerEvent) => {
    if (pointerId !== event.pointerId) return;
    endDrag(event.timeStamp, false);
    try {
      stage.releasePointerCapture(event.pointerId);
    } catch {
      /* already released */
    }
  };

  let lastNow = performance.now();
  const tick = (now: number) => {
    if (destroyed) return;
    frameId = requestAnimationFrame(tick);
    if (paused) {
      lastNow = now;
      return;
    }
    const dt = Math.min(0.05, (now - lastNow) / 1000);
    lastNow = now;
    if (dragging) return;
    const count = photosOf().length;
    const maxProgress = Math.max(0, count - 1);
    let next = progress;
    let vel = velocity;
    let changed = false;
    if (snapTarget !== null) {
      const delta = snapTarget - next;
      if (Math.abs(delta) <= 0.004) {
        next = snapTarget;
        snapTarget = null;
        vel = 0;
        notifyIndex(nearestIndex(next, count));
        changed = true;
      } else {
        next += delta * Math.min(1, SNAP_SPEED * dt);
        vel = 0;
        changed = true;
      }
    } else if (Math.abs(vel) > REST_VELOCITY) {
      vel *= Math.exp(-(options.friction ?? 1.5) * dt);
      if (Math.abs(vel) <= REST_VELOCITY) vel = 0;
      next = clamp(next + vel * dt, 0, maxProgress);
      changed = true;
      if (vel === 0 || next <= 0 || next >= maxProgress) snapTarget = nearestIndex(next, count);
    } else if ((options.autoAdvance ?? false) && count > 1) {
      next += (options.autoAdvanceSpeed ?? 0.15) * dt;
      if (next >= maxProgress) next = maxProgress;
      else changed = true;
      const ni = nearestIndex(next, count);
      if (ni !== activeIndex) notifyIndex(ni);
    } else {
      const target = nearestIndex(next, count);
      if (Math.abs(next - target) > 0.004) {
        snapTarget = target;
        changed = true;
      } else if (next !== target) {
        next = target;
        notifyIndex(target);
        changed = true;
      }
    }
    velocity = vel;
    if (changed) applyProgress(next);
  };

  rebuild();
  const unbindVisibility = bindVisibilityPause((hidden) => {
    paused = hidden;
  });
  stage.addEventListener('pointerdown', onPointerDown);
  stage.addEventListener('pointermove', onPointerMove);
  stage.addEventListener('pointerup', onPointerUp);
  stage.addEventListener('pointercancel', onPointerCancel);
  frameId = requestAnimationFrame(tick);

  return {
    update(next) {
      const prevIndex = options.initialIndex;
      const prevPhotos = options.photos;
      options = { ...options, ...next };
      if (options.photos !== prevPhotos) rebuild();
      else {
        root.className = [P, options.className].filter(Boolean).join(' ');
        applyBlockHostBox(container, root, {
          width: options.width ?? 380,
          height: options.height ?? 480,
        });
        assignStyle(root, options.style);
        if (options.initialIndex !== prevIndex) {
          const safe = nearestIndex(options.initialIndex ?? 0, photosOf().length);
          progress = safe;
          velocity = 0;
          snapTarget = null;
          activeIndex = safe;
          applyProgress(safe);
        }
        syncCaption();
      }
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancelAnimationFrame(frameId);
      unbindVisibility();
      stage.removeEventListener('pointerdown', onPointerDown);
      stage.removeEventListener('pointermove', onPointerMove);
      stage.removeEventListener('pointerup', onPointerUp);
      stage.removeEventListener('pointercancel', onPointerCancel);
      root.remove();
    },
  };
}
