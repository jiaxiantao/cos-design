import { readNumberAttr, readStringAttr } from '@cos-design/shared';
import {
  createLiquidProgress,
  type LiquidProgressController,
  type LiquidProgressOptions,
} from '../core';
import '../style/index.css';

const TAG = 'cos-liquid-progress';

function parseOptions(el: HTMLElement): LiquidProgressOptions {
  const options = {} as LiquidProgressOptions;
  readStringAttr(options, el, 'color', 'color');
  readNumberAttr(options, el, 'value', 'value');
  readNumberAttr(options, el, 'max', 'max');
  readNumberAttr(options, el, 'size', 'size');
  return options;
}

class CosLiquidProgressElement extends HTMLElement {
  private ctrl: LiquidProgressController | null = null;

  static get observedAttributes() {
    return ['value', 'max', 'size', 'color'];
  }

  connectedCallback() {
    this.ctrl = createLiquidProgress(this, parseOptions(this));
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
  customElements.define(TAG, CosLiquidProgressElement);
}

export { CosLiquidProgressElement, TAG };
