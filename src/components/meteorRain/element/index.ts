import {
  readBooleanAttr,
  readNumberAttr,
} from '@cos-design/shared';
import { createMeteorRain, type MeteorRainController, type MeteorRainOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-meteor-rain';

function parseOptions(el: HTMLElement): MeteorRainOptions {
  const options = {} as MeteorRainOptions;
  readNumberAttr(options, el, 'width', 'width');
  readNumberAttr(options, el, 'height', 'height');
  readNumberAttr(options, el, 'meteorCount', 'meteor-count');
  readBooleanAttr(options, el, 'fill', 'fill', 'presence');
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
