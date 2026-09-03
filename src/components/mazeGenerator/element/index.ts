import {
  createMazeGenerator,
  type MazeGeneratorController,
  type MazeGeneratorOptions,
} from '../core';
import '../style/index.css';

const TAG = 'cos-maze-generator';

function parseOptions(el: HTMLElement): MazeGeneratorOptions {
  const options = {} as MazeGeneratorOptions;
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
  if (el.hasAttribute('cell-size')) options.cellSize = Number(el.getAttribute('cell-size'));
  options.onGenerated = (...args: unknown[]) => {
    el.dispatchEvent(
      new CustomEvent('generated', { detail: args.length <= 1 ? args[0] : args, bubbles: true }),
    );
  };
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
