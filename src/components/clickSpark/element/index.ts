import { createClickSpark, type ClickSparkController, type ClickSparkOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-click-spark';

function parseOptions(el: HTMLElement): ClickSparkOptions {
  const options = {} as ClickSparkOptions;
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  if (el.hasAttribute('count')) options.count = Number(el.getAttribute('count'));
  if (el.hasAttribute('default-content'))
    options.defaultContent = el.getAttribute('default-content') ?? undefined;
  if (el.hasAttribute('slot-element')) {
    try {
      options.slotElement = JSON.parse(
        el.getAttribute('slot-element') ?? 'null',
      ) as ClickSparkOptions['slotElement'];
    } catch {
      /* ignore invalid JSON */
    }
  }
  const propslotElement = (el as CosClickSparkElement)._slotElement;
  if (propslotElement !== undefined)
    options.slotElement = propslotElement as ClickSparkOptions['slotElement'];
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
}

if (typeof customElements !== 'undefined' && !customElements.get(TAG)) {
  customElements.define(TAG, CosClickSparkElement);
}

export { CosClickSparkElement, TAG };
