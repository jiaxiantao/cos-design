import { readNumberAttr, readStringAttr } from '@cos-design/shared';
import { createMetaballPool, type MetaballPoolController, type MetaballPoolOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-metaball-pool';

function parseOptions(el: HTMLElement): MetaballPoolOptions {
  const options = {} as MetaballPoolOptions;
  readStringAttr(options, el, 'color', 'color');
  readNumberAttr(options, el, 'width', 'width');
  readNumberAttr(options, el, 'height', 'height');
  readNumberAttr(options, el, 'ballCount', 'ball-count');
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
