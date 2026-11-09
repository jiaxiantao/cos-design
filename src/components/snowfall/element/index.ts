import {
  readBooleanAttr,
  readJsonAttr,
  readNumberAttr,
  readPropertyOverride,
} from '@cos-design/shared';
import { createSnowfall, type SnowfallController, type SnowfallOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-snowfall';

function parseOptions(el: HTMLElement): SnowfallOptions {
  const options = {} as SnowfallOptions;
  readNumberAttr(options, el, 'width', 'width');
  readNumberAttr(options, el, 'height', 'height');
  readNumberAttr(options, el, 'count', 'count');
  readBooleanAttr(options, el, 'fill', 'fill', 'presence');
  readJsonAttr(options, el, 'mode', 'mode');
  readPropertyOverride(options, el, 'mode', '_mode');
  return options;
}

class CosSnowfallElement extends HTMLElement {
  private ctrl: SnowfallController | null = null;

  _mode?: SnowfallOptions['mode'];
  get mode(): SnowfallOptions['mode'] | undefined {
    return this._mode;
  }
  set mode(value: SnowfallOptions['mode']) {
    this._mode = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return ['width', 'height', 'fill', 'mode', 'count'];
  }

  connectedCallback() {
    this.ctrl = createSnowfall(this, parseOptions(this));
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
  customElements.define(TAG, CosSnowfallElement);
}

export { CosSnowfallElement, TAG };
