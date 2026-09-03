import { createFlipCard, type FlipCardController, type FlipCardOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-flip-card';

function parseOptions(_el: HTMLElement): FlipCardOptions {
  const options: FlipCardOptions = {};
  if (_el.hasAttribute('front-title'))
    options.frontTitle = _el.getAttribute('front-title') ?? undefined;
  if (_el.hasAttribute('disabled')) options.disabled = true;
  return options;
}

class CosFlipCardElement extends HTMLElement {
  private ctrl: FlipCardController | null = null;

  static get observedAttributes() {
    return ['front-title', 'disabled'];
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
