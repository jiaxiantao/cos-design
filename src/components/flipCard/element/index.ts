import { createFlipCard, type FlipCardController, type FlipCardOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-flip-card';

function parseOptions(el: HTMLElement): FlipCardOptions {
  const options: FlipCardOptions = {};
  if (el.hasAttribute('front-title'))
    options.frontTitle = el.getAttribute('front-title') ?? undefined;
  if (el.hasAttribute('front-subtitle'))
    options.frontSubtitle = el.getAttribute('front-subtitle') ?? undefined;
  if (el.hasAttribute('back-title')) options.backTitle = el.getAttribute('back-title') ?? undefined;
  if (el.hasAttribute('back-subtitle'))
    options.backSubtitle = el.getAttribute('back-subtitle') ?? undefined;
  if (el.hasAttribute('disabled')) options.disabled = el.getAttribute('disabled') !== 'false';
  if (el.hasAttribute('default-flipped'))
    options.defaultFlipped = el.getAttribute('default-flipped') !== 'false';
  options.onReveal = () => {
    el.dispatchEvent(new CustomEvent('reveal', { bubbles: true }));
  };
  options.onFlipChange = (flipped) => {
    el.dispatchEvent(new CustomEvent('flip-change', { detail: { flipped }, bubbles: true }));
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
      'disabled',
      'default-flipped',
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
    this.ctrl?.flip();
  }

  reset() {
    this.ctrl?.reset();
  }
}

if (typeof customElements !== 'undefined' && !customElements.get(TAG)) {
  customElements.define(TAG, CosFlipCardElement);
}

export { CosFlipCardElement, TAG };
