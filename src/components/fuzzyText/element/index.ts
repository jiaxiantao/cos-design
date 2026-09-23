import { createFuzzyText, type FuzzyTextController, type FuzzyTextOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-fuzzy-text';

function parseOptions(el: HTMLElement): FuzzyTextOptions {
  const options = {} as FuzzyTextOptions;
  if (el.hasAttribute('text')) options.text = el.getAttribute('text') ?? undefined;
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  if (el.hasAttribute('font-size')) options.fontSize = Number(el.getAttribute('font-size'));
  if (el.hasAttribute('font-weight')) options.fontWeight = Number(el.getAttribute('font-weight'));
  if (el.hasAttribute('base-intensity'))
    options.baseIntensity = Number(el.getAttribute('base-intensity'));
  if (el.hasAttribute('hover-intensity'))
    options.hoverIntensity = Number(el.getAttribute('hover-intensity'));
  if (el.hasAttribute('fuzz-range')) options.fuzzRange = Number(el.getAttribute('fuzz-range'));
  options.enableHover = el.hasAttribute('enable-hover');
  return options;
}

class CosFuzzyTextElement extends HTMLElement {
  private ctrl: FuzzyTextController | null = null;

  static get observedAttributes() {
    return [
      'text',
      'font-size',
      'font-weight',
      'color',
      'base-intensity',
      'hover-intensity',
      'enable-hover',
      'fuzz-range',
    ];
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
