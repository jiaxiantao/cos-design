import { createMeteorRain, type MeteorRainController, type MeteorRainOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-meteor-rain';

function parseOptions(_el: HTMLElement): MeteorRainOptions {
  void _el;
  const options: MeteorRainOptions = {};

  return options;
}

class CosMeteorRainElement extends HTMLElement {
  private ctrl: MeteorRainController | null = null;

  static get observedAttributes() {
    return [];
  }

  connectedCallback() {
    this.ctrl = createMeteorRain(this, parseOptions(this));
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
  customElements.define(TAG, CosMeteorRainElement);
}

export { CosMeteorRainElement, TAG };
