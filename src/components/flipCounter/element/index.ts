import { readBooleanAttr, readNumberAttr, readStringAttr } from '@cos-design/shared';
import { createFlipCounter, type FlipCounterController, type FlipCounterOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-flip-counter';

function parseOptions(el: HTMLElement): FlipCounterOptions {
  const options = {} as FlipCounterOptions;
  readStringAttr(options, el, 'color', 'color');
  readNumberAttr(options, el, 'value', 'value');
  readNumberAttr(options, el, 'digits', 'digits');
  readNumberAttr(options, el, 'duration', 'duration');
  readNumberAttr(options, el, 'autoInterval', 'auto-interval');
  readBooleanAttr(options, el, 'auto', 'auto', 'optional-true');
  return options;
}

class CosFlipCounterElement extends HTMLElement {
  private ctrl: FlipCounterController | null = null;

  static get observedAttributes() {
    return ['value', 'digits', 'color', 'duration', 'auto', 'auto-interval'];
  }

  connectedCallback() {
    this.ctrl = createFlipCounter(this, parseOptions(this));
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
  customElements.define(TAG, CosFlipCounterElement);
}

export { CosFlipCounterElement, TAG };
