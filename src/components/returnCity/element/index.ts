import { createReturnCity, type ReturnCityController, type ReturnCityOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-return-city';

function parseOptions(_el: HTMLElement): ReturnCityOptions {
  void _el;
  const options: ReturnCityOptions = {};

  return options;
}

class CosReturnCityElement extends HTMLElement {
  private ctrl: ReturnCityController | null = null;

  static get observedAttributes() {
    return [];
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
