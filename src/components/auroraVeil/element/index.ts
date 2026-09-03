import { createAuroraVeil, type AuroraVeilController, type AuroraVeilOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-aurora-veil';

function parseOptions(_el: HTMLElement): AuroraVeilOptions {
  void _el;
  const options: AuroraVeilOptions = {};

  return options;
}

class CosAuroraVeilElement extends HTMLElement {
  private ctrl: AuroraVeilController | null = null;

  static get observedAttributes() {
    return [];
  }

  connectedCallback() {
    this.ctrl = createAuroraVeil(this, parseOptions(this));
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
  customElements.define(TAG, CosAuroraVeilElement);
}

export { CosAuroraVeilElement, TAG };
