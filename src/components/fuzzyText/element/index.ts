import {
  readBooleanAttr,
  readNumberAttr,
  readStringAttr,
} from '@cos-design/shared';
import { createFuzzyText, type FuzzyTextController, type FuzzyTextOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-fuzzy-text';

function parseOptions(el: HTMLElement): FuzzyTextOptions {
  const options = {} as FuzzyTextOptions;
  readStringAttr(options, el, 'text', 'text');
  readStringAttr(options, el, 'color', 'color');
  readNumberAttr(options, el, 'fontSize', 'font-size');
  readNumberAttr(options, el, 'fontWeight', 'font-weight');
  readNumberAttr(options, el, 'baseIntensity', 'base-intensity');
  readNumberAttr(options, el, 'hoverIntensity', 'hover-intensity');
  readNumberAttr(options, el, 'fuzzRange', 'fuzz-range');
  readBooleanAttr(options, el, 'enableHover', 'enable-hover', 'presence');
  return options;
}

class CosFuzzyTextElement extends HTMLElement {
  private ctrl: FuzzyTextController | null = null;


  static get observedAttributes() {
    return ['text', 'font-size', 'font-weight', 'color', 'base-intensity', 'hover-intensity', 'enable-hover', 'fuzz-range'];
  }

  connectedCallback() {
    this.ctrl = createFuzzyText(this, parseOptions(this));
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
  customElements.define(TAG, CosFuzzyTextElement);
}

export { CosFuzzyTextElement, TAG };
