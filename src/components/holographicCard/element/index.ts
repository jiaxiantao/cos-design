import {
  createHolographicCard,
  type HolographicCardController,
  type HolographicCardOptions,
} from '../core';
import '../style/index.css';

const TAG = 'cos-holographic-card';

function parseOptions(el: HTMLElement): HolographicCardOptions {
  const options = {} as HolographicCardOptions;
  if (el.hasAttribute('title')) options.title = el.getAttribute('title') ?? undefined;
  if (el.hasAttribute('subtitle')) options.subtitle = el.getAttribute('subtitle') ?? undefined;
  if (el.hasAttribute('image')) options.image = el.getAttribute('image') ?? undefined;
  return options;
}

class CosHolographicCardElement extends HTMLElement {
  private ctrl: HolographicCardController | null = null;

  static get observedAttributes() {
    return ['title', 'subtitle', 'image'];
  }

  connectedCallback() {
    this.ctrl = createHolographicCard(this, parseOptions(this));
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
  customElements.define(TAG, CosHolographicCardElement);
}

export { CosHolographicCardElement, TAG };
