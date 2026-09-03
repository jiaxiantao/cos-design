import { createCursorTrail, type CursorTrailController, type CursorTrailOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-cursor-trail';

function parseOptions(_el: HTMLElement): CursorTrailOptions {
  void _el;
  const options: CursorTrailOptions = {};

  return options;
}

class CosCursorTrailElement extends HTMLElement {
  private ctrl: CursorTrailController | null = null;

  static get observedAttributes() {
    return [];
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
