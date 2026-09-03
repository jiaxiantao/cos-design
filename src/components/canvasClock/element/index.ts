import { createCanvasClock, type CanvasClockController, type CanvasClockOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-canvas-clock';

function parseOptions(_el: HTMLElement): CanvasClockOptions {
  void _el;
  const options: CanvasClockOptions = {};

  return options;
}

class CosCanvasClockElement extends HTMLElement {
  private ctrl: CanvasClockController | null = null;

  static get observedAttributes() {
    return [];
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
