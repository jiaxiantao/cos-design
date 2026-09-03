import {
  createDoublePendulum,
  type DoublePendulumController,
  type DoublePendulumOptions,
} from '../core';
import '../style/index.css';

const TAG = 'cos-double-pendulum';

function parseOptions(el: HTMLElement): DoublePendulumOptions {
  const options = {} as DoublePendulumOptions;
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
  if (el.hasAttribute('trail-length'))
    options.trailLength = Number(el.getAttribute('trail-length'));
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  if (el.hasAttribute('color2')) options.color2 = el.getAttribute('color2') ?? undefined;
  return options;
}

class CosDoublePendulumElement extends HTMLElement {
  private ctrl: DoublePendulumController | null = null;

  static get observedAttributes() {
    return ['width', 'height', 'trail-length', 'color', 'color2'];
  }

  connectedCallback() {
    this.ctrl = createDoublePendulum(this, parseOptions(this));
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
  customElements.define(TAG, CosDoublePendulumElement);
}

export { CosDoublePendulumElement, TAG };
