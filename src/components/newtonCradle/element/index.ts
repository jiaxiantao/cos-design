import { createNewtonCradle, type NewtonCradleController, type NewtonCradleOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-newton-cradle';

function parseOptions(el: HTMLElement): NewtonCradleOptions {
  const options = {} as NewtonCradleOptions;
  if (el.hasAttribute('ball-count')) options.ballCount = Number(el.getAttribute('ball-count'));
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
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
