import React, { useEffect, useRef } from 'react';
import { bindVisibilityPause } from '@cos-design/shared';
import styles from './style/index.module.less';

export interface AudioVisualizerProps {
  width?: number;
  height?: number;
  barCount?: number;
  useMic?: boolean;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  width = 400,
  height = 120,
  barCount = 32,
  useMic = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let frameId = 0;
    let paused = document.hidden;
    let audioCtx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let dataArray: Uint8Array | null = null;
    let stream: MediaStream | null = null;
    let demoPhase = 0;
    let cancelled = false;

    const unbindVisibility = bindVisibilityPause((hidden) => {
      paused = hidden;
    });

    const setupMic = async () => {
      if (!useMic || !navigator.mediaDevices?.getUserMedia) return;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          stream = null;
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

    setupMic();

    const draw = () => {
      frameId = requestAnimationFrame(draw);
      if (paused) return;

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

    draw();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
      unbindVisibility();
      stream?.getTracks().forEach((t) => t.stop());
      audioCtx?.close();
    };
  }, [barCount, height, useMic, width]);

  return (
    <div className={styles.audioVisualizer} style={{ width, height }}>
      <canvas ref={canvasRef} className={styles.canvas} style={{ width, height }} />
    </div>
  );
};

export default AudioVisualizer;
