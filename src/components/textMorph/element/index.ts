import { createTextMorph, type TextMorphController, type TextMorphOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-text-morph';

function parseOptions(el: HTMLElement): TextMorphOptions {
  const options: TextMorphOptions = {};
  if (el.hasAttribute('interval')) options.interval = Number(el.getAttribute('interval'));
  if (el.hasAttribute('duration')) options.duration = Number(el.getAttribute('duration'));
  if (el.hasAttribute('font-size')) options.fontSize = Number(el.getAttribute('font-size'));
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  return options;
}

class CosTextMorphElement extends HTMLElement {
  private ctrl: TextMorphController | null = null;

  static get observedAttributes() {
    return ['interval', 'duration', 'font-size', 'color'];
  }

  connectedCallback() {
    this.ctrl = createTextMorph(this, parseOptions(this));
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
  customElements.define(TAG, CosTextMorphElement);
}

export { CosTextMorphElement, TAG };
