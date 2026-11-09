import {
  optionCallbackDispatcher,
  readBooleanAttr,
  readJsonAttr,
  readNumberAttr,
  readPropertyOverride,
  readStringAttr,
} from '@cos-design/shared';
import {
  createPhotoLightbox,
  type PhotoLightboxController,
  type PhotoLightboxOptions,
} from '../core';
import '../style/index.css';

const TAG = 'cos-photo-lightbox';

function parseOptions(el: HTMLElement): PhotoLightboxOptions {
  const options = {} as PhotoLightboxOptions;
  readStringAttr(options, el, 'width', 'width');
  readStringAttr(options, el, 'height', 'height');
  readStringAttr(options, el, 'ariaLabel', 'aria-label');
  readNumberAttr(options, el, 'slideWidth', 'slide-width');
  readNumberAttr(options, el, 'slideHeight', 'slide-height');
  readNumberAttr(options, el, 'pullThreshold', 'pull-threshold');
  readNumberAttr(options, el, 'initialIndex', 'initial-index');
  readBooleanAttr(options, el, 'showCaption', 'show-caption', 'optional-true');
  readJsonAttr(options, el, 'photos', 'photos');
  readPropertyOverride(options, el, 'photos', '_photos');
  options.onPhotoClick = optionCallbackDispatcher(el, 'photo-click');
  options.onIndexChange = optionCallbackDispatcher(el, 'index-change');
  return options;
}

class CosPhotoLightboxElement extends HTMLElement {
  private ctrl: PhotoLightboxController | null = null;

  _photos?: PhotoLightboxOptions['photos'];
  get photos(): PhotoLightboxOptions['photos'] | undefined {
    return this._photos;
  }
  set photos(value: PhotoLightboxOptions['photos']) {
    this._photos = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return [
      'photos',
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
