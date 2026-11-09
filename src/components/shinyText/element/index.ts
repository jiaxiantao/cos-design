import { readBooleanAttr, readNumberAttr, readStringAttr } from '@cos-design/shared';
import { createShinyText, type ShinyTextController, type ShinyTextOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-shiny-text';

function parseOptions(el: HTMLElement): ShinyTextOptions {
  const options = {} as ShinyTextOptions;
  readStringAttr(options, el, 'text', 'text');
  readStringAttr(options, el, 'color', 'color');
  readStringAttr(options, el, 'shineColor', 'shine-color');
  readNumberAttr(options, el, 'speed', 'speed');
  readNumberAttr(options, el, 'fontSize', 'font-size');
  readBooleanAttr(options, el, 'disabled', 'disabled', 'optional-true');
  return options;
}

class CosShinyTextElement extends HTMLElement {
  private ctrl: ShinyTextController | null = null;

  static get observedAttributes() {
    return ['text', 'speed', 'color', 'shine-color', 'font-size', 'disabled'];
  }

  connectedCallback() {
    this.ctrl = createShinyText(this, parseOptions(this));
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
  customElements.define(TAG, CosShinyTextElement);
}

export { CosShinyTextElement, TAG };
