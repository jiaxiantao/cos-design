import { createGravityBalls, type GravityBallsController, type GravityBallsOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-gravity-balls';

function parseOptions(el: HTMLElement): GravityBallsOptions {
  const options = {} as GravityBallsOptions;
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
  if (el.hasAttribute('ball-count')) options.ballCount = Number(el.getAttribute('ball-count'));
  return options;
}

class CosGravityBallsElement extends HTMLElement {
  private ctrl: GravityBallsController | null = null;

  static get observedAttributes() {
    return ['width', 'height', 'ball-count'];
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
