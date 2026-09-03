import { createRopeChain, type RopeChainController, type RopeChainOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-rope-chain';

function parseOptions(el: HTMLElement): RopeChainOptions {
  const options = {} as RopeChainOptions;
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
  if (el.hasAttribute('segments')) options.segments = Number(el.getAttribute('segments'));
  if (el.hasAttribute('gravity')) options.gravity = Number(el.getAttribute('gravity'));
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
