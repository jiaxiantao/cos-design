import {
  createLorenzAttractor,
  type LorenzAttractorController,
  type LorenzAttractorOptions,
} from '../core';
import '../style/index.css';

const TAG = 'cos-lorenz-attractor';

function parseOptions(el: HTMLElement): LorenzAttractorOptions {
  const options = {} as LorenzAttractorOptions;
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
  if (el.hasAttribute('speed')) options.speed = Number(el.getAttribute('speed'));
  if (el.hasAttribute('point-count')) options.pointCount = Number(el.getAttribute('point-count'));
  return options;
}

class CosLorenzAttractorElement extends HTMLElement {
  private ctrl: LorenzAttractorController | null = null;

  static get observedAttributes() {
    return ['width', 'height', 'speed', 'color', 'point-count'];
  }

  connectedCallback() {
    this.ctrl = createLorenzAttractor(this, parseOptions(this));
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
  customElements.define(TAG, CosLorenzAttractorElement);
}

export { CosLorenzAttractorElement, TAG };
