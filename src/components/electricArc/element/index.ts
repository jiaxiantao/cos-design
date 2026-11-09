import {
  readNumberAttr,
  readStringAttr,
} from '@cos-design/shared';
import { createElectricArc, type ElectricArcController, type ElectricArcOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-electric-arc';

function parseOptions(el: HTMLElement): ElectricArcOptions {
  const options = {} as ElectricArcOptions;
  readStringAttr(options, el, 'color', 'color');
  readNumberAttr(options, el, 'width', 'width');
  readNumberAttr(options, el, 'height', 'height');
  return options;
}

class CosElectricArcElement extends HTMLElement {
  private ctrl: ElectricArcController | null = null;


  static get observedAttributes() {
    return ['width', 'height', 'color'];
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
