import { bindVisibilityPause } from '@cos-design/shared';
import type { AudioVisualizerController, AudioVisualizerOptions } from './types';

const P = 'cos-audio-visualizer';
const DEFAULT_W = 400;
const DEFAULT_H = 120;

export function createAudioVisualizer(
  container: HTMLElement,
  initial: AudioVisualizerOptions = {},
): AudioVisualizerController {
  let options: AudioVisualizerOptions = { barCount: 32, useMic: false, ...initial };
  let destroyed = false;
  let width = options.width ?? DEFAULT_W;
  let height = options.height ?? DEFAULT_H;
  let frameId = 0;
  let paused = typeof document !== 'undefined' ? document.hidden : false;
  let unbindVisibility: (() => void) | null = null;
  let audioCtx: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let dataArray: Uint8Array | null = null;
  let stream: MediaStream | null = null;
  let demoPhase = 0;

  const root = document.createElement('div');
  root.className = P;
  const canvas = document.createElement('canvas');
  canvas.className = `${P}__canvas`;
  root.appendChild(canvas);
  container.appendChild(root);

  const applyLayout = () => {
    width = options.width ?? DEFAULT_W;
    height = options.height ?? DEFAULT_H;
    root.style.width = `${width}px`;
    root.style.height = `${height}px`;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  };

  const syncCanvas = () => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  };

  const teardownMic = () => {
    stream?.getTracks().forEach((t) => t.stop());
    stream = null;
    audioCtx?.close();
    audioCtx = null;
    analyser = null;
    dataArray = null;
  };

  const setupMic = async () => {
    teardownMic();
    if (!options.useMic || !navigator.mediaDevices?.getUserMedia) return;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (destroyed) {
        teardownMic();
        return;
      }
      audioCtx = new AudioContext();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      dataArray = new Uint8Array(analyser.frequencyBinCount);
    } catch {
      /* fallback to demo mode */
    }
  };

  const draw = () => {
    if (destroyed) return;
    frameId = requestAnimationFrame(draw);
    if (paused) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const barCount = options.barCount ?? 32;
    const bars = new Array(barCount).fill(0);
    if (analyser && dataArray) {
      analyser.getByteFrequencyData(dataArray as Uint8Array<ArrayBuffer>);
      const step = Math.floor(dataArray.length / barCount);
      for (let i = 0; i < barCount; i++) {
        bars[i] = dataArray[i * step] / 255;
      }
    } else {
      demoPhase += 0.08;
      for (let i = 0; i < barCount; i++) {
        bars[i] = (Math.sin(demoPhase + i * 0.35) + 1) * 0.35 + Math.random() * 0.15;
      }
    }

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    const gap = 3;
    const barW = (width - gap * (barCount - 1)) / barCount;

    for (let i = 0; i < barCount; i++) {
      const h = Math.max(4, bars[i] * height * 0.9);
      const x = i * (barW + gap);
      const y = height - h;
      const grad = ctx.createLinearGradient(0, y, 0, height);
      grad.addColorStop(0, '#a78bfa');
      grad.addColorStop(1, '#38bdf8');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, h, 2);
      ctx.fill();
    }
  };

  applyLayout();
  syncCanvas();
  unbindVisibility = bindVisibilityPause((hidden) => {
    paused = hidden;
  });
  setupMic();
  draw();

  return {
    update(next) {
      options = { ...options, ...next };
      applyLayout();
      syncCanvas();
      setupMic();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancelAnimationFrame(frameId);
      unbindVisibility?.();
      teardownMic();
      root.remove();
    },
  };
}
