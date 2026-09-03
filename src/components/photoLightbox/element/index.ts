import {
  createPhotoLightbox,
  type PhotoLightboxController,
  type PhotoLightboxOptions,
} from '../core';
import '../style/index.css';

const TAG = 'cos-photo-lightbox';

function parseOptions(el: HTMLElement): PhotoLightboxOptions {
  const options = {} as PhotoLightboxOptions;
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
  if (el.hasAttribute('slide-width')) options.slideWidth = Number(el.getAttribute('slide-width'));
  if (el.hasAttribute('slide-height'))
    options.slideHeight = Number(el.getAttribute('slide-height'));
  if (el.hasAttribute('pull-threshold'))
    options.pullThreshold = Number(el.getAttribute('pull-threshold'));
  if (el.hasAttribute('show-caption'))
    options.showCaption = el.getAttribute('show-caption') !== 'false';
  if (el.hasAttribute('initial-index'))
    options.initialIndex = Number(el.getAttribute('initial-index'));
  if (el.hasAttribute('aria-label')) options.ariaLabel = el.getAttribute('aria-label') ?? undefined;
  return options;
}

class CosPhotoLightboxElement extends HTMLElement {
  private ctrl: PhotoLightboxController | null = null;

  static get observedAttributes() {
    return [
      'width',
      'height',
      'slide-width',
      'slide-height',
      'pull-threshold',
      'show-caption',
      'initial-index',
      'aria-label',
    ];
  }

  connectedCallback() {
    this.ctrl = createPhotoLightbox(this, parseOptions(this));
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
  customElements.define(TAG, CosPhotoLightboxElement);
}

export { CosPhotoLightboxElement, TAG };
