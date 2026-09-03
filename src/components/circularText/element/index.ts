import { createCircularText, type CircularTextController, type CircularTextOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-circular-text';

function parseOptions(el: HTMLElement): CircularTextOptions {
  const options = {} as CircularTextOptions;
  if (el.hasAttribute('text')) options.text = el.getAttribute('text') ?? undefined;
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  if (el.hasAttribute('spin-duration'))
    options.spinDuration = Number(el.getAttribute('spin-duration'));
  if (el.hasAttribute('font-size')) options.fontSize = Number(el.getAttribute('font-size'));
  if (el.hasAttribute('radius')) options.radius = Number(el.getAttribute('radius'));
  if (el.hasAttribute('on-hover')) {
    try {
      options.onHover = JSON.parse(
        el.getAttribute('on-hover') ?? 'null',
      ) as CircularTextOptions['onHover'];
    } catch {
      /* ignore invalid JSON */
    }
  }
  const proponHover = (el as CosCircularTextElement)._onHover;
  if (proponHover !== undefined) options.onHover = proponHover as CircularTextOptions['onHover'];
  return options;
}

class CosCircularTextElement extends HTMLElement {
  private ctrl: CircularTextController | null = null;

  _onHover?: CircularTextOptions['onHover'];
  get onHover(): CircularTextOptions['onHover'] | undefined {
    return this._onHover;
  }
  set onHover(value: CircularTextOptions['onHover']) {
    this._onHover = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return ['text', 'spin-duration', 'on-hover', 'font-size', 'radius', 'color'];
  }

  connectedCallback() {
    this.ctrl = createCircularText(this, parseOptions(this));
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
  customElements.define(TAG, CosCircularTextElement);
}

export { CosCircularTextElement, TAG };
