import { readNumberAttr, readStringAttr } from '@cos-design/shared';
import {
  createDoublePendulum,
  type DoublePendulumController,
  type DoublePendulumOptions,
} from '../core';
import '../style/index.css';

const TAG = 'cos-double-pendulum';

function parseOptions(el: HTMLElement): DoublePendulumOptions {
  const options = {} as DoublePendulumOptions;
  readStringAttr(options, el, 'color', 'color');
  readStringAttr(options, el, 'color2', 'color2');
  readNumberAttr(options, el, 'width', 'width');
  readNumberAttr(options, el, 'height', 'height');
  readNumberAttr(options, el, 'trailLength', 'trail-length');
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
