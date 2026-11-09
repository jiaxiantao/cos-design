import {
  readJsonAttr,
  readNumberAttr,
  readPropertyOverride,
  readStringAttr,
} from '@cos-design/shared';
import { createTextMorph, type TextMorphController, type TextMorphOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-text-morph';

function parseOptions(el: HTMLElement): TextMorphOptions {
  const options = {} as TextMorphOptions;
  readStringAttr(options, el, 'color', 'color');
  readNumberAttr(options, el, 'interval', 'interval');
  readNumberAttr(options, el, 'duration', 'duration');
  readNumberAttr(options, el, 'fontSize', 'font-size');
  readJsonAttr(options, el, 'texts', 'texts');
  readPropertyOverride(options, el, 'texts', '_texts');
  return options;
}

class CosTextMorphElement extends HTMLElement {
  private ctrl: TextMorphController | null = null;

  _texts?: TextMorphOptions['texts'];
  get texts(): TextMorphOptions['texts'] | undefined {
    return this._texts;
  }
  set texts(value: TextMorphOptions['texts']) {
    this._texts = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return ['texts', 'interval', 'duration', 'font-size', 'color'];
  }

  connectedCallback() {
    this.ctrl = createTextMorph(this, parseOptions(this));
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
  customElements.define(TAG, CosTextMorphElement);
}

export { CosTextMorphElement, TAG };
