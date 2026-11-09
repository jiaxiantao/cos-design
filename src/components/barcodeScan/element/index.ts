import {
  readJsonAttr,
  readNumberAttr,
  readPropertyOverride,
  readStringAttr,
} from '@cos-design/shared';
import { createBarcodeScan, type BarcodeScanController, type BarcodeScanOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-barcode-scan';

function parseOptions(el: HTMLElement): BarcodeScanOptions {
  const options = {} as BarcodeScanOptions;
  readStringAttr(options, el, 'scanColor', 'scan-color');
  readStringAttr(options, el, 'defaultContent', 'default-content');
  readNumberAttr(options, el, 'speed', 'speed');
  readJsonAttr(options, el, 'slotElement', 'slot-element');
  readPropertyOverride(options, el, 'slotElement', '_slotElement');
  return options;
}

class CosBarcodeScanElement extends HTMLElement {
  private ctrl: BarcodeScanController | null = null;

  _slotElement?: BarcodeScanOptions['slotElement'];
  get slotElement(): BarcodeScanOptions['slotElement'] | undefined {
    return this._slotElement;
  }
  set slotElement(value: BarcodeScanOptions['slotElement']) {
    this._slotElement = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return ['scan-color', 'speed', 'slot-element', 'default-content'];
  }

  connectedCallback() {
    this.ctrl = createBarcodeScan(this, parseOptions(this));
  }

  disconnectedCallback() {
    this.ctrl?.destroy();
    this.ctrl = null;
  }

  attributeChangedCallback() {
    this.ctrl?.update(parseOptions(this));
  }

  getSlot() {
    return this.ctrl?.getSlot();
  }
}

if (typeof customElements !== 'undefined' && !customElements.get(TAG)) {
  customElements.define(TAG, CosBarcodeScanElement);
}

export { CosBarcodeScanElement, TAG };
