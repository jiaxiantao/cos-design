import {
  readBooleanAttr,
  readJsonAttr,
  readNumberAttr,
  readPropertyOverride,
  readStringAttr,
} from '@cos-design/shared';
import { createAuroraVeil, type AuroraVeilController, type AuroraVeilOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-aurora-veil';

function parseOptions(el: HTMLElement): AuroraVeilOptions {
  const options = {} as AuroraVeilOptions;
  readStringAttr(options, el, 'ariaLabel', 'aria-label');
  readNumberAttr(options, el, 'width', 'width');
  readNumberAttr(options, el, 'height', 'height');
  readNumberAttr(options, el, 'bandCount', 'band-count');
  readNumberAttr(options, el, 'speed', 'speed');
  readBooleanAttr(options, el, 'fill', 'fill', 'presence');
  readBooleanAttr(options, el, 'interactive', 'interactive', 'optional-true');
  readJsonAttr(options, el, 'colors', 'colors');
  readPropertyOverride(options, el, 'colors', '_colors');
  return options;
}

class CosAuroraVeilElement extends HTMLElement {
  private ctrl: AuroraVeilController | null = null;

  _colors?: AuroraVeilOptions['colors'];
  get colors(): AuroraVeilOptions['colors'] | undefined {
    return this._colors;
  }
  set colors(value: AuroraVeilOptions['colors']) {
    this._colors = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return [
      'width',
      'height',
      'fill',
      'colors',
      'band-count',
      'speed',
      'interactive',
      'aria-label',
    ];
  }

  connectedCallback() {
    this.ctrl = createAuroraVeil(this, parseOptions(this));
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
  customElements.define(TAG, CosAuroraVeilElement);
}

export { CosAuroraVeilElement, TAG };
