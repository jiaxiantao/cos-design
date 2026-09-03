import { createTypewriter, type TypewriterController, type TypewriterOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-typewriter';

function parseOptions(el: HTMLElement): TypewriterOptions {
  const options: TypewriterOptions = {};
  if (el.hasAttribute('speed')) options.speed = Number(el.getAttribute('speed'));
  if (el.hasAttribute('delete-speed'))
    options.deleteSpeed = Number(el.getAttribute('delete-speed'));
  if (el.hasAttribute('pause')) options.pause = Number(el.getAttribute('pause'));
  return options;
}

class CosTypewriterElement extends HTMLElement {
  private ctrl: TypewriterController | null = null;

  static get observedAttributes() {
    return ['speed', 'delete-speed', 'pause'];
  }

  connectedCallback() {
    this.ctrl = createTypewriter(this, parseOptions(this));
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
  customElements.define(TAG, CosTypewriterElement);
}

export { CosTypewriterElement, TAG };
