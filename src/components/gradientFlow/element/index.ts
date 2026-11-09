import {
  readJsonAttr,
  readNumberAttr,
  readPropertyOverride,
  readStringAttr,
} from '@cos-design/shared';
import { createGradientFlow, type GradientFlowController, type GradientFlowOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-gradient-flow';

function parseOptions(el: HTMLElement): GradientFlowOptions {
  const options = {} as GradientFlowOptions;
  readStringAttr(options, el, 'text', 'text');
  readNumberAttr(options, el, 'fontSize', 'font-size');
  readJsonAttr(options, el, 'colors', 'colors');
  readPropertyOverride(options, el, 'colors', '_colors');
  return options;
}

class CosGradientFlowElement extends HTMLElement {
  private ctrl: GradientFlowController | null = null;

  _colors?: GradientFlowOptions['colors'];
  get colors(): GradientFlowOptions['colors'] | undefined {
    return this._colors;
  }
  set colors(value: GradientFlowOptions['colors']) {
    this._colors = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return ['text', 'colors', 'font-size'];
  }

  connectedCallback() {
    this.ctrl = createGradientFlow(this, parseOptions(this));
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
  customElements.define(TAG, CosGradientFlowElement);
}

export { CosGradientFlowElement, TAG };
