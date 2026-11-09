import {
  optionCallbackDispatcher,
  readBooleanAttr,
  readNumberAttr,
} from '@cos-design/shared';
import { createCharge, type ChargeController, type ChargeOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-charge';

function parseOptions(el: HTMLElement): ChargeOptions {
  const options = {} as ChargeOptions;
  readNumberAttr(options, el, 'initQuantity', 'init-quantity');
  readNumberAttr(options, el, 'value', 'value');
  readNumberAttr(options, el, 'interval', 'interval');
  readNumberAttr(options, el, 'step', 'step');
  readBooleanAttr(options, el, 'autoCharge', 'auto-charge', 'presence');
  options.onChange = optionCallbackDispatcher(el, 'change');
  options.onComplete = optionCallbackDispatcher(el, 'complete');
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
