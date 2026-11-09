import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createNineGrid } from '../../src/components/nineGrid/core';
import { createTurntable } from '../../src/components/turntable/core';
import { createSlotMachine } from '../../src/components/slotMachine/core';
import { createScratchCard } from '../../src/components/scratchCard/core';

describe('lottery core engines', () => {
  let host: HTMLDivElement;

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('reduce'),
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }));
  });

  afterEach(() => {
    host.replaceChildren();
    host.remove();
    vi.unstubAllGlobals();
  });

  it('NineGrid draw resolves targetIndex immediately under reduced motion', () => {
    const onDrawEnd = vi.fn();
    const ctrl = createNineGrid(host, { targetIndex: 4, onDrawEnd });
    ctrl.draw();
    expect(onDrawEnd).toHaveBeenCalledTimes(1);
    expect(onDrawEnd.mock.calls[0][1]).toBe(4);
    const winner = host.querySelector('.cos-nine-grid__cell.cos-nine-grid__winner');
    expect(winner).toBeTruthy();
    ctrl.destroy();
  });

  it('Turntable spin honors targetIndex and shows result', async () => {
    const onSpinEnd = vi.fn();
    const ctrl = createTurntable(host, {
      spinDuration: 50,
      prizes: [{ label: 'A' }, { label: 'B' }],
      targetIndex: 1,
      onSpinEnd,
    });
    ctrl.spin();
    await vi.waitFor(() => expect(onSpinEnd).toHaveBeenCalled(), { timeout: 3000 });
    expect(onSpinEnd.mock.calls[0][1]).toBe(1);
    const result = host.querySelector('.cos-turntable__result');
    expect(result).toBeTruthy();
    expect(result?.textContent).toMatch(/B/);
    ctrl.destroy();
  });

  it('SlotMachine spin settles with deterministic target', async () => {
    const ctrl = createSlotMachine(host, {
      symbols: ['🍒', '🍋', '🍊'],
      spinDuration: 40,
      targetResults: ['🍋', '🍋', '🍋'],
    });
    ctrl.spin();
    await vi.waitFor(
      () => {
        const btn = host.querySelector('[data-testid="slot-machine-spin"]') as HTMLButtonElement;
        expect(btn.disabled).toBe(false);
      },
      { timeout: 5000 },
    );
    ctrl.destroy();
  });

  it('ScratchCard exposes canvas and destroy removes DOM', () => {
    const ctrl = createScratchCard(host, { prize: 'Test Prize' });
    const canvas = host.querySelector('[data-testid="scratch-card-canvas"]');
    expect(canvas).toBeTruthy();
    ctrl.destroy();
    expect(host.querySelector('.cos-scratch-card')).toBeNull();
  });
});
