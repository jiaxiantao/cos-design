import { createSpeedometer, type SpeedometerController, type SpeedometerOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-speedometer';

function parseOptions(el: HTMLElement): SpeedometerOptions {
  const options = {} as SpeedometerOptions;
  if (el.hasAttribute('label')) options.label = el.getAttribute('label') ?? undefined;
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  if (el.hasAttribute('value')) options.value = Number(el.getAttribute('value'));
  if (el.hasAttribute('max')) options.max = Number(el.getAttribute('max'));
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
