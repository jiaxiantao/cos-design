import { createRadarScan, type RadarScanController, type RadarScanOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-radar-scan';

function parseOptions(el: HTMLElement): RadarScanOptions {
  const options = {} as RadarScanOptions;
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  if (el.hasAttribute('size')) options.size = Number(el.getAttribute('size'));
  if (el.hasAttribute('blip-count')) options.blipCount = Number(el.getAttribute('blip-count'));
  return options;
}

class CosRadarScanElement extends HTMLElement {
  private ctrl: RadarScanController | null = null;

  static get observedAttributes() {
    return ['size', 'color', 'blip-count'];
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
