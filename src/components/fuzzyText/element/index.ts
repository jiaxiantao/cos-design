import { createFuzzyText, type FuzzyTextController, type FuzzyTextOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-fuzzy-text';

function parseOptions(el: HTMLElement): FuzzyTextOptions {
  const options: FuzzyTextOptions = {};
  if (el.hasAttribute('text')) options.text = el.getAttribute('text') ?? undefined;
  if (el.hasAttribute('font-size')) options.fontSize = Number(el.getAttribute('font-size'));
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  if (el.hasAttribute('enable-hover')) options.enableHover = true;
  return options;
}

class CosFuzzyTextElement extends HTMLElement {
  private ctrl: FuzzyTextController | null = null;

  static get observedAttributes() {
    return ['text', 'font-size', 'color', 'enable-hover'];
  }

  connectedCallback() {
    this.ctrl = createFuzzyText(this, parseOptions(this));
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
  customElements.define(TAG, CosFuzzyTextElement);
}

export { CosFuzzyTextElement, TAG };
