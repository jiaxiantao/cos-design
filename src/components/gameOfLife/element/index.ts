import { createGameOfLife, type GameOfLifeController, type GameOfLifeOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-game-of-life';

function parseOptions(_el: HTMLElement): GameOfLifeOptions {
  void _el;
  const options: GameOfLifeOptions = {};

  return options;
}

class CosGameOfLifeElement extends HTMLElement {
  private ctrl: GameOfLifeController | null = null;

  static get observedAttributes() {
    return [];
  }

  connectedCallback() {
    this.ctrl = createGameOfLife(this, parseOptions(this));
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
  customElements.define(TAG, CosGameOfLifeElement);
}

export { CosGameOfLifeElement, TAG };
