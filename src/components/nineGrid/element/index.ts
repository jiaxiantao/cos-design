import { createNineGrid, type NineGridController, type NineGridOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-nine-grid';

function parseOptions(el: HTMLElement): NineGridOptions {
  const options = {} as NineGridOptions;
  if (el.hasAttribute('button-text'))
    options.buttonText = el.getAttribute('button-text') ?? undefined;
  if (el.hasAttribute('spinning-text'))
    options.spinningText = el.getAttribute('spinning-text') ?? undefined;
  if (el.hasAttribute('target-index'))
    options.targetIndex = Number(el.getAttribute('target-index'));
  options.disabled = el.hasAttribute('disabled');
  if (el.hasAttribute('items')) {
    try {
      options.items = JSON.parse(el.getAttribute('items') ?? 'null') as NineGridOptions['items'];
    } catch {
      /* ignore invalid JSON */
    }
  }
  const propitems = (el as CosNineGridElement)._items;
  if (propitems !== undefined) options.items = propitems as NineGridOptions['items'];
  options.onDrawEnd = (...args: unknown[]) => {
    el.dispatchEvent(
      new CustomEvent('draw-end', { detail: args.length <= 1 ? args[0] : args, bubbles: true }),
    );
  };
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
