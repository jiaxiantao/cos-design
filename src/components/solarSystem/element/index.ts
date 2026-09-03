import { createSolarSystem, type SolarSystemController, type SolarSystemOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-solar-system';

function parseOptions(el: HTMLElement): SolarSystemOptions {
  const options = {} as SolarSystemOptions;
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
  if (el.hasAttribute('speed')) options.speed = Number(el.getAttribute('speed'));
  if (el.hasAttribute('show-orbits'))
    options.showOrbits = el.getAttribute('show-orbits') !== 'false';
  return options;
}

class CosSolarSystemElement extends HTMLElement {
  private ctrl: SolarSystemController | null = null;

  static get observedAttributes() {
    return ['width', 'height', 'speed', 'show-orbits'];
  }

  connectedCallback() {
    this.ctrl = createSolarSystem(this, parseOptions(this));
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
  customElements.define(TAG, CosSolarSystemElement);
}

export { CosSolarSystemElement, TAG };
