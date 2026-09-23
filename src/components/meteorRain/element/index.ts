import { createMeteorRain, type MeteorRainController, type MeteorRainOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-meteor-rain';

function parseOptions(el: HTMLElement): MeteorRainOptions {
  const options = {} as MeteorRainOptions;
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
  if (el.hasAttribute('meteor-count'))
    options.meteorCount = Number(el.getAttribute('meteor-count'));
  options.fill = el.hasAttribute('fill');
  return options;
}

class CosMeteorRainElement extends HTMLElement {
  private ctrl: MeteorRainController | null = null;

  static get observedAttributes() {
    return ['width', 'height', 'fill', 'meteor-count'];
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
