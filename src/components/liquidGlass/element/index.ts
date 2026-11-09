import {
  readJsonAttr,
  readNumberAttr,
  readPropertyOverride,
  readStringAttr,
} from '@cos-design/shared';
import { createLiquidGlass, type LiquidGlassController, type LiquidGlassOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-liquid-glass';

function parseOptions(el: HTMLElement): LiquidGlassOptions {
  const options = {} as LiquidGlassOptions;
  readStringAttr(options, el, 'defaultContent', 'default-content');
  readNumberAttr(options, el, 'blur', 'blur');
  readNumberAttr(options, el, 'borderRadius', 'border-radius');
  readJsonAttr(options, el, 'slotElement', 'slot-element');
  readPropertyOverride(options, el, 'slotElement', '_slotElement');
  return options;
}

class CosLiquidGlassElement extends HTMLElement {
  private ctrl: LiquidGlassController | null = null;

  _slotElement?: LiquidGlassOptions['slotElement'];
  get slotElement(): LiquidGlassOptions['slotElement'] | undefined {
    return this._slotElement;
  }
  set slotElement(value: LiquidGlassOptions['slotElement']) {
    this._slotElement = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return ['blur', 'border-radius', 'slot-element', 'default-content'];
  }

  connectedCallback() {
    this.ctrl = createLiquidGlass(this, parseOptions(this));
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
  customElements.define(TAG, CosLiquidGlassElement);
}

export { CosLiquidGlassElement, TAG };
