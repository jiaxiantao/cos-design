import {
  createDandelionField,
  type DandelionFieldController,
  type DandelionFieldOptions,
} from '../core';
import '../style/index.css';

const TAG = 'cos-dandelion-field';

function parseOptions(el: HTMLElement): DandelionFieldOptions {
  const options = {} as DandelionFieldOptions;
  if (el.hasAttribute('aria-label')) options.ariaLabel = el.getAttribute('aria-label') ?? undefined;
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
  if (el.hasAttribute('plant-count')) options.plantCount = Number(el.getAttribute('plant-count'));
  if (el.hasAttribute('seed-count')) options.seedCount = Number(el.getAttribute('seed-count'));
  if (el.hasAttribute('speed')) options.speed = Number(el.getAttribute('speed'));
  options.fill = el.hasAttribute('fill');
  if (el.hasAttribute('interactive')) {
    const raw = el.getAttribute('interactive');
    options.interactive = raw !== 'false' && raw !== '0';
  }
  return options;
}

class CosDandelionFieldElement extends HTMLElement {
  private ctrl: DandelionFieldController | null = null;

  static get observedAttributes() {
    return [
      'width',
      'height',
      'fill',
      'plant-count',
      'seed-count',
      'speed',
      'interactive',
      'aria-label',
    ];
  }

  connectedCallback() {
    this.ctrl = createDandelionField(this, parseOptions(this));
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
  customElements.define(TAG, CosDandelionFieldElement);
}

export { CosDandelionFieldElement, TAG };
