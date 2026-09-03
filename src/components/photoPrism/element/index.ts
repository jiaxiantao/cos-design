import { createPhotoPrism, type PhotoPrismController, type PhotoPrismOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-photo-prism';

function parseOptions(el: HTMLElement): PhotoPrismOptions {
  const options = {} as PhotoPrismOptions;
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
  if (el.hasAttribute('size')) options.size = Number(el.getAttribute('size'));
  if (el.hasAttribute('auto-rotate'))
    options.autoRotate = el.getAttribute('auto-rotate') !== 'false';
  if (el.hasAttribute('drag-sensitivity'))
    options.dragSensitivity = Number(el.getAttribute('drag-sensitivity'));
  if (el.hasAttribute('friction')) options.friction = Number(el.getAttribute('friction'));
  if (el.hasAttribute('show-caption'))
    options.showCaption = el.getAttribute('show-caption') !== 'false';
  if (el.hasAttribute('aria-label')) options.ariaLabel = el.getAttribute('aria-label') ?? undefined;
  return options;
}

class CosPhotoPrismElement extends HTMLElement {
  private ctrl: PhotoPrismController | null = null;

  static get observedAttributes() {
    return [
      'width',
      'height',
      'size',
      'auto-rotate',
      'drag-sensitivity',
      'friction',
      'show-caption',
      'aria-label',
    ];
  }

  connectedCallback() {
    this.ctrl = createPhotoPrism(this, parseOptions(this));
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
  customElements.define(TAG, CosPhotoPrismElement);
}

export { CosPhotoPrismElement, TAG };
