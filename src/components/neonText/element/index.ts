import { readBooleanAttr, readNumberAttr, readStringAttr } from '@cos-design/shared';
import { createNeonText, type NeonTextController, type NeonTextOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-neon-text';

function parseOptions(el: HTMLElement): NeonTextOptions {
  const options = {} as NeonTextOptions;
  readStringAttr(options, el, 'text', 'text');
  readStringAttr(options, el, 'color', 'color');
  readNumberAttr(options, el, 'fontSize', 'font-size');
  readBooleanAttr(options, el, 'flicker', 'flicker', 'presence');
  return options;
}

class CosNeonTextElement extends HTMLElement {
  private ctrl: NeonTextController | null = null;

  static get observedAttributes() {
    return ['text', 'color', 'font-size', 'flicker'];
  }

  connectedCallback() {
    this.ctrl = createNeonText(this, parseOptions(this));
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
  customElements.define(TAG, CosNeonTextElement);
}

export { CosNeonTextElement, TAG };
