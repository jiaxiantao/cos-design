import { createAuroraVeil, type AuroraVeilController, type AuroraVeilOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-aurora-veil';

function parseOptions(el: HTMLElement): AuroraVeilOptions {
  const options = {} as AuroraVeilOptions;
  if (el.hasAttribute('aria-label')) options.ariaLabel = el.getAttribute('aria-label') ?? undefined;
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
  if (el.hasAttribute('band-count')) options.bandCount = Number(el.getAttribute('band-count'));
  if (el.hasAttribute('speed')) options.speed = Number(el.getAttribute('speed'));
  options.fill = el.hasAttribute('fill');
  options.interactive = el.hasAttribute('interactive');
  if (el.hasAttribute('colors')) {
    try {
      options.colors = JSON.parse(
        el.getAttribute('colors') ?? 'null',
      ) as AuroraVeilOptions['colors'];
    } catch {
      /* ignore invalid JSON */
    }
  }
  const propcolors = (el as CosAuroraVeilElement)._colors;
  if (propcolors !== undefined) options.colors = propcolors as AuroraVeilOptions['colors'];
  return options;
}

class CosAuroraVeilElement extends HTMLElement {
  private ctrl: AuroraVeilController | null = null;

  _colors?: AuroraVeilOptions['colors'];
  get colors(): AuroraVeilOptions['colors'] | undefined {
    return this._colors;
  }
  set colors(value: AuroraVeilOptions['colors']) {
    this._colors = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return [
      'width',
      'height',
      'fill',
      'colors',
      'band-count',
      'speed',
      'interactive',
      'aria-label',
    ];
  }

  connectedCallback() {
    this.ctrl = createAuroraVeil(this, parseOptions(this));
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
  customElements.define(TAG, CosAuroraVeilElement);
}

export { CosAuroraVeilElement, TAG };
