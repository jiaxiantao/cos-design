import { createCyberGrid, type CyberGridController, type CyberGridOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-cyber-grid';

function parseOptions(_el: HTMLElement): CyberGridOptions {
  void _el;
  const options: CyberGridOptions = {};

  return options;
}

class CosCyberGridElement extends HTMLElement {
  private ctrl: CyberGridController | null = null;

  static get observedAttributes() {
    return [];
  }

  connectedCallback() {
    this.ctrl = createCyberGrid(this, parseOptions(this));
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
  customElements.define(TAG, CosCyberGridElement);
}

export { CosCyberGridElement, TAG };
