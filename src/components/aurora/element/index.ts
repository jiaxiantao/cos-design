import { createAurora, type AuroraController, type AuroraOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-aurora';

function parseOptions(_el: HTMLElement): AuroraOptions {
  void _el;
  const options: AuroraOptions = {};

  return options;
}

class CosAuroraElement extends HTMLElement {
  private ctrl: AuroraController | null = null;

  static get observedAttributes() {
    return [];
  }

  connectedCallback() {
    this.ctrl = createAurora(this, parseOptions(this));
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
  customElements.define(TAG, CosAuroraElement);
}

export { CosAuroraElement, TAG };
