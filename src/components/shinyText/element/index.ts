import { createShinyText, type ShinyTextController, type ShinyTextOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-shiny-text';

function parseOptions(el: HTMLElement): ShinyTextOptions {
  const options: ShinyTextOptions = {};
  if (el.hasAttribute('text')) options.text = el.getAttribute('text') ?? undefined;
  if (el.hasAttribute('speed')) options.speed = Number(el.getAttribute('speed'));
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  if (el.hasAttribute('shine-color')) options.shineColor = el.getAttribute('shine-color') ?? undefined;
  if (el.hasAttribute('font-size')) options.fontSize = Number(el.getAttribute('font-size'));
  if (el.hasAttribute('disabled')) options.disabled = true;
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
