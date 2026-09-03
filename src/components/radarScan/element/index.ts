import { createRadarScan, type RadarScanController, type RadarScanOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-radar-scan';

function parseOptions(_el: HTMLElement): RadarScanOptions {
  void _el;
  const options: RadarScanOptions = {};

  return options;
}

class CosRadarScanElement extends HTMLElement {
  private ctrl: RadarScanController | null = null;

  static get observedAttributes() {
    return [];
  }

  connectedCallback() {
    this.ctrl = createRadarScan(this, parseOptions(this));
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
  customElements.define(TAG, CosRadarScanElement);
}

export { CosRadarScanElement, TAG };
