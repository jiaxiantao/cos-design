import { readNumberAttr, readStringAttr } from '@cos-design/shared';
import { createScrambleText, type ScrambleTextController, type ScrambleTextOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-scramble-text';

function parseOptions(el: HTMLElement): ScrambleTextOptions {
  const options = {} as ScrambleTextOptions;
  readStringAttr(options, el, 'text', 'text');
  readStringAttr(options, el, 'charset', 'charset');
  readNumberAttr(options, el, 'duration', 'duration');
  return options;
}

class CosScrambleTextElement extends HTMLElement {
  private ctrl: ScrambleTextController | null = null;

  static get observedAttributes() {
    return ['text', 'duration', 'charset'];
  }

  connectedCallback() {
    this.ctrl = createScrambleText(this, parseOptions(this));
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
  customElements.define(TAG, CosScrambleTextElement);
}

export { CosScrambleTextElement, TAG };
