import { createWaveText, type WaveTextController, type WaveTextOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-wave-text';

function parseOptions(el: HTMLElement): WaveTextOptions {
  const options = {} as WaveTextOptions;
  if (el.hasAttribute('text')) options.text = el.getAttribute('text') ?? undefined;
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  if (el.hasAttribute('amplitude')) options.amplitude = Number(el.getAttribute('amplitude'));
  if (el.hasAttribute('font-size')) options.fontSize = Number(el.getAttribute('font-size'));
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
