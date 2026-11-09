import { optionCallbackDispatcher, readNumberAttr, readStringAttr } from '@cos-design/shared';
import { createScratchCard, type ScratchCardController, type ScratchCardOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-scratch-card';

function parseOptions(el: HTMLElement): ScratchCardOptions {
  const options = {} as ScratchCardOptions;
  readStringAttr(options, el, 'coverColor', 'cover-color');
  readStringAttr(options, el, 'prize', 'prize');
  readStringAttr(options, el, 'coverText', 'cover-text');
  readNumberAttr(options, el, 'revealThreshold', 'reveal-threshold');
  readNumberAttr(options, el, 'width', 'width');
  readNumberAttr(options, el, 'height', 'height');
  options.onReveal = optionCallbackDispatcher(el, 'reveal');
  return options;
}

class CosScratchCardElement extends HTMLElement {
  private ctrl: ScratchCardController | null = null;

  static get observedAttributes() {
    return ['cover-color', 'prize', 'cover-text', 'reveal-threshold', 'width', 'height'];
  }

  connectedCallback() {
    this.ctrl = createScratchCard(this, parseOptions(this));
  }

  disconnectedCallback() {
    this.ctrl?.destroy();
    this.ctrl = null;
  }

  attributeChangedCallback() {
    this.ctrl?.update(parseOptions(this));
  }

  reset() {
    return this.ctrl?.reset();
  }
  reveal() {
    return this.ctrl?.reveal();
  }
}

if (typeof customElements !== 'undefined' && !customElements.get(TAG)) {
  customElements.define(TAG, CosScratchCardElement);
}

export { CosScratchCardElement, TAG };
