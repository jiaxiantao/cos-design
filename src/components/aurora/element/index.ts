import { createAurora, type AuroraController, type AuroraOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-aurora';

function parseOptions(el: HTMLElement): AuroraOptions {
  const options = {} as AuroraOptions;
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
  options.fill = el.hasAttribute('fill');
  if (el.hasAttribute('colors')) {
    try {
      options.colors = JSON.parse(el.getAttribute('colors') ?? 'null') as AuroraOptions['colors'];
    } catch {
      /* ignore invalid JSON */
    }
  }
  const propcolors = (el as CosAuroraElement)._colors;
  if (propcolors !== undefined) options.colors = propcolors as AuroraOptions['colors'];
  return options;
}

class CosAuroraElement extends HTMLElement {
  private ctrl: AuroraController | null = null;

  _colors?: AuroraOptions['colors'];
  get colors(): AuroraOptions['colors'] | undefined {
    return this._colors;
  }
  set colors(value: AuroraOptions['colors']) {
    this._colors = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return ['width', 'height', 'fill', 'colors'];
  }

  connectedCallback() {
    this.ctrl = createAurora(this, parseOptions(this));
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
  customElements.define(TAG, CosAuroraElement);
}

export { CosAuroraElement, TAG };
