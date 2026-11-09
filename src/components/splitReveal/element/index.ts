import {
  readNumberAttr,
  readStringAttr,
} from '@cos-design/shared';
import { createSplitReveal, type SplitRevealController, type SplitRevealOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-split-reveal';

function parseOptions(el: HTMLElement): SplitRevealOptions {
  const options = {} as SplitRevealOptions;
  readStringAttr(options, el, 'text', 'text');
  readStringAttr(options, el, 'color', 'color');
  readNumberAttr(options, el, 'delay', 'delay');
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
