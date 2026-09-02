import { createGlitchText, type GlitchTextController, type GlitchTextOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-glitch-text';

function parseOptions(el: HTMLElement): GlitchTextOptions {
  const options: GlitchTextOptions = {};
  if (el.hasAttribute('text')) options.text = el.getAttribute('text') ?? undefined;
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  if (el.hasAttribute('glitch-color1')) options.glitchColor1 = el.getAttribute('glitch-color1') ?? undefined;
  if (el.hasAttribute('glitch-color2')) options.glitchColor2 = el.getAttribute('glitch-color2') ?? undefined;
  if (el.hasAttribute('font-size')) options.fontSize = Number(el.getAttribute('font-size'));
  return options;
}

class CosGlitchTextElement extends HTMLElement {
  private ctrl: GlitchTextController | null = null;

  static get observedAttributes() {
    return ['text', 'color', 'glitch-color1', 'glitch-color2', 'font-size'];
  }

  connectedCallback() {
    this.ctrl = createGlitchText(this, parseOptions(this));
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
  customElements.define(TAG, CosGlitchTextElement);
}

export { CosGlitchTextElement, TAG };
