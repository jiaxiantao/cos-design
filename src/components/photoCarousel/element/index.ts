import {
  createPhotoCarousel,
  type PhotoCarouselController,
  type PhotoCarouselOptions,
} from '../core';
import '../style/index.css';

const TAG = 'cos-photo-carousel';

function parseOptions(el: HTMLElement): PhotoCarouselOptions {
  const options = {} as PhotoCarouselOptions;
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
  if (el.hasAttribute('radius')) options.radius = Number(el.getAttribute('radius'));
  if (el.hasAttribute('card-width')) options.cardWidth = Number(el.getAttribute('card-width'));
  if (el.hasAttribute('card-height')) options.cardHeight = Number(el.getAttribute('card-height'));
  if (el.hasAttribute('auto-rotate'))
    options.autoRotate = el.getAttribute('auto-rotate') !== 'false';
  if (el.hasAttribute('auto-rotate-speed'))
    options.autoRotateSpeed = Number(el.getAttribute('auto-rotate-speed'));
  if (el.hasAttribute('drag-sensitivity'))
    options.dragSensitivity = Number(el.getAttribute('drag-sensitivity'));
  if (el.hasAttribute('friction')) options.friction = Number(el.getAttribute('friction'));
  if (el.hasAttribute('show-caption'))
    options.showCaption = el.getAttribute('show-caption') !== 'false';
  if (el.hasAttribute('initial-angle'))
    options.initialAngle = Number(el.getAttribute('initial-angle'));
  if (el.hasAttribute('aria-label')) options.ariaLabel = el.getAttribute('aria-label') ?? undefined;
  return options;
}

class CosPhotoCarouselElement extends HTMLElement {
  private ctrl: PhotoCarouselController | null = null;

  static get observedAttributes() {
    return [
      'width',
      'height',
      'radius',
      'card-width',
      'card-height',
      'auto-rotate',
      'auto-rotate-speed',
      'drag-sensitivity',
      'friction',
      'show-caption',
      'initial-angle',
      'aria-label',
    ];
  }

  connectedCallback() {
    this.ctrl = createPhotoCarousel(this, parseOptions(this));
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
  customElements.define(TAG, CosPhotoCarouselElement);
}

export { CosPhotoCarouselElement, TAG };
