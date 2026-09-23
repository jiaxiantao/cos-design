import { createSplitReveal, type SplitRevealController, type SplitRevealOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-split-reveal';

function parseOptions(el: HTMLElement): SplitRevealOptions {
  const options = {} as SplitRevealOptions;
  if (el.hasAttribute('text')) options.text = el.getAttribute('text') ?? undefined;
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  if (el.hasAttribute('delay')) options.delay = Number(el.getAttribute('delay'));
  return options;
}

class CosSplitRevealElement extends HTMLElement {
  private ctrl: SplitRevealController | null = null;

  static get observedAttributes() {
    return ['text', 'delay', 'color'];
  }

  connectedCallback() {
    this.ctrl = createSplitReveal(this, parseOptions(this));
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
  customElements.define(TAG, CosSplitRevealElement);
}

export { CosSplitRevealElement, TAG };
