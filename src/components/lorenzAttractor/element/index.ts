import {
  readNumberAttr,
  readStringAttr,
} from '@cos-design/shared';
import { createLorenzAttractor, type LorenzAttractorController, type LorenzAttractorOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-lorenz-attractor';

function parseOptions(el: HTMLElement): LorenzAttractorOptions {
  const options = {} as LorenzAttractorOptions;
  readStringAttr(options, el, 'color', 'color');
  readNumberAttr(options, el, 'width', 'width');
  readNumberAttr(options, el, 'height', 'height');
  readNumberAttr(options, el, 'speed', 'speed');
  readNumberAttr(options, el, 'pointCount', 'point-count');
  return options;
}

class CosLorenzAttractorElement extends HTMLElement {
  private ctrl: LorenzAttractorController | null = null;


  static get observedAttributes() {
    return ['width', 'height', 'speed', 'color', 'point-count'];
  }

  connectedCallback() {
    this.ctrl = createLorenzAttractor(this, parseOptions(this));
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
  customElements.define(TAG, CosLorenzAttractorElement);
}

export { CosLorenzAttractorElement, TAG };
