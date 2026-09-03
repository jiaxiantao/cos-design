import { createPhotoFridge, type PhotoFridgeController, type PhotoFridgeOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-photo-fridge';

function parseOptions(el: HTMLElement): PhotoFridgeOptions {
  const options = {} as PhotoFridgeOptions;
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
  if (el.hasAttribute('card-width')) options.cardWidth = Number(el.getAttribute('card-width'));
  if (el.hasAttribute('card-height')) options.cardHeight = Number(el.getAttribute('card-height'));
  if (el.hasAttribute('scatter')) options.scatter = Number(el.getAttribute('scatter'));
  if (el.hasAttribute('friction')) options.friction = Number(el.getAttribute('friction'));
  if (el.hasAttribute('show-caption'))
    options.showCaption = el.getAttribute('show-caption') !== 'false';
  if (el.hasAttribute('initial-index'))
    options.initialIndex = Number(el.getAttribute('initial-index'));
  if (el.hasAttribute('aria-label')) options.ariaLabel = el.getAttribute('aria-label') ?? undefined;
  return options;
}

class CosPhotoFridgeElement extends HTMLElement {
  private ctrl: PhotoFridgeController | null = null;

  static get observedAttributes() {
    return [
      'width',
      'height',
      'card-width',
      'card-height',
      'scatter',
      'friction',
      'show-caption',
      'initial-index',
      'aria-label',
    ];
  }

  connectedCallback() {
    this.ctrl = createPhotoFridge(this, parseOptions(this));
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
  customElements.define(TAG, CosPhotoFridgeElement);
}

export { CosPhotoFridgeElement, TAG };
