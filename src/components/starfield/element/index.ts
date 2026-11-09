import {
  readBooleanAttr,
  readNumberAttr,
} from '@cos-design/shared';
import { createStarfield, type StarfieldController, type StarfieldOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-starfield';

function parseOptions(el: HTMLElement): StarfieldOptions {
  const options = {} as StarfieldOptions;
  readNumberAttr(options, el, 'width', 'width');
  readNumberAttr(options, el, 'height', 'height');
  readNumberAttr(options, el, 'starCount', 'star-count');
  readNumberAttr(options, el, 'speed', 'speed');
  readBooleanAttr(options, el, 'fill', 'fill', 'presence');
  return options;
}

class CosStarfieldElement extends HTMLElement {
  private ctrl: StarfieldController | null = null;


  static get observedAttributes() {
    return ['width', 'height', 'fill', 'star-count', 'speed'];
  }

  connectedCallback() {
    this.ctrl = createStarfield(this, parseOptions(this));
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
  customElements.define(TAG, CosStarfieldElement);
}

export { CosStarfieldElement, TAG };
