import { createSmokeFog, type SmokeFogController, type SmokeFogOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-smoke-fog';

function parseOptions(el: HTMLElement): SmokeFogOptions {
  const options = {} as SmokeFogOptions;
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  if (el.hasAttribute('background-color'))
    options.backgroundColor = el.getAttribute('background-color') ?? undefined;
  if (el.hasAttribute('aria-label')) options.ariaLabel = el.getAttribute('aria-label') ?? undefined;
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
  if (el.hasAttribute('density')) options.density = Number(el.getAttribute('density'));
  if (el.hasAttribute('speed')) options.speed = Number(el.getAttribute('speed'));
  if (el.hasAttribute('disperse-strength'))
    options.disperseStrength = Number(el.getAttribute('disperse-strength'));
  if (el.hasAttribute('disperse-radius'))
    options.disperseRadius = Number(el.getAttribute('disperse-radius'));
  options.fill = el.hasAttribute('fill');
  options.interactive = el.hasAttribute('interactive');
  return options;
}

class CosSmokeFogElement extends HTMLElement {
  private ctrl: SmokeFogController | null = null;

  static get observedAttributes() {
    return [
      'width',
      'height',
      'fill',
      'density',
      'color',
      'background-color',
      'speed',
      'disperse-strength',
      'disperse-radius',
      'interactive',
      'aria-label',
    ];
  }

  connectedCallback() {
    this.ctrl = createSmokeFog(this, parseOptions(this));
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
  customElements.define(TAG, CosSmokeFogElement);
}

export { CosSmokeFogElement, TAG };
