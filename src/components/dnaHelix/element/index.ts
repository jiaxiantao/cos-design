import { readNumberAttr, readStringAttr } from '@cos-design/shared';
import { createDnaHelix, type DnaHelixController, type DnaHelixOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-dna-helix';

function parseOptions(el: HTMLElement): DnaHelixOptions {
  const options = {} as DnaHelixOptions;
  readStringAttr(options, el, 'color', 'color');
  readNumberAttr(options, el, 'width', 'width');
  readNumberAttr(options, el, 'height', 'height');
  readNumberAttr(options, el, 'speed', 'speed');
  return options;
}

class CosDnaHelixElement extends HTMLElement {
  private ctrl: DnaHelixController | null = null;

  static get observedAttributes() {
    return ['width', 'height', 'speed', 'color'];
  }

  connectedCallback() {
    this.ctrl = createDnaHelix(this, parseOptions(this));
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
  customElements.define(TAG, CosDnaHelixElement);
}

export { CosDnaHelixElement, TAG };
