import { createCountUp, type CountUpController, type CountUpOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-count-up';

function parseOptions(el: HTMLElement): CountUpOptions {
  const options = {} as CountUpOptions;
  if (el.hasAttribute('prefix')) options.prefix = el.getAttribute('prefix') ?? undefined;
  if (el.hasAttribute('suffix')) options.suffix = el.getAttribute('suffix') ?? undefined;
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  if (el.hasAttribute('value')) options.value = Number(el.getAttribute('value'));
  if (el.hasAttribute('start')) options.start = Number(el.getAttribute('start'));
  if (el.hasAttribute('duration')) options.duration = Number(el.getAttribute('duration'));
  if (el.hasAttribute('decimals')) options.decimals = Number(el.getAttribute('decimals'));
  return options;
}

class CosCountUpElement extends HTMLElement {
  private ctrl: CountUpController | null = null;

  static get observedAttributes() {
    return ['value', 'start', 'duration', 'decimals', 'prefix', 'suffix', 'color'];
  }

  connectedCallback() {
    this.ctrl = createCountUp(this, parseOptions(this));
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
  customElements.define(TAG, CosCountUpElement);
}

export { CosCountUpElement, TAG };
