import {
  optionCallbackDispatcher,
  readNumberAttr,
} from '@cos-design/shared';
import { createMazeGenerator, type MazeGeneratorController, type MazeGeneratorOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-maze-generator';

function parseOptions(el: HTMLElement): MazeGeneratorOptions {
  const options = {} as MazeGeneratorOptions;
  readNumberAttr(options, el, 'width', 'width');
  readNumberAttr(options, el, 'height', 'height');
  readNumberAttr(options, el, 'cellSize', 'cell-size');
  options.onGenerated = optionCallbackDispatcher(el, 'generated');
  return options;
}

class CosMazeGeneratorElement extends HTMLElement {
  private ctrl: MazeGeneratorController | null = null;


  static get observedAttributes() {
    return ['width', 'height', 'cell-size'];
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
