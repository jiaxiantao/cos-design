import { createDnaHelix, type DnaHelixController, type DnaHelixOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-dna-helix';

function parseOptions(el: HTMLElement): DnaHelixOptions {
  const options = {} as DnaHelixOptions;
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
  if (el.hasAttribute('speed')) options.speed = Number(el.getAttribute('speed'));
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
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
