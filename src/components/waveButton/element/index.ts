import {
  readJsonAttr,
  readPropertyOverride,
  readStringAttr,
} from '@cos-design/shared';
import { createWaveButton, type WaveButtonController, type WaveButtonOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-wave-button';

function parseOptions(el: HTMLElement): WaveButtonOptions {
  const options = {} as WaveButtonOptions;
  readStringAttr(options, el, 'text', 'text');
  readStringAttr(options, el, 'color', 'color');
  readJsonAttr(options, el, 'buttonProps', 'button-props');
  readPropertyOverride(options, el, 'buttonProps', '_buttonProps');
  return options;
}

class CosWaveButtonElement extends HTMLElement {
  private ctrl: WaveButtonController | null = null;

  _buttonProps?: WaveButtonOptions['buttonProps'];
  get buttonProps(): WaveButtonOptions['buttonProps'] | undefined {
    return this._buttonProps;
  }
  set buttonProps(value: WaveButtonOptions['buttonProps']) {
    this._buttonProps = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return ['text', 'color', 'button-props'];
  }

  connectedCallback() {
    this.ctrl = createWaveButton(this, parseOptions(this));
  }

  disconnectedCallback() {
    this.ctrl?.destroy();
    this.ctrl = null;
  }

  attributeChangedCallback() {
    this.ctrl?.update(parseOptions(this));
  }

  getButton() {
    return this.ctrl?.getButton();
  }
}

if (typeof customElements !== 'undefined' && !customElements.get(TAG)) {
  customElements.define(TAG, CosWaveButtonElement);
}

export { CosWaveButtonElement, TAG };
