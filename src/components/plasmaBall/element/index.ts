import { createPlasmaBall, type PlasmaBallController, type PlasmaBallOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-plasma-ball';

function parseOptions(el: HTMLElement): PlasmaBallOptions {
  const options = {} as PlasmaBallOptions;
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
  if (el.hasAttribute('arc-count')) options.arcCount = Number(el.getAttribute('arc-count'));
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
