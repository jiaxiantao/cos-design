import { createTypewriter, type TypewriterController, type TypewriterOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-typewriter';

function parseOptions(el: HTMLElement): TypewriterOptions {
  const options = {} as TypewriterOptions;
  if (el.hasAttribute('speed')) options.speed = Number(el.getAttribute('speed'));
  if (el.hasAttribute('delete-speed'))
    options.deleteSpeed = Number(el.getAttribute('delete-speed'));
  if (el.hasAttribute('pause')) options.pause = Number(el.getAttribute('pause'));
  if (el.hasAttribute('texts')) {
    try {
      options.texts = JSON.parse(el.getAttribute('texts') ?? 'null') as TypewriterOptions['texts'];
    } catch {
      /* ignore invalid JSON */
    }
  }
  const proptexts = (el as CosTypewriterElement)._texts;
  if (proptexts !== undefined) options.texts = proptexts as TypewriterOptions['texts'];
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
