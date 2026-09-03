import {
  createLiquidProgress,
  type LiquidProgressController,
  type LiquidProgressOptions,
} from '../core';
import '../style/index.css';

const TAG = 'cos-liquid-progress';

function parseOptions(el: HTMLElement): LiquidProgressOptions {
  const options = {} as LiquidProgressOptions;
  if (el.hasAttribute('value')) options.value = Number(el.getAttribute('value'));
  if (el.hasAttribute('max')) options.max = Number(el.getAttribute('max'));
  if (el.hasAttribute('size')) options.size = Number(el.getAttribute('size'));
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
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
