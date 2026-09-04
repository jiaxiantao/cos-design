import { createCharge, type ChargeController, type ChargeOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-charge';

function parseOptions(el: HTMLElement): ChargeOptions {
  const options = {} as ChargeOptions;
  if (el.hasAttribute('init-quantity'))
    options.initQuantity = Number(el.getAttribute('init-quantity'));
  if (el.hasAttribute('value')) options.value = Number(el.getAttribute('value'));
  if (el.hasAttribute('interval')) options.interval = Number(el.getAttribute('interval'));
  if (el.hasAttribute('step')) options.step = Number(el.getAttribute('step'));
  // Only override when attribute is present — omit keeps engine default (true).
  // Supports auto-charge="false" from playground / explicit opt-out.
  if (el.hasAttribute('auto-charge')) {
    const raw = el.getAttribute('auto-charge');
    options.autoCharge = raw !== 'false' && raw !== '0';
  }
  options.onChange = (...args: unknown[]) => {
    el.dispatchEvent(
      new CustomEvent('change', { detail: args.length <= 1 ? args[0] : args, bubbles: true }),
    );
  };
  options.onComplete = (...args: unknown[]) => {
    el.dispatchEvent(
      new CustomEvent('complete', { detail: args.length <= 1 ? args[0] : args, bubbles: true }),
    );
  };
  return options;
}

class CosChargeElement extends HTMLElement {
  private ctrl: ChargeController | null = null;

  static get observedAttributes() {
    return ['init-quantity', 'value', 'auto-charge', 'interval', 'step'];
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
