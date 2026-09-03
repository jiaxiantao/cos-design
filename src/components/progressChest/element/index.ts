import { createProgressChest, type ProgressChestController, type ProgressChestOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-progress-chest';

function parseOptions(_el: HTMLElement): ProgressChestOptions {
  void _el;
  const options: ProgressChestOptions = {};

  return options;
}

class CosProgressChestElement extends HTMLElement {
  private ctrl: ProgressChestController | null = null;

  static get observedAttributes() {
    return [];
  }

  connectedCallback() {
    this.ctrl = createProgressChest(this, parseOptions(this));
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
  customElements.define(TAG, CosProgressChestElement);
}

export { CosProgressChestElement, TAG };
