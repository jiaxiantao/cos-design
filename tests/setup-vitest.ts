import { beforeAll, vi } from 'vitest';

/** Minimal Canvas 2D stub so lottery engines can mount under jsdom. */
beforeAll(() => {
  const ctx = {
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    arc: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    setTransform: vi.fn(),
    scale: vi.fn(),
    measureText: vi.fn(() => ({ width: 40 })),
    globalCompositeOperation: 'source-over',
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: 'center',
  };
  HTMLCanvasElement.prototype.getContext = vi.fn(
    () => ctx,
  ) as typeof HTMLCanvasElement.prototype.getContext;
});
