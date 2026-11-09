import {
  readJsonAttr,
  readNumberAttr,
  readPropertyOverride,
  readStringAttr,
} from '@cos-design/shared';
import { createClickSpark, type ClickSparkController, type ClickSparkOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-click-spark';

function parseOptions(el: HTMLElement): ClickSparkOptions {
  const options = {} as ClickSparkOptions;
  readStringAttr(options, el, 'color', 'color');
  readStringAttr(options, el, 'defaultContent', 'default-content');
  readNumberAttr(options, el, 'count', 'count');
  readJsonAttr(options, el, 'slotElement', 'slot-element');
  readPropertyOverride(options, el, 'slotElement', '_slotElement');
  return options;
}

class CosClickSparkElement extends HTMLElement {
  private ctrl: ClickSparkController | null = null;

  _slotElement?: ClickSparkOptions['slotElement'];
  get slotElement(): ClickSparkOptions['slotElement'] | undefined {
    return this._slotElement;
  }
  set slotElement(value: ClickSparkOptions['slotElement']) {
    this._slotElement = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return ['color', 'count', 'default-content', 'slot-element'];
  }

  connectedCallback() {
    this.ctrl = createClickSpark(this, parseOptions(this));
  }

  disconnectedCallback() {
    this.ctrl?.destroy();
    this.ctrl = null;
  }

  attributeChangedCallback() {
    this.ctrl?.update(parseOptions(this));
  }

  getSlot() {
    return this.ctrl?.getSlot();
  }
}

if (typeof customElements !== 'undefined' && !customElements.get(TAG)) {
  customElements.define(TAG, CosClickSparkElement);
}

export { CosClickSparkElement, TAG };
