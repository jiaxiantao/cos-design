import {
  readNumberAttr,
  readStringAttr,
} from '@cos-design/shared';
import { createPlasmaBall, type PlasmaBallController, type PlasmaBallOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-plasma-ball';

function parseOptions(el: HTMLElement): PlasmaBallOptions {
  const options = {} as PlasmaBallOptions;
  readStringAttr(options, el, 'color', 'color');
  readNumberAttr(options, el, 'width', 'width');
  readNumberAttr(options, el, 'height', 'height');
  readNumberAttr(options, el, 'arcCount', 'arc-count');
  return options;
}

class CosPlasmaBallElement extends HTMLElement {
  private ctrl: PlasmaBallController | null = null;


  static get observedAttributes() {
    return ['width', 'height', 'color', 'arc-count'];
  }

  connectedCallback() {
    this.ctrl = createPlasmaBall(this, parseOptions(this));
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
  customElements.define(TAG, CosPlasmaBallElement);
}

export { CosPlasmaBallElement, TAG };
