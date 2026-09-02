import { createTrueFocus, type TrueFocusController, type TrueFocusOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-true-focus';

function parseOptions(el: HTMLElement): TrueFocusOptions {
  const options: TrueFocusOptions = {};
  if (el.hasAttribute('sentence')) options.sentence = el.getAttribute('sentence') ?? undefined;
  if (el.hasAttribute('manual-mode')) options.manualMode = true;
  if (el.hasAttribute('blur-amount')) options.blurAmount = Number(el.getAttribute('blur-amount'));
  if (el.hasAttribute('font-size')) options.fontSize = Number(el.getAttribute('font-size'));
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  return options;
}

class CosTrueFocusElement extends HTMLElement {
  private ctrl: TrueFocusController | null = null;

  static get observedAttributes() {
    return ['sentence', 'manual-mode', 'blur-amount', 'font-size', 'color'];
  }

  connectedCallback() {
    this.ctrl = createTrueFocus(this, parseOptions(this));
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
  customElements.define(TAG, CosTrueFocusElement);
}

export { CosTrueFocusElement, TAG };
