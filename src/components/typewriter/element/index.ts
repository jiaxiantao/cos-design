import { readJsonAttr, readNumberAttr, readPropertyOverride } from '@cos-design/shared';
import { createTypewriter, type TypewriterController, type TypewriterOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-typewriter';

function parseOptions(el: HTMLElement): TypewriterOptions {
  const options = {} as TypewriterOptions;
  readNumberAttr(options, el, 'speed', 'speed');
  readNumberAttr(options, el, 'deleteSpeed', 'delete-speed');
  readNumberAttr(options, el, 'pause', 'pause');
  readJsonAttr(options, el, 'texts', 'texts');
  readPropertyOverride(options, el, 'texts', '_texts');
  return options;
}

class CosTypewriterElement extends HTMLElement {
  private ctrl: TypewriterController | null = null;

  _texts?: TypewriterOptions['texts'];
  get texts(): TypewriterOptions['texts'] | undefined {
    return this._texts;
  }
  set texts(value: TypewriterOptions['texts']) {
    this._texts = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return ['texts', 'speed', 'delete-speed', 'pause'];
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
