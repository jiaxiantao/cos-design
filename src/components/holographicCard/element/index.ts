import { readStringAttr } from '@cos-design/shared';
import {
  createHolographicCard,
  type HolographicCardController,
  type HolographicCardOptions,
} from '../core';
import '../style/index.css';

const TAG = 'cos-holographic-card';

function parseOptions(el: HTMLElement): HolographicCardOptions {
  const options = {} as HolographicCardOptions;
  readStringAttr(options, el, 'title', 'title');
  readStringAttr(options, el, 'subtitle', 'subtitle');
  readStringAttr(options, el, 'image', 'image');
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
