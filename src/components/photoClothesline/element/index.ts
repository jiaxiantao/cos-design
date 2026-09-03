import {
  createPhotoClothesline,
  type PhotoClotheslineController,
  type PhotoClotheslineOptions,
} from '../core';
import '../style/index.css';

const TAG = 'cos-photo-clothesline';

function parseOptions(el: HTMLElement): PhotoClotheslineOptions {
  const options = {} as PhotoClotheslineOptions;
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
  if (el.hasAttribute('photo-width')) options.photoWidth = Number(el.getAttribute('photo-width'));
  if (el.hasAttribute('photo-height'))
    options.photoHeight = Number(el.getAttribute('photo-height'));
  if (el.hasAttribute('photo-gap')) options.photoGap = Number(el.getAttribute('photo-gap'));
  if (el.hasAttribute('rope-top')) options.ropeTop = Number(el.getAttribute('rope-top'));
  if (el.hasAttribute('rope-sag')) options.ropeSag = Number(el.getAttribute('rope-sag'));
  if (el.hasAttribute('band-length')) options.bandLength = Number(el.getAttribute('band-length'));
  if (el.hasAttribute('band-width')) options.bandWidth = Number(el.getAttribute('band-width'));
  if (el.hasAttribute('max-pull')) options.maxPull = Number(el.getAttribute('max-pull'));
  if (el.hasAttribute('stiffness')) options.stiffness = Number(el.getAttribute('stiffness'));
  if (el.hasAttribute('damping')) options.damping = Number(el.getAttribute('damping'));
  if (el.hasAttribute('tension')) options.tension = Number(el.getAttribute('tension'));
  if (el.hasAttribute('tilt')) options.tilt = Number(el.getAttribute('tilt'));
  if (el.hasAttribute('rope-color')) options.ropeColor = el.getAttribute('rope-color') ?? undefined;
  if (el.hasAttribute('band-color')) options.bandColor = el.getAttribute('band-color') ?? undefined;
  if (el.hasAttribute('pin-color')) options.pinColor = el.getAttribute('pin-color') ?? undefined;
  if (el.hasAttribute('frame-color'))
    options.frameColor = el.getAttribute('frame-color') ?? undefined;
  if (el.hasAttribute('background'))
    options.background = el.getAttribute('background') ?? undefined;
  if (el.hasAttribute('object-fit')) options.objectFit = el.getAttribute('object-fit') ?? undefined;
  if (el.hasAttribute('show-caption'))
    options.showCaption = el.getAttribute('show-caption') !== 'false';
  if (el.hasAttribute('initial-index'))
    options.initialIndex = Number(el.getAttribute('initial-index'));
  if (el.hasAttribute('aria-label')) options.ariaLabel = el.getAttribute('aria-label') ?? undefined;
  return options;
}

class CosPhotoClotheslineElement extends HTMLElement {
  private ctrl: PhotoClotheslineController | null = null;

  static get observedAttributes() {
    return [
      'width',
      'height',
      'photo-width',
      'photo-height',
      'photo-gap',
      'rope-top',
      'rope-sag',
      'band-length',
      'band-width',
      'max-pull',
      'stiffness',
      'damping',
      'tension',
      'tilt',
      'rope-color',
      'band-color',
      'pin-color',
      'frame-color',
      'background',
      'object-fit',
      'show-caption',
      'initial-index',
      'aria-label',
    ];
  }

  connectedCallback() {
    this.ctrl = createPhotoClothesline(this, parseOptions(this));
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
  customElements.define(TAG, CosPhotoClotheslineElement);
}

export { CosPhotoClotheslineElement, TAG };
