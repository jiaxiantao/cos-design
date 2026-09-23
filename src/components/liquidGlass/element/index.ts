import { createLiquidGlass, type LiquidGlassController, type LiquidGlassOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-liquid-glass';

function parseOptions(el: HTMLElement): LiquidGlassOptions {
  const options = {} as LiquidGlassOptions;
  if (el.hasAttribute('default-content'))
    options.defaultContent = el.getAttribute('default-content') ?? undefined;
  if (el.hasAttribute('blur')) options.blur = Number(el.getAttribute('blur'));
  if (el.hasAttribute('border-radius'))
    options.borderRadius = Number(el.getAttribute('border-radius'));
  if (el.hasAttribute('slot-element')) {
    try {
      options.slotElement = JSON.parse(
        el.getAttribute('slot-element') ?? 'null',
      ) as LiquidGlassOptions['slotElement'];
    } catch {
      /* ignore invalid JSON */
    }
  }
  const propslotElement = (el as CosLiquidGlassElement)._slotElement;
  if (propslotElement !== undefined)
    options.slotElement = propslotElement as LiquidGlassOptions['slotElement'];
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
