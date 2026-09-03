import {
  bindPrefersReducedMotion,
  bindVisibilityPause,
  clamp,
  observeElementSize,
  prefersReducedMotion,
  resolveCanvasBoxSize,
} from '@cos-design/shared';
import type { RippleWaterController, RippleWaterOptions } from './types';

const P = 'cos-ripple-water';
const DEFAULT_W = 800;
const DEFAULT_H = 500;
const SIM = 192;

type RGB = [number, number, number];

const VERT = /* glsl */ `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAG = /* glsl */ `
precision highp float;
uniform float u_time;
uniform vec2 u_res;
uniform vec3 u_tint;
uniform vec3 u_from;
uniform vec3 u_to;
uniform sampler2D u_height;
uniform vec2 u_sim;
uniform float u_waveAmp;
uniform float u_waveSpeed;
uniform float u_shimmer;
uniform float u_reflection;
varying vec2 v_uv;
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float ambientH(vec2 p, float t) {
  float h = 0.0;
  h += sin(p.x * 3.2 + t * 1.3) * cos(p.y * 2.4 - t * 0.9) * 0.45;
  h += sin(p.x * 6.8 - t * 1.7 + p.y * 1.1) * 0.22;
  h += sin(p.x * 12.0 + p.y * 9.0 + t * 2.4) * 0.08;
  h += sin(p.x * 1.4 + p.y * 1.8 + t * 0.55) * 0.35;
  return h;
}
float sampleHeight(vec2 uv) {
  float rip = texture2D(u_height, uv).r * 2.0 - 1.0;
  vec2 p = uv * vec2(u_res.x / u_res.y, 1.0) * 2.8;
  float amb = ambientH(p, u_time * u_waveSpeed) * 0.035 * u_waveAmp;
  return rip * 0.55 + amb;
}
vec3 calcNormal(vec2 uv) {
  vec2 e = vec2(1.5 / u_sim.x, 1.5 / u_sim.y);
  float hL = sampleHeight(uv - vec2(e.x, 0.0));
  float hR = sampleHeight(uv + vec2(e.x, 0.0));
  float hD = sampleHeight(uv - vec2(0.0, e.y));
  float hU = sampleHeight(uv + vec2(0.0, e.y));
  return normalize(vec3((hL - hR) * 14.0, (hD - hU) * 14.0, 1.0));
}
void main() {
  vec2 uv = v_uv;
  vec3 n = calcNormal(uv);
  float h = sampleHeight(uv);
  vec3 V = normalize(vec3(0.0, 0.25, 1.0));
  vec3 L = normalize(vec3(0.45, 0.75, 0.55));
  float ndotl = max(dot(n, L), 0.0);
  float fresnel = pow(1.0 - max(dot(n, V), 0.0), 3.2);
  float g = clamp((uv.x + (1.0 - uv.y)) * 0.5, 0.0, 1.0);
  vec3 water = mix(u_from, u_to, g);
  water = mix(water, u_from, clamp(h * 1.8 + ndotl * 0.12, 0.0, 0.28));
  water *= 0.92 + n.y * 0.1;
  vec3 sky = mix(u_from * 1.15, vec3(0.85, 0.92, 1.0), 0.45);
  vec3 reflectCol = mix(sky, vec3(0.9, 0.95, 1.0), pow(max(n.y, 0.0), 2.0));
  water = mix(water, reflectCol, fresnel * u_reflection);
  vec3 H = normalize(L + V);
  float spec = pow(max(dot(n, H), 0.0), 180.0);
  float glitter = pow(max(dot(n, H), 0.0), 48.0);
  float sparkThresh = step(0.992, glitter) * glitter;
  vec3 sparkle = u_tint * (spec * 1.8 + sparkThresh * 2.5) * u_shimmer + vec3(1.0) * sparkThresh * 0.8 * u_shimmer;
  float softSpec = pow(max(dot(n, H), 0.0), 16.0) * 0.22 * u_shimmer;
  water += u_tint * softSpec + sparkle;
  float crest = smoothstep(0.02, 0.12, abs(h)) * fresnel;
  water += mix(u_tint, vec3(1.0), 0.4) * crest * 0.35;
  float vig = smoothstep(1.15, 0.35, length((uv - 0.5) * vec2(1.1, 1.0)));
  water *= 0.88 + 0.12 * vig;
  water += (hash(uv * u_res + u_time) - 0.5) * 0.015;
  gl_FragColor = vec4(water, 1.0);
}
`;

const parseHex = (hex: string): RGB => {
  const h = hex.replace('#', '');
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  const n = Number.parseInt(full, 16);
  if (Number.isNaN(n)) return [0.22, 0.74, 0.97];
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
};

const createProgram = (gl: WebGLRenderingContext, vert: string, frag: string) => {
  const vs = createShader(gl, gl.VERTEX_SHADER, vert);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, frag);
  if (!vs || !fs) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
};

export function createRippleWater(
  container: HTMLElement,
  initial: RippleWaterOptions = {},
): RippleWaterController {
  let options: RippleWaterOptions = {
    fill: false,
    fromColor: '#52ade3',
    toColor: '#013565',
    color: '#a8d8f5',
    waveAmplitude: 1,
    waveSpeed: 1,
    shimmer: 1,
    reflection: 0.38,
    rippleStrength: 1,
    rippleRadius: 6,
    damping: 0.985,
    spread: 0.5,
    interactive: true,
    showHint: true,
    hint: '点击水面产生涟漪',
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
  let drop: { x: number; y: number; strength: number } | null = null;

  const root = document.createElement('div');
  root.className = P;
  const canvas = document.createElement('canvas');
  canvas.className = `${P}__canvas`;
  canvas.setAttribute('role', 'img');
  const hintEl = document.createElement('span');
  hintEl.className = `${P}__hint`;
  hintEl.setAttribute('aria-hidden', 'true');
  root.append(canvas, hintEl);
  container.appendChild(root);

  const syncHint = () => {
    const show = options.showHint ?? true;
    const hint = options.hint ?? '点击水面产生涟漪';
    hintEl.textContent = hint;
    hintEl.hidden = !show;
    canvas.style.cursor = (options.interactive ?? true) ? 'pointer' : 'default';
    canvas.setAttribute('aria-label', hint || '涟漪水面');
  };

  const applyLayout = () => {
    if (options.fill) {
      root.style.width = '100%';
      root.style.height = '100%';
    } else {
      root.style.width = `${width}px`;
      root.style.height = `${height}px`;
    }
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    syncHint();
  };

  const onPointer = (e: PointerEvent) => {
    if (!(options.interactive ?? true)) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const rect = canvas.getBoundingClientRect();
    drop = {
      x: (e.clientX - rect.left) / rect.width,
      y: 1 - (e.clientY - rect.top) / rect.height,
      strength: options.rippleStrength ?? 1,
    };
  };

  const setupGl = () => {
    glCleanup?.();
    glCleanup = null;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
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
    const uTint = gl.getUniformLocation(program, 'u_tint');
    const uFrom = gl.getUniformLocation(program, 'u_from');
    const uTo = gl.getUniformLocation(program, 'u_to');
    const uHeight = gl.getUniformLocation(program, 'u_height');
    const uSim = gl.getUniformLocation(program, 'u_sim');
    const uWaveAmp = gl.getUniformLocation(program, 'u_waveAmp');
    const uWaveSpeed = gl.getUniformLocation(program, 'u_waveSpeed');
    const uShimmer = gl.getUniformLocation(program, 'u_shimmer');
    const uReflection = gl.getUniformLocation(program, 'u_reflection');
    const size = SIM * SIM;
    let prev = new Float32Array(size);
    let curr = new Float32Array(size);
    let next = new Float32Array(size);
    const heightTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, heightTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const pixels = new Uint8Array(size * 4);

    const uploadHeight = () => {
      for (let i = 0; i < size; i++) {
        const v = Math.max(0, Math.min(255, Math.floor((curr[i] * 0.5 + 0.5) * 255)));
        const o = i * 4;
        pixels[o] = v;
        pixels[o + 1] = v;
        pixels[o + 2] = v;
        pixels[o + 3] = 255;
      }
      gl.bindTexture(gl.TEXTURE_2D, heightTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, SIM, SIM, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    };

    const disturb = (nx: number, ny: number, strength: number, radius: number) => {
      const cx = nx * (SIM - 1);
      const cy = ny * (SIM - 1);
      const r = clamp(radius, 2, 12);
      for (let dy = -r - 1; dy <= r + 1; dy++) {
        for (let dx = -r - 1; dx <= r + 1; dx++) {
          const x = Math.round(cx + dx);
          const y = Math.round(cy + dy);
          if (x <= 0 || x >= SIM - 1 || y <= 0 || y >= SIM - 1) continue;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const center = Math.exp(-dist * dist * 0.55) * -0.35;
          const ring = Math.exp(-Math.pow(dist - r * 0.55, 2) * 0.9);
          curr[y * SIM + x] += strength * (center + ring * 1.1);
        }
      }
    };

    const stepSimulation = (damp: number, spd: number) => {
      const d = clamp(damp, 0.9, 0.999);
      const s = clamp(spd, 0.3, 0.7);
      for (let pass = 0; pass < 2; pass++) {
        for (let y = 1; y < SIM - 1; y++) {
          const row = y * SIM;
          for (let x = 1; x < SIM - 1; x++) {
            const i = row + x;
            const neighbors = curr[i - 1] + curr[i + 1] + curr[i - SIM] + curr[i + SIM];
            next[i] = (neighbors * s - prev[i]) * d;
            if (next[i] > 1.5) next[i] = 1.5;
            else if (next[i] < -1.5) next[i] = -1.5;
          }
        }
        const tmp = prev;
        prev = curr;
        curr = next;
        next = tmp;
        next.fill(0);
      }
    };

    const drawFrame = (timeSec: number) => {
      const from = parseHex(options.fromColor ?? '#52ade3');
      const to = parseHex(options.toColor ?? '#013565');
      const tint = parseHex(options.color ?? '#a8d8f5');
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, heightTex);
      gl.uniform1i(uHeight, 0);
      gl.uniform1f(uTime, timeSec);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform3f(uTint, tint[0], tint[1], tint[2]);
      gl.uniform3f(uFrom, from[0], from[1], from[2]);
      gl.uniform3f(uTo, to[0], to[1], to[2]);
      gl.uniform2f(uSim, SIM, SIM);
      gl.uniform1f(uWaveAmp, clamp(options.waveAmplitude ?? 1, 0, 2));
      gl.uniform1f(uWaveSpeed, clamp(options.waveSpeed ?? 1, 0, 3));
      gl.uniform1f(uShimmer, clamp(options.shimmer ?? 1, 0, 2));
      gl.uniform1f(uReflection, clamp(options.reflection ?? 0.38, 0, 1));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    uploadHeight();
    if (reduced) {
      drawFrame(0);
      glCleanup = () => {
        gl.deleteTexture(heightTex);
        gl.deleteBuffer(buf);
        gl.deleteProgram(program);
      };
      return;
    }

    const start = performance.now();
    let frameId = 0;
    const tick = (now: number) => {
      if (destroyed) return;
      frameId = requestAnimationFrame(tick);
      if (paused || reduced) return;
      if (drop) {
        const d = drop;
        const strength = clamp(d.strength, 0, 3);
        const radius = options.rippleRadius ?? 6;
        disturb(d.x, d.y, strength, radius);
        disturb(d.x + 0.004, d.y - 0.003, strength * 0.35, radius);
        drop = null;
      }
      stepSimulation(options.damping ?? 0.985, options.spread ?? 0.5);
      uploadHeight();
      drawFrame((now - start) / 1000);
    };
    frameId = requestAnimationFrame(tick);
    glCleanup = () => {
      cancelAnimationFrame(frameId);
      gl.deleteTexture(heightTex);
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
      syncHint();
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
      root.remove();
    },
  };
}
