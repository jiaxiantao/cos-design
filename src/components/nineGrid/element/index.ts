import { createNineGrid, type NineGridController, type NineGridOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-nine-grid';

function parseOptions(el: HTMLElement): NineGridOptions {
  const options = {} as NineGridOptions;
  if (el.hasAttribute('items')) {
    try {
      options.items = JSON.parse(el.getAttribute('items') ?? 'null');
    } catch {
      /* ignore invalid JSON */
    }
  }
  if (el.hasAttribute('target-index'))
    options.targetIndex = Number(el.getAttribute('target-index'));
  if (el.hasAttribute('button-text'))
    options.buttonText = el.getAttribute('button-text') ?? undefined;
  if (el.hasAttribute('spinning-text'))
    options.spinningText = el.getAttribute('spinning-text') ?? undefined;
  if (el.hasAttribute('disabled')) options.disabled = el.getAttribute('disabled') !== 'false';
  return options;
}

class CosNineGridElement extends HTMLElement {
  private ctrl: NineGridController | null = null;

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
    this.ctrl?.draw(targetIndex);
  }

  reset() {
    this.ctrl?.reset();
  }
}

if (typeof customElements !== 'undefined' && !customElements.get(TAG)) {
  customElements.define(TAG, CosNineGridElement);
}

export { CosNineGridElement, TAG };
