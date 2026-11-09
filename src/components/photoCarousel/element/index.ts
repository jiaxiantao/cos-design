import {
  optionCallbackDispatcher,
  readBooleanAttr,
  readJsonAttr,
  readNumberAttr,
  readPropertyOverride,
  readStringAttr,
} from '@cos-design/shared';
import {
  createPhotoCarousel,
  type PhotoCarouselController,
  type PhotoCarouselOptions,
} from '../core';
import '../style/index.css';

const TAG = 'cos-photo-carousel';

function parseOptions(el: HTMLElement): PhotoCarouselOptions {
  const options = {} as PhotoCarouselOptions;
  readStringAttr(options, el, 'width', 'width');
  readStringAttr(options, el, 'height', 'height');
  readStringAttr(options, el, 'ariaLabel', 'aria-label');
  readNumberAttr(options, el, 'radius', 'radius');
  readNumberAttr(options, el, 'cardWidth', 'card-width');
  readNumberAttr(options, el, 'cardHeight', 'card-height');
  readNumberAttr(options, el, 'autoRotateSpeed', 'auto-rotate-speed');
  readNumberAttr(options, el, 'dragSensitivity', 'drag-sensitivity');
  readNumberAttr(options, el, 'friction', 'friction');
  readNumberAttr(options, el, 'initialAngle', 'initial-angle');
  readBooleanAttr(options, el, 'autoRotate', 'auto-rotate', 'optional-true');
  readBooleanAttr(options, el, 'showCaption', 'show-caption', 'optional-true');
  readJsonAttr(options, el, 'photos', 'photos');
  readPropertyOverride(options, el, 'photos', '_photos');
  options.onPhotoClick = optionCallbackDispatcher(el, 'photo-click');
  options.onFaceChange = optionCallbackDispatcher(el, 'face-change');
  options.onIndexChange = optionCallbackDispatcher(el, 'index-change');
  return options;
}

class CosPhotoCarouselElement extends HTMLElement {
  private ctrl: PhotoCarouselController | null = null;

  _photos?: PhotoCarouselOptions['photos'];
  get photos(): PhotoCarouselOptions['photos'] | undefined {
    return this._photos;
  }
  set photos(value: PhotoCarouselOptions['photos']) {
    this._photos = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return [
      'photos',
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
