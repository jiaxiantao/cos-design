import {
  readNumberAttr,
} from '@cos-design/shared';
import { createReturnCity, type ReturnCityController, type ReturnCityOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-return-city';

function parseOptions(el: HTMLElement): ReturnCityOptions {
  const options = {} as ReturnCityOptions;
  readNumberAttr(options, el, 'starCount', 'star-count');
  readNumberAttr(options, el, 'glassCount', 'glass-count');
  readNumberAttr(options, el, 'glassRadius', 'glass-radius');
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
