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
  // Controlled `flipped` only when attribute is present. Omitting must stay
  // undefined — `hasAttribute` → false would lock the card in controlled mode
  // and make clicks no-ops (engine only flips uncontrolled state).
  if (el.hasAttribute('flipped')) {
    const raw = el.getAttribute('flipped');
    options.flipped = raw !== 'false' && raw !== '0';
  } else {
    options.flipped = undefined;
  }
  if (el.hasAttribute('default-flipped')) {
    const raw = el.getAttribute('default-flipped');
    options.defaultFlipped = raw !== 'false' && raw !== '0';
  }
  if (el.hasAttribute('disabled')) {
    const raw = el.getAttribute('disabled');
    options.disabled = raw !== 'false' && raw !== '0';
  }
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
