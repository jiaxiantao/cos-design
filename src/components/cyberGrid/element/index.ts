import {
  readBooleanAttr,
  readNumberAttr,
  readStringAttr,
} from '@cos-design/shared';
import { createCyberGrid, type CyberGridController, type CyberGridOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-cyber-grid';

function parseOptions(el: HTMLElement): CyberGridOptions {
  const options = {} as CyberGridOptions;
  readStringAttr(options, el, 'color', 'color');
  readNumberAttr(options, el, 'width', 'width');
  readNumberAttr(options, el, 'height', 'height');
  readNumberAttr(options, el, 'speed', 'speed');
  readBooleanAttr(options, el, 'fill', 'fill', 'presence');
  return options;
}

class CosCyberGridElement extends HTMLElement {
  private ctrl: CyberGridController | null = null;


  static get observedAttributes() {
    return ['width', 'height', 'fill', 'color', 'speed'];
  }

  connectedCallback() {
    this.ctrl = createCyberGrid(this, parseOptions(this));
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
  customElements.define(TAG, CosCyberGridElement);
}

export { CosCyberGridElement, TAG };
