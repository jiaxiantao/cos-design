import { createMazeGenerator, type MazeGeneratorController, type MazeGeneratorOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-maze-generator';

function parseOptions(_el: HTMLElement): MazeGeneratorOptions {
  void _el;
  const options: MazeGeneratorOptions = {};

  return options;
}

class CosMazeGeneratorElement extends HTMLElement {
  private ctrl: MazeGeneratorController | null = null;

  static get observedAttributes() {
    return [];
  }

  connectedCallback() {
    this.ctrl = createMazeGenerator(this, parseOptions(this));
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
  customElements.define(TAG, CosMazeGeneratorElement);
}

export { CosMazeGeneratorElement, TAG };
