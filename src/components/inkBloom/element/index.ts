import { readBooleanAttr, readNumberAttr, readStringAttr } from '@cos-design/shared';
import { createInkBloom, type InkBloomController, type InkBloomOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-ink-bloom';

function parseOptions(el: HTMLElement): InkBloomOptions {
  const options = {} as InkBloomOptions;
  readStringAttr(options, el, 'inkColor', 'ink-color');
  readStringAttr(options, el, 'ariaLabel', 'aria-label');
  readNumberAttr(options, el, 'width', 'width');
  readNumberAttr(options, el, 'height', 'height');
  readNumberAttr(options, el, 'speed', 'speed');
  readBooleanAttr(options, el, 'fill', 'fill', 'presence');
  readBooleanAttr(options, el, 'interactive', 'interactive', 'optional-true');
  return options;
}

class CosInkBloomElement extends HTMLElement {
  private ctrl: InkBloomController | null = null;

  static get observedAttributes() {
    return ['width', 'height', 'fill', 'ink-color', 'speed', 'interactive', 'aria-label'];
  }

  connectedCallback() {
    this.ctrl = createInkBloom(this, parseOptions(this));
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
  customElements.define(TAG, CosInkBloomElement);
}

export { CosInkBloomElement, TAG };
