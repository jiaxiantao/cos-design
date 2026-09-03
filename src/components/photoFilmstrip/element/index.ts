import {
  createPhotoFilmstrip,
  type PhotoFilmstripController,
  type PhotoFilmstripOptions,
} from '../core';
import '../style/index.css';

const TAG = 'cos-photo-filmstrip';

function parseOptions(el: HTMLElement): PhotoFilmstripOptions {
  const options = {} as PhotoFilmstripOptions;
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
  if (el.hasAttribute('frame-width')) options.frameWidth = Number(el.getAttribute('frame-width'));
  if (el.hasAttribute('frame-height'))
    options.frameHeight = Number(el.getAttribute('frame-height'));
  if (el.hasAttribute('frame-gap')) options.frameGap = Number(el.getAttribute('frame-gap'));
  if (el.hasAttribute('show-caption'))
    options.showCaption = el.getAttribute('show-caption') !== 'false';
  if (el.hasAttribute('friction')) options.friction = Number(el.getAttribute('friction'));
  if (el.hasAttribute('drag-sensitivity'))
    options.dragSensitivity = Number(el.getAttribute('drag-sensitivity'));
  if (el.hasAttribute('initial-index'))
    options.initialIndex = Number(el.getAttribute('initial-index'));
  if (el.hasAttribute('aria-label')) options.ariaLabel = el.getAttribute('aria-label') ?? undefined;
  return options;
}

class CosPhotoFilmstripElement extends HTMLElement {
  private ctrl: PhotoFilmstripController | null = null;

  static get observedAttributes() {
    return [
      'width',
      'height',
      'frame-width',
      'frame-height',
      'frame-gap',
      'show-caption',
      'friction',
      'drag-sensitivity',
      'initial-index',
      'aria-label',
    ];
  }

  connectedCallback() {
    this.ctrl = createPhotoFilmstrip(this, parseOptions(this));
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
  customElements.define(TAG, CosPhotoFilmstripElement);
}

export { CosPhotoFilmstripElement, TAG };
