import {
  readJsonAttr,
  readNumberAttr,
  readPropertyOverride,
  readStringAttr,
} from '@cos-design/shared';
import { createSandFall, type SandFallController, type SandFallOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-sand-fall';

function parseOptions(el: HTMLElement): SandFallOptions {
  const options = {} as SandFallOptions;
  readStringAttr(options, el, 'hint', 'hint');
  readStringAttr(options, el, 'clearText', 'clear-text');
  readNumberAttr(options, el, 'width', 'width');
  readNumberAttr(options, el, 'height', 'height');
  readNumberAttr(options, el, 'cellSize', 'cell-size');
  readNumberAttr(options, el, 'spawnRate', 'spawn-rate');
  readJsonAttr(options, el, 'colors', 'colors');
  readPropertyOverride(options, el, 'colors', '_colors');
  return options;
}

class CosSandFallElement extends HTMLElement {
  private ctrl: SandFallController | null = null;

  _colors?: SandFallOptions['colors'];
  get colors(): SandFallOptions['colors'] | undefined {
    return this._colors;
  }
  set colors(value: SandFallOptions['colors']) {
    this._colors = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return ['width', 'height', 'cell-size', 'colors', 'spawn-rate', 'hint', 'clear-text'];
  }

  connectedCallback() {
    this.ctrl = createSandFall(this, parseOptions(this));
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
  customElements.define(TAG, CosSandFallElement);
}

export { CosSandFallElement, TAG };
