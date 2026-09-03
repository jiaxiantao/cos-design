import { createInkBloom, type InkBloomController, type InkBloomOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-ink-bloom';

function parseOptions(_el: HTMLElement): InkBloomOptions {
  void _el;
  const options: InkBloomOptions = {};

  return options;
}

class CosInkBloomElement extends HTMLElement {
  private ctrl: InkBloomController | null = null;

  static get observedAttributes() {
    return [];
  }

  connectedCallback() {
    this.ctrl = createInkBloom(this, parseOptions(this));
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
  customElements.define(TAG, CosInkBloomElement);
}

export { CosInkBloomElement, TAG };
