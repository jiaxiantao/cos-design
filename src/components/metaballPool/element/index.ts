import { createMetaballPool, type MetaballPoolController, type MetaballPoolOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-metaball-pool';

function parseOptions(el: HTMLElement): MetaballPoolOptions {
  const options = {} as MetaballPoolOptions;
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
  if (el.hasAttribute('ball-count')) options.ballCount = Number(el.getAttribute('ball-count'));
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  return options;
}

class CosMetaballPoolElement extends HTMLElement {
  private ctrl: MetaballPoolController | null = null;

  static get observedAttributes() {
    return ['width', 'height', 'ball-count', 'color'];
  }

  connectedCallback() {
    this.ctrl = createMetaballPool(this, parseOptions(this));
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
  customElements.define(TAG, CosMetaballPoolElement);
}

export { CosMetaballPoolElement, TAG };
