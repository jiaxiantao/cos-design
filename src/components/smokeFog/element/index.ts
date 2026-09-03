import { createSmokeFog, type SmokeFogController, type SmokeFogOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-smoke-fog';

function parseOptions(_el: HTMLElement): SmokeFogOptions {
  void _el;
  const options: SmokeFogOptions = {};

  return options;
}

class CosSmokeFogElement extends HTMLElement {
  private ctrl: SmokeFogController | null = null;

  static get observedAttributes() {
    return [];
  }

  connectedCallback() {
    this.ctrl = createSmokeFog(this, parseOptions(this));
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
  customElements.define(TAG, CosSmokeFogElement);
}

export { CosSmokeFogElement, TAG };
