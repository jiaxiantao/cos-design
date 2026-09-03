import {
  createPhotoPostcard,
  type PhotoPostcardController,
  type PhotoPostcardOptions,
} from '../core';
import '../style/index.css';

const TAG = 'cos-photo-postcard';

function parseOptions(el: HTMLElement): PhotoPostcardOptions {
  const options = {} as PhotoPostcardOptions;
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
  if (el.hasAttribute('card-width')) options.cardWidth = Number(el.getAttribute('card-width'));
  if (el.hasAttribute('card-height')) options.cardHeight = Number(el.getAttribute('card-height'));
  if (el.hasAttribute('pull-threshold'))
    options.pullThreshold = Number(el.getAttribute('pull-threshold'));
  if (el.hasAttribute('show-caption'))
    options.showCaption = el.getAttribute('show-caption') !== 'false';
  if (el.hasAttribute('initial-index'))
    options.initialIndex = Number(el.getAttribute('initial-index'));
  if (el.hasAttribute('initial-flipped'))
    options.initialFlipped = el.getAttribute('initial-flipped') !== 'false';
  if (el.hasAttribute('aria-label')) options.ariaLabel = el.getAttribute('aria-label') ?? undefined;
  return options;
}

class CosPhotoPostcardElement extends HTMLElement {
  private ctrl: PhotoPostcardController | null = null;

  static get observedAttributes() {
    return [
      'width',
      'height',
      'card-width',
      'card-height',
      'pull-threshold',
      'show-caption',
      'initial-index',
      'initial-flipped',
      'aria-label',
    ];
  }

  connectedCallback() {
    this.ctrl = createPhotoPostcard(this, parseOptions(this));
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
  customElements.define(TAG, CosPhotoPostcardElement);
}

export { CosPhotoPostcardElement, TAG };
