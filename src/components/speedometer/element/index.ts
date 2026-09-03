import { createSpeedometer, type SpeedometerController, type SpeedometerOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-speedometer';

function parseOptions(_el: HTMLElement): SpeedometerOptions {
  void _el;
  const options: SpeedometerOptions = {};

  return options;
}

class CosSpeedometerElement extends HTMLElement {
  private ctrl: SpeedometerController | null = null;

  static get observedAttributes() {
    return [];
  }

  connectedCallback() {
    this.ctrl = createSpeedometer(this, parseOptions(this));
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
  customElements.define(TAG, CosSpeedometerElement);
}

export { CosSpeedometerElement, TAG };
