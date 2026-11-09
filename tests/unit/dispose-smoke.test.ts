import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createConfetti } from '../../src/components/confetti/core';
import { createNineGrid } from '../../src/components/nineGrid/core';
import { createTurntable } from '../../src/components/turntable/core';

describe('destroy smoke (memory-safe teardown)', () => {
  let host: HTMLDivElement;

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
  });

  afterEach(() => {
    host.replaceChildren();
    host.remove();
  });

  it('turntable double destroy is idempotent', () => {
    const ctrl = createTurntable(host, { size: 120, spinDuration: 10 });
    expect(host.querySelector('.cos-turntable')).toBeTruthy();
    ctrl.destroy();
    ctrl.destroy();
    expect(host.querySelector('.cos-turntable')).toBeNull();
  });

  it('confetti mount → destroy → remount leaves no orphan nodes', () => {
    const a = createConfetti(host, { width: 200, height: 120, auto: false });
    a.destroy();
    expect(host.children.length).toBe(0);
    const b = createConfetti(host, { width: 200, height: 120, auto: false });
    expect(host.children.length).toBe(1);
    b.destroy();
    expect(host.children.length).toBe(0);
  });

  it('nineGrid destroy clears root', () => {
    const ctrl = createNineGrid(host, {});
    expect(host.querySelector('.cos-nine-grid')).toBeTruthy();
    ctrl.destroy();
    expect(host.querySelector('.cos-nine-grid')).toBeNull();
  });
});
