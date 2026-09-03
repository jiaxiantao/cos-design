import { createCountUp, type CountUpController, type CountUpOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-count-up';

function parseOptions(_el: HTMLElement): CountUpOptions {
  void _el;
  const options: CountUpOptions = {};

  return options;
}

class CosCountUpElement extends HTMLElement {
  private ctrl: CountUpController | null = null;

  static get observedAttributes() {
    return [];
  }

  connectedCallback() {
    this.ctrl = createCountUp(this, parseOptions(this));
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
  customElements.define(TAG, CosCountUpElement);
}

export { CosCountUpElement, TAG };
