import { createClickSpark, type ClickSparkController, type ClickSparkOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-click-spark';

function parseOptions(_el: HTMLElement): ClickSparkOptions {
  void _el;
  const options: ClickSparkOptions = {};

  return options;
}

class CosClickSparkElement extends HTMLElement {
  private ctrl: ClickSparkController | null = null;

  static get observedAttributes() {
    return [];
  }

  connectedCallback() {
    this.ctrl = createClickSpark(this, parseOptions(this));
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
  customElements.define(TAG, CosClickSparkElement);
}

export { CosClickSparkElement, TAG };
