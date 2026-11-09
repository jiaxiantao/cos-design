import {
  readJsonAttr,
  readNumberAttr,
  readPropertyOverride,
  readStringAttr,
} from '@cos-design/shared';
import { createRotatingText, type RotatingTextController, type RotatingTextOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-rotating-text';

function parseOptions(el: HTMLElement): RotatingTextOptions {
  const options = {} as RotatingTextOptions;
  readStringAttr(options, el, 'color', 'color');
  readStringAttr(options, el, 'highlightColor', 'highlight-color');
  readNumberAttr(options, el, 'interval', 'interval');
  readNumberAttr(options, el, 'stagger', 'stagger');
  readNumberAttr(options, el, 'duration', 'duration');
  readNumberAttr(options, el, 'fontSize', 'font-size');
  readJsonAttr(options, el, 'texts', 'texts');
  readPropertyOverride(options, el, 'texts', '_texts');
  return options;
}

class CosRotatingTextElement extends HTMLElement {
  private ctrl: RotatingTextController | null = null;

  _texts?: RotatingTextOptions['texts'];
  get texts(): RotatingTextOptions['texts'] | undefined {
    return this._texts;
  }
  set texts(value: RotatingTextOptions['texts']) {
    this._texts = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return ['texts', 'interval', 'stagger', 'duration', 'font-size', 'color', 'highlight-color'];
  }

  connectedCallback() {
    this.ctrl = createRotatingText(this, parseOptions(this));
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
  customElements.define(TAG, CosRotatingTextElement);
}

export { CosRotatingTextElement, TAG };
