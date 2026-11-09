import {
  readNumberAttr,
  readStringAttr,
} from '@cos-design/shared';
import { createGlitchText, type GlitchTextController, type GlitchTextOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-glitch-text';

function parseOptions(el: HTMLElement): GlitchTextOptions {
  const options = {} as GlitchTextOptions;
  readStringAttr(options, el, 'text', 'text');
  readStringAttr(options, el, 'color', 'color');
  readStringAttr(options, el, 'glitchColor1', 'glitch-color1');
  readStringAttr(options, el, 'glitchColor2', 'glitch-color2');
  readNumberAttr(options, el, 'fontSize', 'font-size');
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
