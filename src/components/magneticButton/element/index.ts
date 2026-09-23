import {
  createMagneticButton,
  type MagneticButtonController,
  type MagneticButtonOptions,
} from '../core';
import '../style/index.css';

const TAG = 'cos-magnetic-button';

function parseOptions(el: HTMLElement): MagneticButtonOptions {
  const options = {} as MagneticButtonOptions;
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  if (el.hasAttribute('default-content'))
    options.defaultContent = el.getAttribute('default-content') ?? undefined;
  if (el.hasAttribute('strength')) options.strength = Number(el.getAttribute('strength'));
  if (el.hasAttribute('slot-element')) {
    try {
      options.slotElement = JSON.parse(
        el.getAttribute('slot-element') ?? 'null',
      ) as MagneticButtonOptions['slotElement'];
    } catch {
      /* ignore invalid JSON */
    }
  }
  const propslotElement = (el as CosMagneticButtonElement)._slotElement;
  if (propslotElement !== undefined)
    options.slotElement = propslotElement as MagneticButtonOptions['slotElement'];
  return options;
}

class CosMagneticButtonElement extends HTMLElement {
  private ctrl: MagneticButtonController | null = null;

  _slotElement?: MagneticButtonOptions['slotElement'];
  get slotElement(): MagneticButtonOptions['slotElement'] | undefined {
    return this._slotElement;
  }
  set slotElement(value: MagneticButtonOptions['slotElement']) {
    this._slotElement = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return ['strength', 'color', 'slot-element', 'default-content'];
  }

  connectedCallback() {
    this.ctrl = createMagneticButton(this, parseOptions(this));
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
  customElements.define(TAG, CosMagneticButtonElement);
}

export { CosMagneticButtonElement, TAG };
