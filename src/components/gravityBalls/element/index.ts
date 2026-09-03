import { createGravityBalls, type GravityBallsController, type GravityBallsOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-gravity-balls';

function parseOptions(_el: HTMLElement): GravityBallsOptions {
  void _el;
  const options: GravityBallsOptions = {};

  return options;
}

class CosGravityBallsElement extends HTMLElement {
  private ctrl: GravityBallsController | null = null;

  static get observedAttributes() {
    return [];
  }

  connectedCallback() {
    this.ctrl = createGravityBalls(this, parseOptions(this));
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
  customElements.define(TAG, CosGravityBallsElement);
}

export { CosGravityBallsElement, TAG };
