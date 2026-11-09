import { readNumberAttr, readStringAttr } from '@cos-design/shared';
import { createWaveText, type WaveTextController, type WaveTextOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-wave-text';

function parseOptions(el: HTMLElement): WaveTextOptions {
  const options = {} as WaveTextOptions;
  readStringAttr(options, el, 'text', 'text');
  readStringAttr(options, el, 'color', 'color');
  readNumberAttr(options, el, 'amplitude', 'amplitude');
  readNumberAttr(options, el, 'fontSize', 'font-size');
  return options;
}

class CosWaveTextElement extends HTMLElement {
  private ctrl: WaveTextController | null = null;

  static get observedAttributes() {
    return ['text', 'amplitude', 'color', 'font-size'];
  }

  connectedCallback() {
    this.ctrl = createWaveText(this, parseOptions(this));
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
  customElements.define(TAG, CosWaveTextElement);
}

export { CosWaveTextElement, TAG };
