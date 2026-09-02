import { createWaveButton, type WaveButtonController, type WaveButtonOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-wave-button';

function parseOptions(el: HTMLElement): WaveButtonOptions {
  const options: WaveButtonOptions = {};
  if (el.hasAttribute('text')) options.text = el.getAttribute('text') ?? undefined;
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  return options;
}

class CosWaveButtonElement extends HTMLElement {
  private ctrl: WaveButtonController | null = null;

  static get observedAttributes() {
    return ['text', 'color'];
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
}

if (typeof customElements !== 'undefined' && !customElements.get(TAG)) {
  customElements.define(TAG, CosWaveButtonElement);
}

export { CosWaveButtonElement, TAG };
