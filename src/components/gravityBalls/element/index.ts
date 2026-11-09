import {
  readNumberAttr,
} from '@cos-design/shared';
import { createGravityBalls, type GravityBallsController, type GravityBallsOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-gravity-balls';

function parseOptions(el: HTMLElement): GravityBallsOptions {
  const options = {} as GravityBallsOptions;
  readNumberAttr(options, el, 'width', 'width');
  readNumberAttr(options, el, 'height', 'height');
  readNumberAttr(options, el, 'ballCount', 'ball-count');
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
