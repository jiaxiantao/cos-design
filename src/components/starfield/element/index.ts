import { createStarfield, type StarfieldController, type StarfieldOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-starfield';

function parseOptions(_el: HTMLElement): StarfieldOptions {
  void _el;
  const options: StarfieldOptions = {};
  if (_el.hasAttribute('width')) options.width = Number(_el.getAttribute('width'));
  if (_el.hasAttribute('height')) options.height = Number(_el.getAttribute('height'));
  if (_el.hasAttribute('fill')) options.fill = true;
  if (_el.hasAttribute('star-count')) options.starCount = Number(_el.getAttribute('star-count'));
  if (_el.hasAttribute('speed')) options.speed = Number(_el.getAttribute('speed'));
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
