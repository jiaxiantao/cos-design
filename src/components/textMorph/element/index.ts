import { createTextMorph, type TextMorphController, type TextMorphOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-text-morph';

function parseOptions(el: HTMLElement): TextMorphOptions {
  const options = {} as TextMorphOptions;
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  if (el.hasAttribute('interval')) options.interval = Number(el.getAttribute('interval'));
  if (el.hasAttribute('duration')) options.duration = Number(el.getAttribute('duration'));
  if (el.hasAttribute('font-size')) options.fontSize = Number(el.getAttribute('font-size'));
  if (el.hasAttribute('texts')) {
    try {
      options.texts = JSON.parse(el.getAttribute('texts') ?? 'null') as TextMorphOptions['texts'];
    } catch {
      /* ignore invalid JSON */
    }
  }
  const proptexts = (el as CosTextMorphElement)._texts;
  if (proptexts !== undefined) options.texts = proptexts as TextMorphOptions['texts'];
  return options;
}

class CosTextMorphElement extends HTMLElement {
  private ctrl: TextMorphController | null = null;

  _texts?: TextMorphOptions['texts'];
  get texts(): TextMorphOptions['texts'] | undefined {
    return this._texts;
  }
  set texts(value: TextMorphOptions['texts']) {
    this._texts = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return ['texts', 'interval', 'duration', 'font-size', 'color'];
  }

  connectedCallback() {
    this.ctrl = createTextMorph(this, parseOptions(this));
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
  customElements.define(TAG, CosTextMorphElement);
}

export { CosTextMorphElement, TAG };
