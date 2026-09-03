import { createSnowfall, type SnowfallController, type SnowfallOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-snowfall';

function parseOptions(_el: HTMLElement): SnowfallOptions {
  void _el;
  const options: SnowfallOptions = {};

  return options;
}

class CosSnowfallElement extends HTMLElement {
  private ctrl: SnowfallController | null = null;

  static get observedAttributes() {
    return [];
  }

  connectedCallback() {
    this.ctrl = createSnowfall(this, parseOptions(this));
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
  customElements.define(TAG, CosSnowfallElement);
}

export { CosSnowfallElement, TAG };
