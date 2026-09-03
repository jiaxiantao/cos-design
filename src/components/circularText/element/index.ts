import { createCircularText, type CircularTextController, type CircularTextOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-circular-text';

function parseOptions(el: HTMLElement): CircularTextOptions {
  const options: CircularTextOptions = {};
  if (el.hasAttribute('text')) options.text = el.getAttribute('text') ?? undefined;
  if (el.hasAttribute('spin-duration'))
    options.spinDuration = Number(el.getAttribute('spin-duration'));
  if (el.hasAttribute('font-size')) options.fontSize = Number(el.getAttribute('font-size'));
  if (el.hasAttribute('radius')) options.radius = Number(el.getAttribute('radius'));
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  return options;
}

class CosCircularTextElement extends HTMLElement {
  private ctrl: CircularTextController | null = null;

  static get observedAttributes() {
    return ['text', 'spin-duration', 'font-size', 'radius', 'color'];
  }

  connectedCallback() {
    this.ctrl = createCircularText(this, parseOptions(this));
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
  customElements.define(TAG, CosCircularTextElement);
}

export { CosCircularTextElement, TAG };
