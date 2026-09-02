import { createCharge, type ChargeController, type ChargeOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-charge';

function parseOptions(el: HTMLElement): ChargeOptions {
  const options: ChargeOptions = {};
  if (el.hasAttribute('init-quantity')) options.initQuantity = Number(el.getAttribute('init-quantity'));
  if (el.hasAttribute('value')) options.value = Number(el.getAttribute('value'));
  if (el.hasAttribute('auto-charge')) options.autoCharge = true;
  if (el.hasAttribute('interval')) options.interval = Number(el.getAttribute('interval'));
  options.onComplete = () => el.dispatchEvent(new CustomEvent('complete', { bubbles: true }));
  return options;
}

class CosChargeElement extends HTMLElement {
  private ctrl: ChargeController | null = null;

  static get observedAttributes() {
    return ['init-quantity', 'value', 'auto-charge', 'interval'];
  }

  connectedCallback() {
    this.ctrl = createCharge(this, parseOptions(this));
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
  customElements.define(TAG, CosChargeElement);
}

export { CosChargeElement, TAG };
