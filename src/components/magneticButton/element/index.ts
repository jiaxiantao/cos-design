import { createMagneticButton, type MagneticButtonController, type MagneticButtonOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-magnetic-button';

function parseOptions(el: HTMLElement): MagneticButtonOptions {
  const options: MagneticButtonOptions = {};
  if (el.hasAttribute('strength')) options.strength = Number(el.getAttribute('strength'));
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  return options;
}

class CosMagneticButtonElement extends HTMLElement {
  private ctrl: MagneticButtonController | null = null;

  static get observedAttributes() {
    return ['strength', 'color'];
  }

  connectedCallback() {
    this.ctrl = createMagneticButton(this, parseOptions(this));
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
  customElements.define(TAG, CosMagneticButtonElement);
}

export { CosMagneticButtonElement, TAG };
