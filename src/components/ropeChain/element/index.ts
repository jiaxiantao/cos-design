import { readNumberAttr, readStringAttr } from '@cos-design/shared';
import { createRopeChain, type RopeChainController, type RopeChainOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-rope-chain';

function parseOptions(el: HTMLElement): RopeChainOptions {
  const options = {} as RopeChainOptions;
  readStringAttr(options, el, 'color', 'color');
  readNumberAttr(options, el, 'width', 'width');
  readNumberAttr(options, el, 'height', 'height');
  readNumberAttr(options, el, 'segments', 'segments');
  readNumberAttr(options, el, 'gravity', 'gravity');
  return options;
}

class CosRopeChainElement extends HTMLElement {
  private ctrl: RopeChainController | null = null;

  static get observedAttributes() {
    return ['width', 'height', 'segments', 'color', 'gravity'];
  }

  connectedCallback() {
    this.ctrl = createRopeChain(this, parseOptions(this));
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
  customElements.define(TAG, CosRopeChainElement);
}

export { CosRopeChainElement, TAG };
