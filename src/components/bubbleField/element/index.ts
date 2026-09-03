import { createBubbleField, type BubbleFieldController, type BubbleFieldOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-bubble-field';

function parseOptions(_el: HTMLElement): BubbleFieldOptions {
  void _el;
  const options: BubbleFieldOptions = {};

  return options;
}

class CosBubbleFieldElement extends HTMLElement {
  private ctrl: BubbleFieldController | null = null;

  static get observedAttributes() {
    return [];
  }

  connectedCallback() {
    this.ctrl = createBubbleField(this, parseOptions(this));
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
  customElements.define(TAG, CosBubbleFieldElement);
}

export { CosBubbleFieldElement, TAG };
