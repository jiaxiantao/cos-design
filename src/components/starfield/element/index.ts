import { createStarfield, type StarfieldController, type StarfieldOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-starfield';

function parseOptions(el: HTMLElement): StarfieldOptions {
  const options = {} as StarfieldOptions;
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
  if (el.hasAttribute('star-count')) options.starCount = Number(el.getAttribute('star-count'));
  if (el.hasAttribute('speed')) options.speed = Number(el.getAttribute('speed'));
  options.fill = el.hasAttribute('fill');
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
