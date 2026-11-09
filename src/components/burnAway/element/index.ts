import { optionCallbackDispatcher, readNumberAttr, readStringAttr } from '@cos-design/shared';
import { createBurnAway, type BurnAwayController, type BurnAwayOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-burn-away';

function parseOptions(el: HTMLElement): BurnAwayOptions {
  const options = {} as BurnAwayOptions;
  readStringAttr(options, el, 'text', 'text');
  readStringAttr(options, el, 'completedText', 'completed-text');
  readNumberAttr(options, el, 'fontSize', 'font-size');
  options.onComplete = optionCallbackDispatcher(el, 'complete');
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
    return this.ctrl?.ignite();
  }
}

if (typeof customElements !== 'undefined' && !customElements.get(TAG)) {
  customElements.define(TAG, CosBurnAwayElement);
}

export { CosBurnAwayElement, TAG };
