import { createMatrixRain, type MatrixRainController, type MatrixRainOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-matrix-rain';

function parseOptions(_el: HTMLElement): MatrixRainOptions {
  void _el;
  const options: MatrixRainOptions = {};

  return options;
}

class CosMatrixRainElement extends HTMLElement {
  private ctrl: MatrixRainController | null = null;

  static get observedAttributes() {
    return [];
  }

  connectedCallback() {
    this.ctrl = createMatrixRain(this, parseOptions(this));
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
  customElements.define(TAG, CosMatrixRainElement);
}

export { CosMatrixRainElement, TAG };
