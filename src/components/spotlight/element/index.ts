import { createSpotlight, type SpotlightController, type SpotlightOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-spotlight';

function parseOptions(el: HTMLElement): SpotlightOptions {
  const options = {} as SpotlightOptions;
  if (el.hasAttribute('dim-color')) options.dimColor = el.getAttribute('dim-color') ?? undefined;
  if (el.hasAttribute('radius')) options.radius = Number(el.getAttribute('radius'));
  if (el.hasAttribute('slot-element')) {
    try {
      options.slotElement = JSON.parse(
        el.getAttribute('slot-element') ?? 'null',
      ) as SpotlightOptions['slotElement'];
    } catch {
      /* ignore invalid JSON */
    }
  }
  const propslotElement = (el as CosSpotlightElement)._slotElement;
  if (propslotElement !== undefined)
    options.slotElement = propslotElement as SpotlightOptions['slotElement'];
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
    return ['radius', 'dim-color', 'slot-element'];
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
