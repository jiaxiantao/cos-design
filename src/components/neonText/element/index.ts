import { createNeonText, type NeonTextController, type NeonTextOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-neon-text';

function parseOptions(el: HTMLElement): NeonTextOptions {
  const options = {} as NeonTextOptions;
  if (el.hasAttribute('text')) options.text = el.getAttribute('text') ?? undefined;
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  if (el.hasAttribute('font-size')) options.fontSize = Number(el.getAttribute('font-size'));
  options.flicker = el.hasAttribute('flicker');
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
