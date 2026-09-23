import { createSpringMass, type SpringMassController, type SpringMassOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-spring-mass';

function parseOptions(el: HTMLElement): SpringMassOptions {
  const options = {} as SpringMassOptions;
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  if (el.hasAttribute('hint')) options.hint = el.getAttribute('hint') ?? undefined;
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
  if (el.hasAttribute('cols')) options.cols = Number(el.getAttribute('cols'));
  if (el.hasAttribute('rows')) options.rows = Number(el.getAttribute('rows'));
  if (el.hasAttribute('stiffness')) options.stiffness = Number(el.getAttribute('stiffness'));
  if (el.hasAttribute('damping')) options.damping = Number(el.getAttribute('damping'));
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
