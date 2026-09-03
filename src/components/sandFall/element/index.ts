import { createSandFall, type SandFallController, type SandFallOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-sand-fall';

function parseOptions(el: HTMLElement): SandFallOptions {
  const options = {} as SandFallOptions;
  if (el.hasAttribute('hint')) options.hint = el.getAttribute('hint') ?? undefined;
  if (el.hasAttribute('clear-text')) options.clearText = el.getAttribute('clear-text') ?? undefined;
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
  if (el.hasAttribute('cell-size')) options.cellSize = Number(el.getAttribute('cell-size'));
  if (el.hasAttribute('spawn-rate')) options.spawnRate = Number(el.getAttribute('spawn-rate'));
  if (el.hasAttribute('colors')) {
    try {
      options.colors = JSON.parse(el.getAttribute('colors') ?? 'null') as SandFallOptions['colors'];
    } catch {
      /* ignore invalid JSON */
    }
  }
  const propcolors = (el as CosSandFallElement)._colors;
  if (propcolors !== undefined) options.colors = propcolors as SandFallOptions['colors'];
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
