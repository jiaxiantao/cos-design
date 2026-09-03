import { createCountdown, type CountdownController, type CountdownOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-countdown';

function parseOptions(_el: HTMLElement): CountdownOptions {
  void _el;
  const options: CountdownOptions = {};

  return options;
}

class CosCountdownElement extends HTMLElement {
  private ctrl: CountdownController | null = null;

  static get observedAttributes() {
    return [];
  }

  connectedCallback() {
    this.ctrl = createCountdown(this, parseOptions(this));
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
  customElements.define(TAG, CosCountdownElement);
}

export { CosCountdownElement, TAG };
