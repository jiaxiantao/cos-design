import {
  createDandelionField,
  type DandelionFieldController,
  type DandelionFieldOptions,
} from '../core';
import '../style/index.css';

const TAG = 'cos-dandelion-field';

function parseOptions(_el: HTMLElement): DandelionFieldOptions {
  void _el;
  const options: DandelionFieldOptions = {};

  return options;
}

class CosDandelionFieldElement extends HTMLElement {
  private ctrl: DandelionFieldController | null = null;

  static get observedAttributes() {
    return [];
  }

  connectedCallback() {
    this.ctrl = createDandelionField(this, parseOptions(this));
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
  customElements.define(TAG, CosDandelionFieldElement);
}

export { CosDandelionFieldElement, TAG };
