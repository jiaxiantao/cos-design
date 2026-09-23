import {
  bindPrefersReducedMotion,
  bindVisibilityPause,
  clamp,
  observeElementSize,
  prefersReducedMotion,
  resolveCanvasBoxSize,
  applyCanvasHostBox,
} from '@cos-design/shared';
import { createFieldTexture, createProgram } from '../gl';
import { createLavaSim, MAX_DPR, SIM } from '../sim';
import { FRAG, VERT } from '../shaders';
import type { LavaBubbleController, LavaBubbleOptions } from './types';

const P = 'cos-lava-bubble';
const DEFAULT_W = 800;
const DEFAULT_H = 500;

export function createLavaBubble(
  container: HTMLElement,
  initial: LavaBubbleOptions = {},
): LavaBubbleController {
  let options: LavaBubbleOptions = {
    fill: false,
    heat: 1,
    speed: 1,
    autoSpawn: true,
    activity: 1,
    interactive: true,
    ariaLabel: '熔岩泡背景',
    ...initial,
  };
  let destroyed = false;
  let width = options.width ?? DEFAULT_W;
  let height = options.height ?? DEFAULT_H;
  let paused = typeof document !== 'undefined' ? document.hidden : false;
  let reduced = prefersReducedMotion();
  let sizeCleanup: (() => void) | null = null;
  let unbindVisibility: (() => void) | null = null;
  let unbindMotion: (() => void) | null = null;
  let glCleanup: (() => void) | null = null;
  let click: { u: number; v: number } | null = null;
  let stir: { u: number; v: number; vu: number; vv: number } | null = null;
  let prevPointer: { u: number; v: number } | null = null;

  const root = document.createElement('div');
  root.className = P;
  root.setAttribute('role', 'img');
  const canvas = document.createElement('canvas');
  canvas.className = `${P}__canvas`;
  root.appendChild(canvas);
  container.appendChild(root);

  const toUv = (clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect();
    return {
      u: (clientX - rect.left) / Math.max(rect.width, 1),
      v: 1 - (clientY - rect.top) / Math.max(rect.height, 1),
    };
  };

  const onPointer = (e: PointerEvent) => {
    if (!(options.interactive ?? true)) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    click = toUv(e.clientX, e.clientY);
  };
  const onPointerMove = (e: PointerEvent) => {
    if (!(options.interactive ?? true)) return;
    const { u, v } = toUv(e.clientX, e.clientY);
    if (prevPointer) {
      stir = { u, v, vu: u - prevPointer.u, vv: v - prevPointer.v };
    } else {
      stir = { u, v, vu: 0, vv: 0 };
    }
    prevPointer = { u, v };
  };
  const onPointerLeave = () => {
    prevPointer = null;
    stir = null;
  };

  const applyLayout = () => {
    applyCanvasHostBox(container, root, {
      fill: Boolean(options.fill),
      width: width,
      height: height,
    });
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    root.setAttribute('aria-label', options.ariaLabel ?? '熔岩泡背景');
  };

  let lastGlSize = { w: 0, h: 0 };
  const setupGl = () => {
    if (lastGlSize.w === width && lastGlSize.h === height && glCleanup) return;
    lastGlSize = { w: width, h: height };
    glCleanup?.();
    glCleanup = null;
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
    });
    if (!gl) return;
    const program = createProgram(gl, VERT, FRAG);
    if (!program) return;
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, 'a_pos');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uRes = gl.getUniformLocation(program, 'u_res');
    const uSim = gl.getUniformLocation(program, 'u_sim');
    const uHeat = gl.getUniformLocation(program, 'u_heat');
    const uField = gl.getUniformLocation(program, 'u_field');
    const fieldTex = createFieldTexture(gl);
    if (!fieldTex) return;
    const sim = createLavaSim();
    let frameId = 0;
    let lastTs = 0;
    let time = 0;

    const paint = (t: number) => {
      sim.upload(gl, fieldTex);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, fieldTex);
      gl.uniform1i(uField, 0);
      gl.uniform1f(uTime, t);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uSim, SIM, SIM);
      gl.uniform1f(uHeat, options.heat ?? 1);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const draw = (ts: number) => {
      if (destroyed) return;
      frameId = requestAnimationFrame(draw);
      if (paused) return;
      if (!lastTs) lastTs = ts;
      const dt = clamp((ts - lastTs) / 1000, 0.008, 0.033);
      lastTs = ts;
      if (reduced) {
        paint(0);
        return;
      }
      const rate = options.speed ?? 1;
      time += dt * rate;
      const clickNow = click;
      click = null;
      const stirNow = stir;
      const stirForStep =
        stirNow && Math.hypot(stirNow.vu, stirNow.vv) > 0.0003
          ? { u: stirNow.u, v: stirNow.v, vu: stirNow.vu, vv: stirNow.vv }
          : null;
      if (stirNow) stir = { u: stirNow.u, v: stirNow.v, vu: 0, vv: 0 };
      sim.step(dt, rate, {
        autoSpawn: options.autoSpawn ?? true,
        activity: options.activity ?? 1,
        click: clickNow,
        stir: stirForStep,
      });
      paint(time);
    };

    draw(0);
    glCleanup = () => {
      cancelAnimationFrame(frameId);
      gl.deleteTexture(fieldTex);
      gl.deleteBuffer(buf);
      gl.deleteProgram(program);
    };
  };

  const bindSize = () => {
    sizeCleanup?.();
    sizeCleanup = null;
    if (!(options.fill ?? false)) {
      width = options.width ?? DEFAULT_W;
      height = options.height ?? DEFAULT_H;
      applyLayout();
      setupGl();
      return;
    }
    sizeCleanup = observeElementSize(container, (measured) => {
      const box = resolveCanvasBoxSize({
        fill: true,
        width: options.width,
        height: options.height,
        defaultWidth: DEFAULT_W,
        defaultHeight: DEFAULT_H,
        measured,
      });
      width = box.width;
      height = box.height;
      applyLayout();
      setupGl();
    });
  };

  canvas.addEventListener('pointerdown', onPointer);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerleave', onPointerLeave);
  unbindVisibility = bindVisibilityPause((hidden) => {
    paused = hidden;
  });
  unbindMotion = bindPrefersReducedMotion((value) => {
    reduced = value;
  });
  bindSize();

  return {
    update(next) {
      const prevFill = options.fill;
      const prevW = options.width;
      const prevH = options.height;
      options = { ...options, ...next };
      root.setAttribute('aria-label', options.ariaLabel ?? '熔岩泡背景');
      if (options.fill !== prevFill || options.width !== prevW || options.height !== prevH)
        bindSize();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      glCleanup?.();
      unbindVisibility?.();
      unbindMotion?.();
      sizeCleanup?.();
      canvas.removeEventListener('pointerdown', onPointer);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      root.remove();
    },
  };
}
