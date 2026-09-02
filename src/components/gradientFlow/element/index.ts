import { createGradientFlow, type GradientFlowController, type GradientFlowOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-gradient-flow';

function parseOptions(el: HTMLElement): GradientFlowOptions {
  const options: GradientFlowOptions = {};
  if (el.hasAttribute('text')) options.text = el.getAttribute('text') ?? undefined;
  if (el.hasAttribute('font-size')) options.fontSize = Number(el.getAttribute('font-size'));
  return options;
}

class CosGradientFlowElement extends HTMLElement {
  private ctrl: GradientFlowController | null = null;

  static get observedAttributes() {
    return ['text', 'font-size'];
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
