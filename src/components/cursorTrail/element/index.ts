import { createCursorTrail, type CursorTrailController, type CursorTrailOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-cursor-trail';

function parseOptions(el: HTMLElement): CursorTrailOptions {
  const options = {} as CursorTrailOptions;
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  if (el.hasAttribute('hint')) options.hint = el.getAttribute('hint') ?? undefined;
  if (el.hasAttribute('length')) options.length = Number(el.getAttribute('length'));
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
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
