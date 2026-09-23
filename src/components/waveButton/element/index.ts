import { createWaveButton, type WaveButtonController, type WaveButtonOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-wave-button';

function parseOptions(el: HTMLElement): WaveButtonOptions {
  const options = {} as WaveButtonOptions;
  if (el.hasAttribute('text')) options.text = el.getAttribute('text') ?? undefined;
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  if (el.hasAttribute('button-props')) {
    try {
      options.buttonProps = JSON.parse(
        el.getAttribute('button-props') ?? 'null',
      ) as WaveButtonOptions['buttonProps'];
    } catch {
      /* ignore invalid JSON */
    }
  }
  const propbuttonProps = (el as CosWaveButtonElement)._buttonProps;
  if (propbuttonProps !== undefined)
    options.buttonProps = propbuttonProps as WaveButtonOptions['buttonProps'];
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
