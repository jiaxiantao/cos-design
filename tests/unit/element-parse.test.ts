import { beforeEach, describe, expect, it } from 'vitest';
import '../../src/components/turntable/element/index.ts';
import '../../src/components/nineGrid/element/index.ts';

describe('Web Component attribute parsing', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('cos-turntable reads numeric attributes and JSON prizes property', () => {
    const el = document.createElement('cos-turntable') as HTMLElement & {
      prizes?: { label: string }[];
    };
    el.setAttribute('size', '400');
    el.setAttribute('target-index', '2');
    el.prizes = [{ label: 'P1' }, { label: 'P2' }, { label: 'P3' }];
    document.body.appendChild(el);
    const spin = el.querySelector('[data-testid="turntable-spin"]');
    expect(spin).toBeTruthy();
    el.remove();
  });

  it('cos-nine-grid respects disabled attribute', () => {
    const el = document.createElement('cos-nine-grid');
    el.setAttribute('disabled', '');
    document.body.appendChild(el);
    const draw = el.querySelector('[data-testid="nine-grid-draw"]') as HTMLButtonElement;
    expect(draw.disabled).toBe(true);
    el.remove();
  });
});
