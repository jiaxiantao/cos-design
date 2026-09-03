import { createGameOfLife, type GameOfLifeController, type GameOfLifeOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-game-of-life';

function parseOptions(el: HTMLElement): GameOfLifeOptions {
  const options = {} as GameOfLifeOptions;
  if (el.hasAttribute('alive-color'))
    options.aliveColor = el.getAttribute('alive-color') ?? undefined;
  if (el.hasAttribute('grid-color')) options.gridColor = el.getAttribute('grid-color') ?? undefined;
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
  if (el.hasAttribute('cell-size')) options.cellSize = Number(el.getAttribute('cell-size'));
  if (el.hasAttribute('speed')) options.speed = Number(el.getAttribute('speed'));
  if (el.hasAttribute('density')) options.density = Number(el.getAttribute('density'));
  if (el.hasAttribute('labels')) {
    try {
      options.labels = JSON.parse(
        el.getAttribute('labels') ?? 'null',
      ) as GameOfLifeOptions['labels'];
    } catch {
      /* ignore invalid JSON */
    }
  }
  const proplabels = (el as CosGameOfLifeElement)._labels;
  if (proplabels !== undefined) options.labels = proplabels as GameOfLifeOptions['labels'];
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
