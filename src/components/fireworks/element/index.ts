import { createFireworks, type FireworksController, type FireworksOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-fireworks';

const BOOL_ATTRS = new Set(['auto', 'interactive', 'fill']);

function parseOptions(el: HTMLElement): FireworksOptions {
  const options: FireworksOptions = {};

  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
  if (el.hasAttribute('hint')) options.hint = el.getAttribute('hint') ?? undefined;

  for (const key of BOOL_ATTRS) {
    if (el.hasAttribute(key)) {
      (options as Record<string, boolean>)[key] = true;
    }
  }

  options.onComplete = () => {
    el.dispatchEvent(new CustomEvent('complete', { bubbles: true }));
  };

  return options;
}

class CosFireworksElement extends HTMLElement {
  private ctrl: FireworksController | null = null;

  static get observedAttributes() {
    return ['width', 'height', 'auto', 'interactive', 'fill', 'hint'];
  }

  connectedCallback() {
    this.ctrl = createFireworks(this, parseOptions(this));
  }

  disconnectedCallback() {
    this.ctrl?.destroy();
    this.ctrl = null;
  }

  attributeChangedCallback() {
    this.ctrl?.update(parseOptions(this));
  }

  launch(x?: number) {
    this.ctrl?.launch(x);
  }
}

if (typeof customElements !== 'undefined' && !customElements.get(TAG)) {
  customElements.define(TAG, CosFireworksElement);
}

export { CosFireworksElement, TAG };
