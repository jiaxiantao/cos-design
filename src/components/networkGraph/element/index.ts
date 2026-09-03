import { createNetworkGraph, type NetworkGraphController, type NetworkGraphOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-network-graph';

function parseOptions(_el: HTMLElement): NetworkGraphOptions {
  void _el;
  const options: NetworkGraphOptions = {};

  return options;
}

class CosNetworkGraphElement extends HTMLElement {
  private ctrl: NetworkGraphController | null = null;

  static get observedAttributes() {
    return [];
  }

  connectedCallback() {
    this.ctrl = createNetworkGraph(this, parseOptions(this));
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
  customElements.define(TAG, CosNetworkGraphElement);
}

export { CosNetworkGraphElement, TAG };
