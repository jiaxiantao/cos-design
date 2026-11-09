import { readNumberAttr, readStringAttr } from '@cos-design/shared';
import { createNewtonCradle, type NewtonCradleController, type NewtonCradleOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-newton-cradle';

function parseOptions(el: HTMLElement): NewtonCradleOptions {
  const options = {} as NewtonCradleOptions;
  readStringAttr(options, el, 'color', 'color');
  readNumberAttr(options, el, 'ballCount', 'ball-count');
  readNumberAttr(options, el, 'width', 'width');
  readNumberAttr(options, el, 'height', 'height');
  return options;
}

class CosNewtonCradleElement extends HTMLElement {
  private ctrl: NewtonCradleController | null = null;

  static get observedAttributes() {
    return ['ball-count', 'color', 'width', 'height'];
  }

  connectedCallback() {
    this.ctrl = createNewtonCradle(this, parseOptions(this));
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
  customElements.define(TAG, CosNewtonCradleElement);
}

export { CosNewtonCradleElement, TAG };
