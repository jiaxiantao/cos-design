import { createRopeChain, type RopeChainController, type RopeChainOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-rope-chain';

function parseOptions(_el: HTMLElement): RopeChainOptions {
  void _el;
  const options: RopeChainOptions = {};

  return options;
}

class CosRopeChainElement extends HTMLElement {
  private ctrl: RopeChainController | null = null;

  static get observedAttributes() {
    return [];
  }

  connectedCallback() {
    this.ctrl = createRopeChain(this, parseOptions(this));
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
  customElements.define(TAG, CosRopeChainElement);
}

export { CosRopeChainElement, TAG };
