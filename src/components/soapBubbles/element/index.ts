import { readBooleanAttr, readNumberAttr, readStringAttr } from '@cos-design/shared';
import { createSoapBubbles, type SoapBubblesController, type SoapBubblesOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-soap-bubbles';

function parseOptions(el: HTMLElement): SoapBubblesOptions {
  const options = {} as SoapBubblesOptions;
  readStringAttr(options, el, 'ariaLabel', 'aria-label');
  readNumberAttr(options, el, 'width', 'width');
  readNumberAttr(options, el, 'height', 'height');
  readNumberAttr(options, el, 'count', 'count');
  readNumberAttr(options, el, 'speed', 'speed');
  readBooleanAttr(options, el, 'fill', 'fill', 'presence');
  readBooleanAttr(options, el, 'interactive', 'interactive', 'optional-true');
  return options;
}

class CosSoapBubblesElement extends HTMLElement {
  private ctrl: SoapBubblesController | null = null;

  static get observedAttributes() {
    return ['width', 'height', 'fill', 'count', 'speed', 'interactive', 'aria-label'];
  }

  connectedCallback() {
    this.ctrl = createSoapBubbles(this, parseOptions(this));
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
  customElements.define(TAG, CosSoapBubblesElement);
}

export { CosSoapBubblesElement, TAG };
