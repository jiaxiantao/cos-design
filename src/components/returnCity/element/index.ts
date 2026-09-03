import { createReturnCity, type ReturnCityController, type ReturnCityOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-return-city';

function parseOptions(el: HTMLElement): ReturnCityOptions {
  const options = {} as ReturnCityOptions;
  if (el.hasAttribute('star-count')) options.starCount = Number(el.getAttribute('star-count'));
  if (el.hasAttribute('glass-count')) options.glassCount = Number(el.getAttribute('glass-count'));
  if (el.hasAttribute('glass-radius'))
    options.glassRadius = Number(el.getAttribute('glass-radius'));
  return options;
}

class CosReturnCityElement extends HTMLElement {
  private ctrl: ReturnCityController | null = null;

  static get observedAttributes() {
    return ['star-count', 'glass-count', 'glass-radius'];
  }

  connectedCallback() {
    this.ctrl = createReturnCity(this, parseOptions(this));
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
  customElements.define(TAG, CosReturnCityElement);
}

export { CosReturnCityElement, TAG };
