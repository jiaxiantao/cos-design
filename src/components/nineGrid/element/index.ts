import {
  optionCallbackDispatcher,
  readBooleanAttr,
  readJsonAttr,
  readNumberAttr,
  readPropertyOverride,
  readStringAttr,
} from '@cos-design/shared';
import { createNineGrid, type NineGridController, type NineGridOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-nine-grid';

function parseOptions(el: HTMLElement): NineGridOptions {
  const options = {} as NineGridOptions;
  readStringAttr(options, el, 'buttonText', 'button-text');
  readStringAttr(options, el, 'spinningText', 'spinning-text');
  readNumberAttr(options, el, 'targetIndex', 'target-index');
  readBooleanAttr(options, el, 'disabled', 'disabled', 'optional-true');
  readJsonAttr(options, el, 'items', 'items');
  readPropertyOverride(options, el, 'items', '_items');
  options.onDrawEnd = optionCallbackDispatcher(el, 'draw-end');
  return options;
}

class CosNineGridElement extends HTMLElement {
  private ctrl: NineGridController | null = null;

  _items?: NineGridOptions['items'];
  get items(): NineGridOptions['items'] | undefined {
    return this._items;
  }
  set items(value: NineGridOptions['items']) {
    this._items = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return ['items', 'target-index', 'button-text', 'spinning-text', 'disabled'];
  }

  connectedCallback() {
    this.ctrl = createNineGrid(this, parseOptions(this));
  }

  disconnectedCallback() {
    this.ctrl?.destroy();
    this.ctrl = null;
  }

  attributeChangedCallback() {
    this.ctrl?.update(parseOptions(this));
  }

  draw(targetIndex?: number) {
    return this.ctrl?.draw(targetIndex);
  }
  reset() {
    return this.ctrl?.reset();
  }
}

if (typeof customElements !== 'undefined' && !customElements.get(TAG)) {
  customElements.define(TAG, CosNineGridElement);
}

export { CosNineGridElement, TAG };
