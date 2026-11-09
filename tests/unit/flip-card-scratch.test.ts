import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as shared from '@cos-design/shared';
import { createFlipCard } from '../../src/components/flipCard/core';
import { createScratchCard } from '../../src/components/scratchCard/core';

describe('FlipCard controlled mode', () => {
  let host: HTMLDivElement;

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
  });

  afterEach(() => {
    host.replaceChildren();
    host.remove();
  });

  it('honors controlled flipped prop via update', () => {
    const ctrl = createFlipCard(host, { flipped: false, disabled: false });
    const btn = host.querySelector('.cos-flip-card') as HTMLButtonElement;
    expect(btn.getAttribute('aria-pressed')).toBe('false');
    ctrl.update({ flipped: true });
    expect(btn.getAttribute('aria-pressed')).toBe('true');
    expect(btn.classList.contains('cos-flip-card--flipped')).toBe(true);
    btn.click();
    expect(btn.getAttribute('aria-pressed')).toBe('true');
    ctrl.destroy();
  });

  it('uncontrolled flip on click then reset', () => {
    const onReveal = vi.fn();
    const ctrl = createFlipCard(host, { onReveal });
    const btn = host.querySelector('.cos-flip-card') as HTMLButtonElement;
    btn.click();
    expect(btn.getAttribute('aria-pressed')).toBe('true');
    expect(onReveal).toHaveBeenCalled();
    ctrl.reset();
    expect(btn.getAttribute('aria-pressed')).toBe('false');
    ctrl.destroy();
  });
});

describe('ScratchCard reveal threshold', () => {
  let host: HTMLDivElement;
  let getImageData: ReturnType<typeof vi.fn>;
  let ctx: Record<string, unknown>;

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
    vi.spyOn(shared, 'getRelativePointerPosition').mockReturnValue({ x: 50, y: 50 });
    getImageData = vi.fn();
    ctx = {
      globalCompositeOperation: 'source-over',
      fillRect: vi.fn(),
      fillText: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      getImageData,
      setTransform: vi.fn(),
    };
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ctx) as typeof HTMLCanvasElement.prototype.getContext;
  });

  afterEach(() => {
    host.replaceChildren();
    host.remove();
    vi.restoreAllMocks();
  });

  const makePixelData = (transparentRatio: number) => {
    const total = 100 * 100;
    const transparent = Math.floor(total * transparentRatio);
    const data = new Uint8ClampedArray(total * 4);
    for (let p = 0; p < total; p += 1) {
      data[p * 4 + 3] = p < transparent ? 0 : 255;
    }
    return { data, width: 100, height: 100 };
  };

  it('calls onReveal when scratched pixels exceed threshold', () => {
    const onReveal = vi.fn();
    const ctrl = createScratchCard(host, {
      width: 100,
      height: 100,
      revealThreshold: 0.45,
      onReveal,
    });
    getImageData.mockReturnValue(makePixelData(0.5));
    const canvas = host.querySelector('canvas') as HTMLCanvasElement;
    canvas.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 10, clientY: 10 }));
    canvas.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 20, clientY: 20 }));
    expect(onReveal).toHaveBeenCalled();
    expect(canvas.className).toContain('hidden');
    ctrl.destroy();
  });

  it('does not reveal below threshold', () => {
    const onReveal = vi.fn();
    const ctrl = createScratchCard(host, {
      width: 100,
      height: 100,
      revealThreshold: 0.45,
      onReveal,
    });
    getImageData.mockReturnValue(makePixelData(0.1));
    const canvas = host.querySelector('canvas') as HTMLCanvasElement;
    canvas.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 10, clientY: 10 }));
    canvas.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 20, clientY: 20 }));
    expect(onReveal).not.toHaveBeenCalled();
    ctrl.destroy();
  });
});
