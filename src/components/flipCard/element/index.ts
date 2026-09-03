import { createFlipCard, type FlipCardController, type FlipCardOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-flip-card';

function parseOptions(el: HTMLElement): FlipCardOptions {
  const options = {} as FlipCardOptions;
  if (el.hasAttribute('front-title'))
    options.frontTitle = el.getAttribute('front-title') ?? undefined;
  if (el.hasAttribute('front-subtitle'))
    options.frontSubtitle = el.getAttribute('front-subtitle') ?? undefined;
  if (el.hasAttribute('back-title')) options.backTitle = el.getAttribute('back-title') ?? undefined;
  if (el.hasAttribute('back-subtitle'))
    options.backSubtitle = el.getAttribute('back-subtitle') ?? undefined;
  options.flipped = el.hasAttribute('flipped');
  options.defaultFlipped = el.hasAttribute('default-flipped');
  options.disabled = el.hasAttribute('disabled');
  options.onReveal = (...args: unknown[]) => {
    el.dispatchEvent(
      new CustomEvent('reveal', { detail: args.length <= 1 ? args[0] : args, bubbles: true }),
    );
  };
  options.onFlipChange = (...args: unknown[]) => {
    el.dispatchEvent(
      new CustomEvent('flip-change', { detail: args.length <= 1 ? args[0] : args, bubbles: true }),
    );
  };
  return options;
}

class CosFlipCardElement extends HTMLElement {
  private ctrl: FlipCardController | null = null;

  static get observedAttributes() {
    return [
      'front-title',
      'front-subtitle',
      'back-title',
      'back-subtitle',
      'flipped',
      'default-flipped',
      'disabled',
    ];
  }

  connectedCallback() {
    this.ctrl = createFlipCard(this, parseOptions(this));
  }

  disconnectedCallback() {
    this.ctrl?.destroy();
    this.ctrl = null;
  }

  attributeChangedCallback() {
    this.ctrl?.update(parseOptions(this));
  }

  flip() {
    return this.ctrl?.flip();
  }
  reset() {
    return this.ctrl?.reset();
  }
}

if (typeof customElements !== 'undefined' && !customElements.get(TAG)) {
  customElements.define(TAG, CosFlipCardElement);
}

export { CosFlipCardElement, TAG };
