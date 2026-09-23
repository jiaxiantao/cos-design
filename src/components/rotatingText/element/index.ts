import { createRotatingText, type RotatingTextController, type RotatingTextOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-rotating-text';

function parseOptions(el: HTMLElement): RotatingTextOptions {
  const options = {} as RotatingTextOptions;
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  if (el.hasAttribute('highlight-color'))
    options.highlightColor = el.getAttribute('highlight-color') ?? undefined;
  if (el.hasAttribute('interval')) options.interval = Number(el.getAttribute('interval'));
  if (el.hasAttribute('stagger')) options.stagger = Number(el.getAttribute('stagger'));
  if (el.hasAttribute('duration')) options.duration = Number(el.getAttribute('duration'));
  if (el.hasAttribute('font-size')) options.fontSize = Number(el.getAttribute('font-size'));
  if (el.hasAttribute('texts')) {
    try {
      options.texts = JSON.parse(
        el.getAttribute('texts') ?? 'null',
      ) as RotatingTextOptions['texts'];
    } catch {
      /* ignore invalid JSON */
    }
  }
  const proptexts = (el as CosRotatingTextElement)._texts;
  if (proptexts !== undefined) options.texts = proptexts as RotatingTextOptions['texts'];
  return options;
}

class CosRotatingTextElement extends HTMLElement {
  private ctrl: RotatingTextController | null = null;

  _texts?: RotatingTextOptions['texts'];
  get texts(): RotatingTextOptions['texts'] | undefined {
    return this._texts;
  }
  set texts(value: RotatingTextOptions['texts']) {
    this._texts = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return ['texts', 'interval', 'stagger', 'duration', 'font-size', 'color', 'highlight-color'];
  }

  connectedCallback() {
    this.ctrl = createRotatingText(this, parseOptions(this));
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
  customElements.define(TAG, CosRotatingTextElement);
}

export { CosRotatingTextElement, TAG };
