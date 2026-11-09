import {
  readJsonAttr,
  readNumberAttr,
  readPropertyOverride,
  readStringAttr,
} from '@cos-design/shared';
import { createGameOfLife, type GameOfLifeController, type GameOfLifeOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-game-of-life';

function parseOptions(el: HTMLElement): GameOfLifeOptions {
  const options = {} as GameOfLifeOptions;
  readStringAttr(options, el, 'aliveColor', 'alive-color');
  readStringAttr(options, el, 'gridColor', 'grid-color');
  readNumberAttr(options, el, 'width', 'width');
  readNumberAttr(options, el, 'height', 'height');
  readNumberAttr(options, el, 'cellSize', 'cell-size');
  readNumberAttr(options, el, 'speed', 'speed');
  readNumberAttr(options, el, 'density', 'density');
  readJsonAttr(options, el, 'labels', 'labels');
  readPropertyOverride(options, el, 'labels', '_labels');
  return options;
}

class CosGameOfLifeElement extends HTMLElement {
  private ctrl: GameOfLifeController | null = null;

  _labels?: GameOfLifeOptions['labels'];
  get labels(): GameOfLifeOptions['labels'] | undefined {
    return this._labels;
  }
  set labels(value: GameOfLifeOptions['labels']) {
    this._labels = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return [
      'width',
      'height',
      'cell-size',
      'speed',
      'density',
      'alive-color',
      'grid-color',
      'labels',
    ];
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
