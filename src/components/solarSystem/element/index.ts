import { readBooleanAttr, readNumberAttr } from '@cos-design/shared';
import { createSolarSystem, type SolarSystemController, type SolarSystemOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-solar-system';

function parseOptions(el: HTMLElement): SolarSystemOptions {
  const options = {} as SolarSystemOptions;
  readNumberAttr(options, el, 'width', 'width');
  readNumberAttr(options, el, 'height', 'height');
  readNumberAttr(options, el, 'speed', 'speed');
  readBooleanAttr(options, el, 'showOrbits', 'show-orbits', 'presence');
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
