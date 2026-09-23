import { createInkBloom, type InkBloomController, type InkBloomOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-ink-bloom';

function parseOptions(el: HTMLElement): InkBloomOptions {
  const options = {} as InkBloomOptions;
  if (el.hasAttribute('ink-color')) options.inkColor = el.getAttribute('ink-color') ?? undefined;
  if (el.hasAttribute('aria-label')) options.ariaLabel = el.getAttribute('aria-label') ?? undefined;
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
  if (el.hasAttribute('speed')) options.speed = Number(el.getAttribute('speed'));
  options.fill = el.hasAttribute('fill');
  if (el.hasAttribute('interactive')) {
    const raw = el.getAttribute('interactive');
    options.interactive = raw !== 'false' && raw !== '0';
  }
  return options;
}

class CosInkBloomElement extends HTMLElement {
  private ctrl: InkBloomController | null = null;

  static get observedAttributes() {
    return ['width', 'height', 'fill', 'ink-color', 'speed', 'interactive', 'aria-label'];
  }

  connectedCallback() {
    this.ctrl = createInkBloom(this, parseOptions(this));
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
  customElements.define(TAG, CosInkBloomElement);
}

export { CosInkBloomElement, TAG };
