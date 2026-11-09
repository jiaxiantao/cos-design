import { readNumberAttr, readStringAttr } from '@cos-design/shared';
import { createCursorTrail, type CursorTrailController, type CursorTrailOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-cursor-trail';

function parseOptions(el: HTMLElement): CursorTrailOptions {
  const options = {} as CursorTrailOptions;
  readStringAttr(options, el, 'color', 'color');
  readStringAttr(options, el, 'hint', 'hint');
  readNumberAttr(options, el, 'length', 'length');
  readNumberAttr(options, el, 'width', 'width');
  readNumberAttr(options, el, 'height', 'height');
  return options;
}

class CosCursorTrailElement extends HTMLElement {
  private ctrl: CursorTrailController | null = null;

  static get observedAttributes() {
    return ['color', 'length', 'width', 'height', 'hint'];
  }

  connectedCallback() {
    this.ctrl = createCursorTrail(this, parseOptions(this));
  }

  disconnectedCallback() {
    this.ctrl?.destroy();
    this.ctrl = null;
  }

  attributeChangedCallback() {
    this.ctrl?.update(parseOptions(this));
  }
}

if (typeof customElements !== 'undefined' && !customElements.get(TAG)) {
  customElements.define(TAG, CosCursorTrailElement);
}

export { CosCursorTrailElement, TAG };
