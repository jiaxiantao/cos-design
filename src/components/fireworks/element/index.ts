import { createFireworks, type FireworksController, type FireworksOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-fireworks';

function parseOptions(el: HTMLElement): FireworksOptions {
  const options = {} as FireworksOptions;
  if (el.hasAttribute('hint')) options.hint = el.getAttribute('hint') ?? undefined;
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
  options.fill = el.hasAttribute('fill');
  if (el.hasAttribute('auto')) {
    const raw = el.getAttribute('auto');
    options.auto = raw !== 'false' && raw !== '0';
  }
  if (el.hasAttribute('interactive')) {
    const raw = el.getAttribute('interactive');
    options.interactive = raw !== 'false' && raw !== '0';
  }
  options.onComplete = (...args: unknown[]) => {
    el.dispatchEvent(
      new CustomEvent('complete', { detail: args.length <= 1 ? args[0] : args, bubbles: true }),
    );
  };
  return options;
}

class CosFireworksElement extends HTMLElement {
  private ctrl: FireworksController | null = null;

  static get observedAttributes() {
    return ['width', 'height', 'fill', 'auto', 'interactive', 'hint'];
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
    return this.ctrl?.launch(x);
  }
}

if (typeof customElements !== 'undefined' && !customElements.get(TAG)) {
  customElements.define(TAG, CosFireworksElement);
}

export { CosFireworksElement, TAG };
