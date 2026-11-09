import {
  readBooleanAttr,
  readJsonAttr,
  readNumberAttr,
  readPropertyOverride,
} from '@cos-design/shared';
import { createAurora, type AuroraController, type AuroraOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-aurora';

function parseOptions(el: HTMLElement): AuroraOptions {
  const options = {} as AuroraOptions;
  readNumberAttr(options, el, 'width', 'width');
  readNumberAttr(options, el, 'height', 'height');
  readBooleanAttr(options, el, 'fill', 'fill', 'presence');
  readJsonAttr(options, el, 'colors', 'colors');
  readPropertyOverride(options, el, 'colors', '_colors');
  return options;
}

class CosAuroraElement extends HTMLElement {
  private ctrl: AuroraController | null = null;

  _colors?: AuroraOptions['colors'];
  get colors(): AuroraOptions['colors'] | undefined {
    return this._colors;
  }
  set colors(value: AuroraOptions['colors']) {
    this._colors = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return ['width', 'height', 'fill', 'colors'];
  }

  connectedCallback() {
    this.ctrl = createAurora(this, parseOptions(this));
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
  customElements.define(TAG, CosAuroraElement);
}

export { CosAuroraElement, TAG };
