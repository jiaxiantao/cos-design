import { createLiquidGlass, type LiquidGlassController, type LiquidGlassOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-liquid-glass';

function parseOptions(el: HTMLElement): LiquidGlassOptions {
  const options: LiquidGlassOptions = {};
  if (el.hasAttribute('blur')) options.blur = Number(el.getAttribute('blur'));
  if (el.hasAttribute('border-radius')) options.borderRadius = Number(el.getAttribute('border-radius'));
  return options;
}

class CosLiquidGlassElement extends HTMLElement {
  private ctrl: LiquidGlassController | null = null;

  static get observedAttributes() {
    return ['blur', 'border-radius'];
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
}

if (typeof customElements !== 'undefined' && !customElements.get(TAG)) {
  customElements.define(TAG, CosLiquidGlassElement);
}

export { CosLiquidGlassElement, TAG };
