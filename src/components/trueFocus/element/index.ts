import { createTrueFocus, type TrueFocusController, type TrueFocusOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-true-focus';

function parseOptions(el: HTMLElement): TrueFocusOptions {
  const options = {} as TrueFocusOptions;
  if (el.hasAttribute('sentence')) options.sentence = el.getAttribute('sentence') ?? undefined;
  if (el.hasAttribute('separator')) options.separator = el.getAttribute('separator') ?? undefined;
  if (el.hasAttribute('border-color'))
    options.borderColor = el.getAttribute('border-color') ?? undefined;
  if (el.hasAttribute('glow-color')) options.glowColor = el.getAttribute('glow-color') ?? undefined;
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  if (el.hasAttribute('blur-amount')) options.blurAmount = Number(el.getAttribute('blur-amount'));
  if (el.hasAttribute('animation-duration'))
    options.animationDuration = Number(el.getAttribute('animation-duration'));
  if (el.hasAttribute('pause-between-animations'))
    options.pauseBetweenAnimations = Number(el.getAttribute('pause-between-animations'));
  if (el.hasAttribute('font-size')) options.fontSize = Number(el.getAttribute('font-size'));
  options.manualMode = el.hasAttribute('manual-mode');
  return options;
}

class CosTrueFocusElement extends HTMLElement {
  private ctrl: TrueFocusController | null = null;

  static get observedAttributes() {
    return [
      'sentence',
      'separator',
      'manual-mode',
      'blur-amount',
      'border-color',
      'glow-color',
      'animation-duration',
      'pause-between-animations',
      'font-size',
      'color',
    ];
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
