import { createFlipCounter, type FlipCounterController, type FlipCounterOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-flip-counter';

function parseOptions(el: HTMLElement): FlipCounterOptions {
  const options = {} as FlipCounterOptions;
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  if (el.hasAttribute('value')) options.value = Number(el.getAttribute('value'));
  if (el.hasAttribute('digits')) options.digits = Number(el.getAttribute('digits'));
  if (el.hasAttribute('duration')) options.duration = Number(el.getAttribute('duration'));
  if (el.hasAttribute('auto-interval'))
    options.autoInterval = Number(el.getAttribute('auto-interval'));
  if (el.hasAttribute('auto')) {
    const raw = el.getAttribute('auto');
    options.auto = raw !== 'false' && raw !== '0';
  }
  return options;
}

class CosFlipCounterElement extends HTMLElement {
  private ctrl: FlipCounterController | null = null;

  static get observedAttributes() {
    return ['value', 'digits', 'color', 'duration', 'auto', 'auto-interval'];
  }

  connectedCallback() {
    this.ctrl = createFlipCounter(this, parseOptions(this));
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
  customElements.define(TAG, CosFlipCounterElement);
}

export { CosFlipCounterElement, TAG };
