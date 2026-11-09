import { readNumberAttr, readStringAttr } from '@cos-design/shared';
import { createCountUp, type CountUpController, type CountUpOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-count-up';

function parseOptions(el: HTMLElement): CountUpOptions {
  const options = {} as CountUpOptions;
  readStringAttr(options, el, 'prefix', 'prefix');
  readStringAttr(options, el, 'suffix', 'suffix');
  readStringAttr(options, el, 'color', 'color');
  readNumberAttr(options, el, 'value', 'value');
  readNumberAttr(options, el, 'start', 'start');
  readNumberAttr(options, el, 'duration', 'duration');
  readNumberAttr(options, el, 'decimals', 'decimals');
  return options;
}

class CosCountUpElement extends HTMLElement {
  private ctrl: CountUpController | null = null;

  static get observedAttributes() {
    return ['value', 'start', 'duration', 'decimals', 'prefix', 'suffix', 'color'];
  }

  connectedCallback() {
    this.ctrl = createCountUp(this, parseOptions(this));
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
  customElements.define(TAG, CosCountUpElement);
}

export { CosCountUpElement, TAG };
