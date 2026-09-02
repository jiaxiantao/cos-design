import { createRotatingText, type RotatingTextController, type RotatingTextOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-rotating-text';

function parseOptions(el: HTMLElement): RotatingTextOptions {
  const options: RotatingTextOptions = {};
  if (el.hasAttribute('interval')) options.interval = Number(el.getAttribute('interval'));
  if (el.hasAttribute('font-size')) options.fontSize = Number(el.getAttribute('font-size'));
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  return options;
}

class CosRotatingTextElement extends HTMLElement {
  private ctrl: RotatingTextController | null = null;

  static get observedAttributes() {
    return ['interval', 'font-size', 'color'];
  }

  connectedCallback() {
    this.ctrl = createRotatingText(this, parseOptions(this));
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
  customElements.define(TAG, CosRotatingTextElement);
}

export { CosRotatingTextElement, TAG };
