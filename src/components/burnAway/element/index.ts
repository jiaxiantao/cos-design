import { createBurnAway, type BurnAwayController, type BurnAwayOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-burn-away';

function parseOptions(el: HTMLElement): BurnAwayOptions {
  const options: BurnAwayOptions = {};
  if (el.hasAttribute('text')) options.text = el.getAttribute('text') ?? undefined;
  if (el.hasAttribute('font-size')) options.fontSize = Number(el.getAttribute('font-size'));
  if (el.hasAttribute('completed-text')) options.completedText = el.getAttribute('completed-text') ?? undefined;
  options.onComplete = () => el.dispatchEvent(new CustomEvent('complete', { bubbles: true }));
  return options;
}

class CosBurnAwayElement extends HTMLElement {
  private ctrl: BurnAwayController | null = null;

  static get observedAttributes() {
    return ['text', 'font-size', 'completed-text'];
  }

  connectedCallback() {
    this.ctrl = createBurnAway(this, parseOptions(this));
  }

  disconnectedCallback() {
    this.ctrl?.destroy();
    this.ctrl = null;
  }

  attributeChangedCallback() {
    this.ctrl?.update(parseOptions(this));
  }

  ignite() {
    this.ctrl?.ignite();
  }
}

if (typeof customElements !== 'undefined' && !customElements.get(TAG)) {
  customElements.define(TAG, CosBurnAwayElement);
}

export { CosBurnAwayElement, TAG };
