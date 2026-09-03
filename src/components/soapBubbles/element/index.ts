import { createSoapBubbles, type SoapBubblesController, type SoapBubblesOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-soap-bubbles';

function parseOptions(el: HTMLElement): SoapBubblesOptions {
  const options = {} as SoapBubblesOptions;
  if (el.hasAttribute('aria-label')) options.ariaLabel = el.getAttribute('aria-label') ?? undefined;
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
  if (el.hasAttribute('count')) options.count = Number(el.getAttribute('count'));
  if (el.hasAttribute('speed')) options.speed = Number(el.getAttribute('speed'));
  options.fill = el.hasAttribute('fill');
  if (el.hasAttribute('interactive')) {
    const raw = el.getAttribute('interactive');
    options.interactive = raw !== 'false' && raw !== '0';
  }
  return options;
}

class CosSoapBubblesElement extends HTMLElement {
  private ctrl: SoapBubblesController | null = null;

  static get observedAttributes() {
    return ['width', 'height', 'fill', 'count', 'speed', 'interactive', 'aria-label'];
  }

  connectedCallback() {
    this.ctrl = createSoapBubbles(this, parseOptions(this));
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
  customElements.define(TAG, CosSoapBubblesElement);
}

export { CosSoapBubblesElement, TAG };
