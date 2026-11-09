import {
  readBooleanAttr,
  readNumberAttr,
  readStringAttr,
} from '@cos-design/shared';
import { createMatrixRain, type MatrixRainController, type MatrixRainOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-matrix-rain';

function parseOptions(el: HTMLElement): MatrixRainOptions {
  const options = {} as MatrixRainOptions;
  readStringAttr(options, el, 'color', 'color');
  readStringAttr(options, el, 'title', 'title');
  readStringAttr(options, el, 'subtitle', 'subtitle');
  readNumberAttr(options, el, 'width', 'width');
  readNumberAttr(options, el, 'height', 'height');
  readNumberAttr(options, el, 'density', 'density');
  readBooleanAttr(options, el, 'fill', 'fill', 'presence');
  readBooleanAttr(options, el, 'showOverlay', 'show-overlay', 'presence');
  return options;
}

class CosMatrixRainElement extends HTMLElement {
  private ctrl: MatrixRainController | null = null;


  static get observedAttributes() {
    return ['width', 'height', 'fill', 'density', 'color', 'show-overlay', 'title', 'subtitle'];
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
