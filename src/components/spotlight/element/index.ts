import {
  readJsonAttr,
  readNumberAttr,
  readPropertyOverride,
  readStringAttr,
} from '@cos-design/shared';
import { createSpotlight, type SpotlightController, type SpotlightOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-spotlight';

function parseOptions(el: HTMLElement): SpotlightOptions {
  const options = {} as SpotlightOptions;
  readStringAttr(options, el, 'dimColor', 'dim-color');
  readStringAttr(options, el, 'defaultContent', 'default-content');
  readNumberAttr(options, el, 'radius', 'radius');
  readJsonAttr(options, el, 'slotElement', 'slot-element');
  readPropertyOverride(options, el, 'slotElement', '_slotElement');
  return options;
}

class CosSpotlightElement extends HTMLElement {
  private ctrl: SpotlightController | null = null;

  _slotElement?: SpotlightOptions['slotElement'];
  get slotElement(): SpotlightOptions['slotElement'] | undefined {
    return this._slotElement;
  }
  set slotElement(value: SpotlightOptions['slotElement']) {
    this._slotElement = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return ['radius', 'dim-color', 'default-content', 'slot-element'];
  }

  connectedCallback() {
    this.ctrl = createSpotlight(this, parseOptions(this));
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
  customElements.define(TAG, CosSpotlightElement);
}

export { CosSpotlightElement, TAG };
