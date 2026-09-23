import { createScrambleText, type ScrambleTextController, type ScrambleTextOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-scramble-text';

function parseOptions(el: HTMLElement): ScrambleTextOptions {
  const options = {} as ScrambleTextOptions;
  if (el.hasAttribute('text')) options.text = el.getAttribute('text') ?? undefined;
  if (el.hasAttribute('charset')) options.charset = el.getAttribute('charset') ?? undefined;
  if (el.hasAttribute('duration')) options.duration = Number(el.getAttribute('duration'));
  return options;
}

class CosScrambleTextElement extends HTMLElement {
  private ctrl: ScrambleTextController | null = null;

  static get observedAttributes() {
    return ['text', 'duration', 'charset'];
  }

  connectedCallback() {
    this.ctrl = createScrambleText(this, parseOptions(this));
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
  customElements.define(TAG, CosScrambleTextElement);
}

export { CosScrambleTextElement, TAG };
