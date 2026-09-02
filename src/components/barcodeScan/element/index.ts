import { createBarcodeScan, type BarcodeScanController, type BarcodeScanOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-barcode-scan';

function parseOptions(el: HTMLElement): BarcodeScanOptions {
  const options: BarcodeScanOptions = {};
  if (el.hasAttribute('scan-color')) options.scanColor = el.getAttribute('scan-color') ?? undefined;
  if (el.hasAttribute('speed')) options.speed = Number(el.getAttribute('speed'));
  return options;
}

class CosBarcodeScanElement extends HTMLElement {
  private ctrl: BarcodeScanController | null = null;

  static get observedAttributes() {
    return ['scan-color', 'speed'];
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
}

if (typeof customElements !== 'undefined' && !customElements.get(TAG)) {
  customElements.define(TAG, CosBarcodeScanElement);
}

export { CosBarcodeScanElement, TAG };
