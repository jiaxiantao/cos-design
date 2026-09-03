import { createBarcodeScan, type BarcodeScanController, type BarcodeScanOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-barcode-scan';

function parseOptions(el: HTMLElement): BarcodeScanOptions {
  const options = {} as BarcodeScanOptions;
  if (el.hasAttribute('scan-color')) options.scanColor = el.getAttribute('scan-color') ?? undefined;
  if (el.hasAttribute('default-content'))
    options.defaultContent = el.getAttribute('default-content') ?? undefined;
  if (el.hasAttribute('speed')) options.speed = Number(el.getAttribute('speed'));
  if (el.hasAttribute('slot-element')) {
    try {
      options.slotElement = JSON.parse(
        el.getAttribute('slot-element') ?? 'null',
      ) as BarcodeScanOptions['slotElement'];
    } catch {
      /* ignore invalid JSON */
    }
  }
  const propslotElement = (el as CosBarcodeScanElement)._slotElement;
  if (propslotElement !== undefined)
    options.slotElement = propslotElement as BarcodeScanOptions['slotElement'];
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
