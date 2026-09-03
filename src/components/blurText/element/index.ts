import { createBlurText, type BlurTextController, type BlurTextOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-blur-text';

function parseOptions(el: HTMLElement): BlurTextOptions {
  const options: BlurTextOptions = {};
  if (el.hasAttribute('text')) options.text = el.getAttribute('text') ?? undefined;
  if (el.hasAttribute('animate-by'))
    options.animateBy = el.getAttribute('animate-by') as BlurTextOptions['animateBy'];
  if (el.hasAttribute('direction'))
    options.direction = el.getAttribute('direction') as BlurTextOptions['direction'];
  if (el.hasAttribute('stagger')) options.stagger = Number(el.getAttribute('stagger'));
  if (el.hasAttribute('duration')) options.duration = Number(el.getAttribute('duration'));
  if (el.hasAttribute('font-size')) options.fontSize = Number(el.getAttribute('font-size'));
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  options.onAnimationComplete = () =>
    el.dispatchEvent(new CustomEvent('animation-complete', { bubbles: true }));
  return options;
}

class CosBlurTextElement extends HTMLElement {
  private ctrl: BlurTextController | null = null;

  static get observedAttributes() {
    return ['text', 'animate-by', 'direction', 'stagger', 'duration', 'font-size', 'color'];
  }

  connectedCallback() {
    this.ctrl = createBlurText(this, parseOptions(this));
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
  customElements.define(TAG, CosBlurTextElement);
}

export { CosBlurTextElement, TAG };
