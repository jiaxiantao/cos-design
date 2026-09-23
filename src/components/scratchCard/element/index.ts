import { createScratchCard, type ScratchCardController, type ScratchCardOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-scratch-card';

function parseOptions(el: HTMLElement): ScratchCardOptions {
  const options = {} as ScratchCardOptions;
  if (el.hasAttribute('cover-color'))
    options.coverColor = el.getAttribute('cover-color') ?? undefined;
  if (el.hasAttribute('prize')) options.prize = el.getAttribute('prize') ?? undefined;
  if (el.hasAttribute('cover-text')) options.coverText = el.getAttribute('cover-text') ?? undefined;
  if (el.hasAttribute('reveal-threshold'))
    options.revealThreshold = Number(el.getAttribute('reveal-threshold'));
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
  options.onReveal = (...args: unknown[]) => {
    el.dispatchEvent(
      new CustomEvent('reveal', { detail: args.length <= 1 ? args[0] : args, bubbles: true }),
    );
  };
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
