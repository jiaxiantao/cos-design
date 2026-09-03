import { createFlipCounter, type FlipCounterController, type FlipCounterOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-flip-counter';

function parseOptions(_el: HTMLElement): FlipCounterOptions {
  void _el;
  const options: FlipCounterOptions = {};

  return options;
}

class CosFlipCounterElement extends HTMLElement {
  private ctrl: FlipCounterController | null = null;

  static get observedAttributes() {
    return [];
  }

  connectedCallback() {
    this.ctrl = createFlipCounter(this, parseOptions(this));
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
  customElements.define(TAG, CosFlipCounterElement);
}

export { CosFlipCounterElement, TAG };
