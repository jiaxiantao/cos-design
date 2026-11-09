import {
  readJsonAttr,
  readNumberAttr,
  readPropertyOverride,
  readStringAttr,
} from '@cos-design/shared';
import { createCircularText, type CircularTextController, type CircularTextOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-circular-text';

function parseOptions(el: HTMLElement): CircularTextOptions {
  const options = {} as CircularTextOptions;
  readStringAttr(options, el, 'text', 'text');
  readStringAttr(options, el, 'color', 'color');
  readNumberAttr(options, el, 'spinDuration', 'spin-duration');
  readNumberAttr(options, el, 'fontSize', 'font-size');
  readNumberAttr(options, el, 'radius', 'radius');
  readJsonAttr(options, el, 'onHover', 'on-hover');
  readPropertyOverride(options, el, 'onHover', '_onHover');
  return options;
}

class CosCircularTextElement extends HTMLElement {
  private ctrl: CircularTextController | null = null;

  _onHover?: CircularTextOptions['onHover'];
  get onHover(): CircularTextOptions['onHover'] | undefined {
    return this._onHover;
  }
  set onHover(value: CircularTextOptions['onHover']) {
    this._onHover = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return ['text', 'spin-duration', 'on-hover', 'font-size', 'radius', 'color'];
  }

  connectedCallback() {
    this.ctrl = createCircularText(this, parseOptions(this));
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
  customElements.define(TAG, CosCircularTextElement);
}

export { CosCircularTextElement, TAG };
