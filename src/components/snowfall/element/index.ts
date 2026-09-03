import { createSnowfall, type SnowfallController, type SnowfallOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-snowfall';

function parseOptions(el: HTMLElement): SnowfallOptions {
  const options = {} as SnowfallOptions;
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
  if (el.hasAttribute('count')) options.count = Number(el.getAttribute('count'));
  options.fill = el.hasAttribute('fill');
  if (el.hasAttribute('mode')) {
    try {
      options.mode = JSON.parse(el.getAttribute('mode') ?? 'null') as SnowfallOptions['mode'];
    } catch {
      /* ignore invalid JSON */
    }
  }
  const propmode = (el as CosSnowfallElement)._mode;
  if (propmode !== undefined) options.mode = propmode as SnowfallOptions['mode'];
  return options;
}

class CosSnowfallElement extends HTMLElement {
  private ctrl: SnowfallController | null = null;

  _mode?: SnowfallOptions['mode'];
  get mode(): SnowfallOptions['mode'] | undefined {
    return this._mode;
  }
  set mode(value: SnowfallOptions['mode']) {
    this._mode = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return ['width', 'height', 'fill', 'mode', 'count'];
  }

  connectedCallback() {
    this.ctrl = createSnowfall(this, parseOptions(this));
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
  customElements.define(TAG, CosSnowfallElement);
}

export { CosSnowfallElement, TAG };
