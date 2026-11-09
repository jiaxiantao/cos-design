import {
  optionCallbackDispatcher,
  readBooleanAttr,
  readStringAttr,
} from '@cos-design/shared';
import { createFlipCard, type FlipCardController, type FlipCardOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-flip-card';

function parseOptions(el: HTMLElement): FlipCardOptions {
  const options = {} as FlipCardOptions;
  readStringAttr(options, el, 'frontTitle', 'front-title');
  readStringAttr(options, el, 'frontSubtitle', 'front-subtitle');
  readStringAttr(options, el, 'backTitle', 'back-title');
  readStringAttr(options, el, 'backSubtitle', 'back-subtitle');
  readBooleanAttr(options, el, 'flipped', 'flipped', 'optional-undefined');
  readBooleanAttr(options, el, 'defaultFlipped', 'default-flipped', 'optional-true');
  readBooleanAttr(options, el, 'disabled', 'disabled', 'optional-true');
  options.onReveal = optionCallbackDispatcher(el, 'reveal');
  options.onFlipChange = optionCallbackDispatcher(el, 'flip-change');
  return options;
}

class CosFlipCardElement extends HTMLElement {
  private ctrl: FlipCardController | null = null;


  static get observedAttributes() {
    return ['front-title', 'front-subtitle', 'back-title', 'back-subtitle', 'flipped', 'default-flipped', 'disabled'];
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
