import { createMatrixRain, type MatrixRainController, type MatrixRainOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-matrix-rain';

function parseOptions(el: HTMLElement): MatrixRainOptions {
  const options = {} as MatrixRainOptions;
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  if (el.hasAttribute('title')) options.title = el.getAttribute('title') ?? undefined;
  if (el.hasAttribute('subtitle')) options.subtitle = el.getAttribute('subtitle') ?? undefined;
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
  if (el.hasAttribute('density')) options.density = Number(el.getAttribute('density'));
  options.fill = el.hasAttribute('fill');
  options.showOverlay = el.hasAttribute('show-overlay');
  return options;
}

class CosMatrixRainElement extends HTMLElement {
  private ctrl: MatrixRainController | null = null;

  static get observedAttributes() {
    return ['width', 'height', 'fill', 'density', 'color', 'show-overlay', 'title', 'subtitle'];
  }

  connectedCallback() {
    this.ctrl = createMatrixRain(this, parseOptions(this));
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
  customElements.define(TAG, CosMatrixRainElement);
}

export { CosMatrixRainElement, TAG };
