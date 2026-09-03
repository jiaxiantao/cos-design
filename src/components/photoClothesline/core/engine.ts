import {
  CLICK_SLOP_PX,
  MAX_FLING_SPEED,
  MAX_FRAME_MS,
  MAX_RELEASE_SPEED,
  OVERSCROLL_DAMP,
  PHYSICS_STEP_MS,
  PHYSICS_STEP_S,
  PIN_GRIP
} from '../constants';
import { buildLayout, buildPhysics } from '../layout';
import { clamp, cssSize } from '../math';
import { createHangerNode, type DragState, type Point2 } from '../model';
import {
  getOffsetBounds,
  isSimulationSettled,
  paintSimulation,
  settleSimulation,
  stepPhysics,
  type SimPaintCache,
  type SimState
} from '../simulation';
import type { PhotoClotheslineController, PhotoClotheslineOptions } from './types';

const P = 'cos-photo-clothesline';

const assignStyle = (el: HTMLElement, style?: Record<string, string | number | undefined>) => {
  if (!style) return;
  for (const [k, v] of Object.entries(style)) {
    if (v == null) continue;
    if (k.startsWith('--')) el.style.setProperty(k, String(v));
    else (el.style as unknown as Record<string, string>)[k] = typeof v === 'number' ? `${v}px` : String(v);
  }
};

export function createPhotoClothesline(
  container: HTMLElement,
  initial: PhotoClotheslineOptions = { photos: [] }
): PhotoClotheslineController {
  let options: PhotoClotheslineOptions = {
    width: '100%',
    height: 480,
    photoWidth: 150,
    photoHeight: 200,
    photoGap: 46,
    ropeTop: 66,
    ropeSag: 26,
    bandLength: 34,
    bandWidth: 5,
    maxPull: 110,
    stiffness: 1,
    damping: 0.16,
    tension: 0.35,
    tilt: 5,
    ropeColor: '#8d7a5c',
    pinColor: '#d8a761',
    frameColor: '#fffdf7',
    objectFit: 'cover',
    showCaption: true,
    initialIndex: 0,
    ariaLabel: 'Photo clothesline',
    ...initial,
    photos: initial.photos ?? []
  };
  let destroyed = false;
  let viewportSize = { width: 0, height: 0 };
  let ready = false;
  let requestedIndex = options.initialIndex ?? 0;
  let lastIndex = options.initialIndex ?? 0;
  let frameId: number | null = null;
  let lastTime = 0;
  let acc = 0;

  const paintCache: SimPaintCache = { bands: [], cards: [], rope: '', rail: '' };
  const sim: SimState = {
    nodes: [],
    layout: null,
    physics: null,
    offset: 0,
    offsetVelocity: 0,
    snapTarget: null,
    drag: null,
    impulse: null,
    buffer: [] as Point2[]
  };

  const svgNS = 'http://www.w3.org/2000/svg';
  const root = document.createElement('div');
  root.setAttribute('role', 'region');
  const viewport = document.createElement('div');
  const rail = document.createElement('div');
  rail.className = `${P}__rail`;
  const svg = document.createElementNS(svgNS, 'svg');
  svg.classList.add(`${P}__strings`);
  svg.setAttribute('aria-hidden', 'true');
  const ropePaths: SVGPathElement[] = [];
  for (const cls of [`${P}__rope-shadow`, `${P}__rope-shadow-core`, `${P}__rope-body`, `${P}__rope-twist`]) {
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('class', cls);
    svg.appendChild(path);
    ropePaths.push(path);
  }
  const bandPaths: SVGPathElement[] = [];
  const bandGloss: SVGPathElement[] = [];
  const knots: SVGCircleElement[] = [];
  const cards: HTMLDivElement[] = [];
  rail.appendChild(svg);
  viewport.appendChild(rail);
  root.appendChild(viewport);
  container.appendChild(root);

  const photosOf = () => options.photos ?? [];

  const currentLayout = () =>
    buildLayout({
      count: photosOf().length,
      viewportWidth: viewportSize.width,
      viewportHeight: viewportSize.height,
      photoWidth: options.photoWidth ?? 150,
      photoHeight: options.photoHeight ?? 200,
      photoGap: options.photoGap ?? 46,
      ropeTop: options.ropeTop ?? 66,
      ropeSag: options.ropeSag ?? 26,
      bandLength: options.bandLength ?? 34,
      maxPull: options.maxPull ?? 110,
      tilt: options.tilt ?? 5
    });

  const currentPhysics = () =>
    buildPhysics({
      bandLength: options.bandLength ?? 34,
      damping: options.damping ?? 0.16,
      maxPull: options.maxPull ?? 110,
      stiffness: options.stiffness ?? 1,
      tension: options.tension ?? 0.35
    });

  const viewWidth = () => viewport.clientWidth || viewportSize.width;

  const paintTargets = () => ({
    rail,
    ropePaths,
    bandPaths,
    bandGloss,
    knots,
    cards
  });

  const paint = (alpha: number, dt: number) => {
    paintSimulation(sim, paintTargets(), paintCache, alpha, dt);
  };

  const startLoop = () => {
    if (frameId !== null || typeof window === 'undefined') return;
    lastTime = 0;
    acc = 0;
    frameId = window.requestAnimationFrame(loop);
  };

  const loop = (time: number) => {
    frameId = null;
    const previous = lastTime || time;
    lastTime = time;
    const frameMs = Math.min(time - previous, MAX_FRAME_MS);
    acc += frameMs;
    const vw = viewWidth();
    let guard = 0;
    while (acc >= PHYSICS_STEP_MS && guard < 12) {
      stepPhysics(sim, vw, PHYSICS_STEP_S);
      acc -= PHYSICS_STEP_MS;
      guard += 1;
    }
    if (guard >= 12) acc = 0;
    if (isSimulationSettled(sim, vw)) {
      settleSimulation(sim);
      paint(1, 0);
      lastTime = 0;
      acc = 0;
      const centers = sim.layout?.centers;
      if (centers && centers.length > 0) {
        const viewCenter = vw / 2 - sim.offset;
        let nearest = 0;
        let best = Number.POSITIVE_INFINITY;
        for (let i = 0; i < centers.length; i++) {
          const distance = Math.abs(centers[i] - viewCenter);
          if (distance < best) {
            best = distance;
            nearest = i;
          }
        }
        if (nearest !== lastIndex) {
          lastIndex = nearest;
          const photo = photosOf()[nearest];
          if (photo) options.onIndexChange?.(nearest, photo);
        }
      }
      return;
    }
    paint(acc / PHYSICS_STEP_MS, frameMs / 1000);
    frameId = window.requestAnimationFrame(loop);
  };

  const offsetForIndex = (photoIndex: number) => {
    const view = viewWidth();
    const center = sim.layout?.centers[clamp(photoIndex, 0, Math.max(0, photosOf().length - 1))];
    if (center === undefined) return 0;
    const { min, max } = getOffsetBounds(view, sim.layout?.railWidth ?? 0);
    return clamp(view / 2 - center, min, max);
  };

  const applyHangerStyle = (el: HTMLDivElement, index: number) => {
    const layout = sim.layout;
    if (!layout) return;
    const photoW = options.photoWidth ?? 150;
    const photoH = options.photoHeight ?? 200;
    el.style.left = `${layout.cardLefts[index]}px`;
    el.style.top = `${layout.cardTops[index]}px`;
    el.style.width = `${photoW}px`;
    el.style.height = `${photoH}px`;
    el.style.transform = `translate3d(0, 0, 0) rotate(${layout.baseRots[index]}deg)`;
    el.style.setProperty('--pin-x', `${layout.pinOffsets[index]}px`);
    el.style.setProperty('--pin-grip', `${-PIN_GRIP}px`);
  };

  const rebuildHangars = () => {
    const photos = photosOf();
    const layout = currentLayout();
    const physics = currentPhysics();
    sim.layout = layout;
    sim.physics = physics;
    sim.nodes = Array.from({ length: photos.length }, (_, index) => createHangerNode(layout, physics, index));
    paintCache.rope = '';
    paintCache.rail = '';
    paintCache.bands = [];
    paintCache.cards = [];

    svg.setAttribute('width', String(layout.railWidth));
    svg.setAttribute('height', String(layout.stageHeight));
    svg.setAttribute('viewBox', `0 0 ${layout.railWidth} ${layout.stageHeight}`);
    rail.style.width = `${layout.railWidth}px`;

    while (svg.childNodes.length > 4) svg.removeChild(svg.lastChild as Node);
    bandPaths.length = 0;
    bandGloss.length = 0;
    knots.length = 0;
    photos.forEach(() => {
      const g = document.createElementNS(svgNS, 'g');
      const band = document.createElementNS(svgNS, 'path');
      band.setAttribute('class', `${P}__band-body`);
      const gloss = document.createElementNS(svgNS, 'path');
      gloss.setAttribute('class', `${P}__band-gloss`);
      const knot = document.createElementNS(svgNS, 'circle');
      knot.setAttribute('class', `${P}__band-knot`);
      knot.setAttribute('r', '4.2');
      g.append(band, gloss, knot);
      svg.appendChild(g);
      bandPaths.push(band);
      bandGloss.push(gloss);
      knots.push(knot);
    });

    cards.forEach((c) => c.remove());
    cards.length = 0;
    const hasCaption = Boolean(options.showCaption && photos.some((photo) => photo.title || photo.description));
    const clickable = Boolean(options.onPhotoClick);
    photos.forEach((photo, index) => {
      const hanger = document.createElement('div');
      hanger.className = `${P}__hanger`;
      hanger.dataset.photoIndex = String(index);
      hanger.tabIndex = 0;
      hanger.setAttribute('role', clickable ? 'button' : 'group');
      if (photo.title ?? photo.alt) hanger.setAttribute('aria-label', photo.title ?? photo.alt ?? '');
      applyHangerStyle(hanger, index);
      const pin = document.createElement('span');
      pin.className = `${P}__pin`;
      pin.setAttribute('aria-hidden', 'true');
      const spring = document.createElement('span');
      spring.className = `${P}__pin-spring`;
      pin.appendChild(spring);
      const figure = document.createElement('figure');
      figure.className = `${P}__frame`;
      const photoWrap = document.createElement('span');
      photoWrap.className = `${P}__photo`;
      const img = document.createElement('img');
      img.src = photo.src;
      img.alt = photo.alt ?? photo.title ?? '';
      img.draggable = false;
      img.style.objectFit = options.objectFit || 'cover';
      photoWrap.appendChild(img);
      figure.appendChild(photoWrap);
      if (hasCaption) {
        const cap = document.createElement('figcaption');
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
        figure.appendChild(cap);
      }
      hanger.append(pin, figure);
      rail.appendChild(hanger);
      cards[index] = hanger;
    });

    const canPan = Math.min(0, viewportSize.width - layout.railWidth) < -0.5;
    viewport.className = `${P}__viewport${canPan ? ` ${P}__pannable` : ''}`;
  };

  const applyRoot = () => {
    root.className = `${P} ${options.className ?? ''}`.trim();
    root.style.width = cssSize(options.width ?? '100%');
    root.style.height = cssSize(options.height ?? 480);
    root.style.setProperty('--rope-color', options.ropeColor ?? '#8d7a5c');
    root.style.setProperty('--band-color', options.bandColor ?? options.ropeColor ?? '#8d7a5c');
    root.style.setProperty('--band-width', `${Math.max(1, options.bandWidth ?? 5)}px`);
    root.style.setProperty('--pin-color', options.pinColor ?? '#d8a761');
    root.style.setProperty('--frame-color', options.frameColor ?? '#fffdf7');
    if (options.background) root.style.setProperty('--clothesline-bg', options.background);
    assignStyle(root, options.style);
    root.setAttribute('aria-label', options.ariaLabel ?? 'Photo clothesline');
  };

  const settleOffset = () => {
    if (viewportSize.width <= 0) return;
    if (!ready) {
      ready = true;
      requestedIndex = options.initialIndex ?? 0;
      sim.offset = offsetForIndex(requestedIndex);
      paint(1, 0);
      return;
    }
    if (requestedIndex !== (options.initialIndex ?? 0)) {
      requestedIndex = options.initialIndex ?? 0;
      sim.snapTarget = offsetForIndex(requestedIndex);
      startLoop();
      return;
    }
    const { min, max } = getOffsetBounds(viewWidth(), sim.layout?.railWidth ?? 0);
    sim.offset = clamp(sim.offset, min, max);
    paint(1, 0);
  };

  const onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    const target = event.target as HTMLElement | null;
    const hanger = target?.closest?.('[data-photo-index]') as HTMLElement | null;
    const rawIndex = hanger ? Number(hanger.dataset.photoIndex) : -1;
    const photoIndex = Number.isFinite(rawIndex) ? rawIndex : -1;
    const rect = viewport.getBoundingClientRect();
    const pointerX = event.clientX - rect.left - sim.offset;
    const pointerY = event.clientY - rect.top;
    const node = photoIndex >= 0 ? sim.nodes[photoIndex] : undefined;
    const end = node?.chain[node.chain.length - 1];
    sim.snapTarget = null;
    sim.offsetVelocity = 0;
    sim.drag = {
      pointerId: event.pointerId,
      mode: end ? 'photo' : 'pan',
      photoIndex,
      grabDx: end ? pointerX - end.x : 0,
      grabDy: end ? pointerY - end.y : 0,
      pointerX,
      pointerY,
      smoothX: pointerX,
      smoothY: pointerY,
      rectLeft: rect.left,
      rectTop: rect.top,
      startX: event.clientX,
      startY: event.clientY,
      startOffset: sim.offset,
      lastX: event.clientX,
      lastY: event.clientY,
      lastTime: event.timeStamp,
      vx: 0,
      vy: 0,
      moved: 0
    } satisfies DragState;
    viewport.setPointerCapture(event.pointerId);
    startLoop();
  };

  const onPointerMove = (event: PointerEvent) => {
    const drag = sim.drag;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    drag.moved = Math.max(drag.moved, Math.hypot(dx, dy));
    const elapsed = Math.max(event.timeStamp - drag.lastTime, 1) / 1000;
    drag.vx = 0.7 * ((event.clientX - drag.lastX) / elapsed) + 0.3 * drag.vx;
    drag.vy = 0.7 * ((event.clientY - drag.lastY) / elapsed) + 0.3 * drag.vy;
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
    drag.lastTime = event.timeStamp;
    if (drag.mode === 'pan') {
      const { min, max } = getOffsetBounds(viewWidth(), sim.layout?.railWidth ?? 0);
      const next = drag.startOffset + dx;
      const overshoot = next > max ? next - max : next < min ? next - min : 0;
      sim.offset = next - overshoot * (1 - OVERSCROLL_DAMP);
      startLoop();
      return;
    }
    drag.pointerX = event.clientX - drag.rectLeft - sim.offset;
    drag.pointerY = event.clientY - drag.rectTop;
    startLoop();
  };

  const finishDrag = (event: PointerEvent) => {
    const drag = sim.drag;
    if (!drag || drag.pointerId !== event.pointerId) return;
    sim.drag = null;
    if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
    if (drag.mode === 'pan') {
      sim.offsetVelocity = clamp(drag.vx, -MAX_FLING_SPEED, MAX_FLING_SPEED);
    } else if (drag.moved <= CLICK_SLOP_PX && drag.photoIndex >= 0) {
      const photo = photosOf()[drag.photoIndex];
      if (photo) options.onPhotoClick?.(drag.photoIndex, photo);
    } else if (drag.photoIndex >= 0) {
      sim.impulse = {
        index: drag.photoIndex,
        vx: clamp(drag.vx, -MAX_RELEASE_SPEED, MAX_RELEASE_SPEED),
        vy: clamp(drag.vy, -MAX_RELEASE_SPEED, MAX_RELEASE_SPEED)
      };
    }
    startLoop();
  };

  const onPointerCancel = (event: PointerEvent) => {
    const drag = sim.drag;
    if (!drag || drag.pointerId !== event.pointerId) return;
    sim.drag = null;
    startLoop();
  };

  const onWheel = (event: WheelEvent) => {
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.shiftKey ? event.deltaY : 0;
    if (delta === 0) return;
    const { min, max } = getOffsetBounds(viewWidth(), sim.layout?.railWidth ?? 0);
    if (min >= max) return;
    event.preventDefault();
    sim.snapTarget = null;
    sim.offsetVelocity = 0;
    sim.offset = clamp(sim.offset - delta, min, max);
    startLoop();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const hanger = (event.target as HTMLElement | null)?.closest?.('[data-photo-index]') as HTMLElement | null;
    const photoIndex = hanger ? Number(hanger.dataset.photoIndex) : -1;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      const { min, max } = getOffsetBounds(viewWidth(), sim.layout?.railWidth ?? 0);
      if (min >= max) return;
      event.preventDefault();
      const step = (options.photoWidth ?? 150) + (options.photoGap ?? 46);
      const from = sim.snapTarget ?? sim.offset;
      sim.snapTarget = clamp(from + (event.key === 'ArrowLeft' ? step : -step), min, max);
      startLoop();
      return;
    }
    if (photoIndex < 0) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      sim.impulse = { index: photoIndex, vx: 0, vy: event.key === 'ArrowDown' ? 1500 : -1000 };
      startLoop();
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      const photo = photosOf()[photoIndex];
      if (!photo || !options.onPhotoClick) return;
      event.preventDefault();
      options.onPhotoClick(photoIndex, photo);
    }
  };

  const measure = (nextWidth: number, nextHeight: number) => {
    if (viewportSize.width === nextWidth && viewportSize.height === nextHeight) return;
    viewportSize = { width: nextWidth, height: nextHeight };
    rebuildHangars();
    settleOffset();
  };

  applyRoot();
  rebuildHangars();
  measure(viewport.clientWidth, viewport.clientHeight);
  const ro =
    typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver((entries) => {
          const entry = entries[0];
          if (entry) measure(Math.round(entry.contentRect.width), Math.round(entry.contentRect.height));
        });
  ro?.observe(viewport);

  viewport.addEventListener('pointerdown', onPointerDown);
  viewport.addEventListener('pointermove', onPointerMove);
  viewport.addEventListener('pointerup', finishDrag);
  viewport.addEventListener('pointercancel', onPointerCancel);
  viewport.addEventListener('wheel', onWheel, { passive: false });
  viewport.addEventListener('keydown', onKeyDown);

  return {
    update(next) {
      const prevPhotos = options.photos;
      options = { ...options, ...next };
      applyRoot();
      rebuildHangars();
      if (options.photos !== prevPhotos) {
        ready = false;
      }
      settleOffset();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      frameId = null;
      ro?.disconnect();
      viewport.removeEventListener('pointerdown', onPointerDown);
      viewport.removeEventListener('pointermove', onPointerMove);
      viewport.removeEventListener('pointerup', finishDrag);
      viewport.removeEventListener('pointercancel', onPointerCancel);
      viewport.removeEventListener('wheel', onWheel);
      viewport.removeEventListener('keydown', onKeyDown);
      root.remove();
    }
  };
}
