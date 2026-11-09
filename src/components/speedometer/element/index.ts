import { readNumberAttr, readStringAttr } from '@cos-design/shared';
import { createSpeedometer, type SpeedometerController, type SpeedometerOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-speedometer';

function parseOptions(el: HTMLElement): SpeedometerOptions {
  const options = {} as SpeedometerOptions;
  readStringAttr(options, el, 'label', 'label');
  readStringAttr(options, el, 'color', 'color');
  readNumberAttr(options, el, 'value', 'value');
  readNumberAttr(options, el, 'max', 'max');
  return options;
}

class CosSpeedometerElement extends HTMLElement {
  private ctrl: SpeedometerController | null = null;

  static get observedAttributes() {
    return ['value', 'max', 'label', 'color'];
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
