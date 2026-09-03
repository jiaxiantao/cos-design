import { createSandFall, type SandFallController, type SandFallOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-sand-fall';

function parseOptions(_el: HTMLElement): SandFallOptions {
  void _el;
  const options: SandFallOptions = {};

  return options;
}

class CosSandFallElement extends HTMLElement {
  private ctrl: SandFallController | null = null;

  static get observedAttributes() {
    return [];
  }

  connectedCallback() {
    this.ctrl = createSandFall(this, parseOptions(this));
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
  customElements.define(TAG, CosSandFallElement);
}

export { CosSandFallElement, TAG };
