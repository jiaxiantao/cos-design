import { readNumberAttr } from '@cos-design/shared';
import { createCanvasClock, type CanvasClockController, type CanvasClockOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-canvas-clock';

function parseOptions(el: HTMLElement): CanvasClockOptions {
  const options = {} as CanvasClockOptions;
  readNumberAttr(options, el, 'width', 'width');
  readNumberAttr(options, el, 'height', 'height');
  return options;
}

class CosCanvasClockElement extends HTMLElement {
  private ctrl: CanvasClockController | null = null;

  static get observedAttributes() {
    return ['width', 'height'];
  }

  connectedCallback() {
    this.ctrl = createCanvasClock(this, parseOptions(this));
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
  customElements.define(TAG, CosCanvasClockElement);
}

export { CosCanvasClockElement, TAG };
