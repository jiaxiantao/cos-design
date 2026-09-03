import { createElectricArc, type ElectricArcController, type ElectricArcOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-electric-arc';

function parseOptions(_el: HTMLElement): ElectricArcOptions {
  void _el;
  const options: ElectricArcOptions = {};

  return options;
}

class CosElectricArcElement extends HTMLElement {
  private ctrl: ElectricArcController | null = null;

  static get observedAttributes() {
    return [];
  }

  connectedCallback() {
    this.ctrl = createElectricArc(this, parseOptions(this));
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
  customElements.define(TAG, CosElectricArcElement);
}

export { CosElectricArcElement, TAG };
