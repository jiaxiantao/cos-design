import { readNumberAttr, readStringAttr } from '@cos-design/shared';
import { createSpringMass, type SpringMassController, type SpringMassOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-spring-mass';

function parseOptions(el: HTMLElement): SpringMassOptions {
  const options = {} as SpringMassOptions;
  readStringAttr(options, el, 'color', 'color');
  readStringAttr(options, el, 'hint', 'hint');
  readNumberAttr(options, el, 'width', 'width');
  readNumberAttr(options, el, 'height', 'height');
  readNumberAttr(options, el, 'cols', 'cols');
  readNumberAttr(options, el, 'rows', 'rows');
  readNumberAttr(options, el, 'stiffness', 'stiffness');
  readNumberAttr(options, el, 'damping', 'damping');
  return options;
}

class CosSpringMassElement extends HTMLElement {
  private ctrl: SpringMassController | null = null;

  static get observedAttributes() {
    return ['width', 'height', 'cols', 'rows', 'stiffness', 'damping', 'color', 'hint'];
  }

  connectedCallback() {
    this.ctrl = createSpringMass(this, parseOptions(this));
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
  customElements.define(TAG, CosSpringMassElement);
}

export { CosSpringMassElement, TAG };
