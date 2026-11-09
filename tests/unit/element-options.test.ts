import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  optionCallbackDispatcher,
  readBooleanAttr,
  readJsonAttr,
  readNumberAttr,
  readPropertyOverride,
  readStringAttr,
} from '@cos-design/shared';

type Sample = {
  text?: string;
  size?: number;
  flicker?: boolean;
  flipped?: boolean;
  disabled?: boolean;
  items?: { label: string }[];
  onEnd?: (...args: unknown[]) => void;
};

describe('element-options helpers', () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement('div');
  });

  it('reads string and number attributes', () => {
    el.setAttribute('button-text', 'Go');
    el.setAttribute('size', '42');
    const options = {} as Sample;
    readStringAttr(options, el, 'text', 'button-text');
    readNumberAttr(options, el, 'size');
    expect(options.text).toBe('Go');
    expect(options.size).toBe(42);
  });

  it('boolean presence vs optional modes', () => {
    const options = {} as Sample;
    readBooleanAttr(options, el, 'flicker', 'flicker', 'presence');
    expect(options.flicker).toBe(false);
    el.setAttribute('flicker', '');
    readBooleanAttr(options, el, 'flicker', 'flicker', 'presence');
    expect(options.flicker).toBe(true);

    const controlled = {} as Sample;
    readBooleanAttr(controlled, el, 'flipped', 'flipped', 'optional-undefined');
    expect(controlled.flipped).toBeUndefined();
    el.setAttribute('flipped', 'false');
    readBooleanAttr(controlled, el, 'flipped', 'flipped', 'optional-undefined');
    expect(controlled.flipped).toBe(false);
  });

  it('parses JSON and property overrides', () => {
    el.setAttribute('items', '[{"label":"A"}]');
    (el as HTMLElement & { _items: Sample['items'] })._items = [{ label: 'B' }];
    const options = {} as Sample;
    readJsonAttr(options, el, 'items');
    readPropertyOverride(options, el, 'items', '_items');
    expect(options.items).toEqual([{ label: 'B' }]);
  });

  it('dispatches custom events from callbacks', () => {
    const spy = vi.fn();
    el.addEventListener('draw-end', spy);
    const options = {} as Sample;
    options.onEnd = optionCallbackDispatcher(el, 'draw-end');
    options.onEnd?.('prize', 3);
    expect(spy).toHaveBeenCalled();
    expect((spy.mock.calls[0][0] as CustomEvent).detail).toEqual(['prize', 3]);
  });
});
