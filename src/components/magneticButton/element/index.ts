import {
  readJsonAttr,
  readNumberAttr,
  readPropertyOverride,
  readStringAttr,
} from '@cos-design/shared';
import {
  createMagneticButton,
  type MagneticButtonController,
  type MagneticButtonOptions,
} from '../core';
import '../style/index.css';

const TAG = 'cos-magnetic-button';

function parseOptions(el: HTMLElement): MagneticButtonOptions {
  const options = {} as MagneticButtonOptions;
  readStringAttr(options, el, 'color', 'color');
  readStringAttr(options, el, 'defaultContent', 'default-content');
  readNumberAttr(options, el, 'strength', 'strength');
  readJsonAttr(options, el, 'slotElement', 'slot-element');
  readPropertyOverride(options, el, 'slotElement', '_slotElement');
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
