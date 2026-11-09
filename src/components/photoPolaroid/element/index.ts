import {
  optionCallbackDispatcher,
  readBooleanAttr,
  readJsonAttr,
  readNumberAttr,
  readPropertyOverride,
  readStringAttr,
} from '@cos-design/shared';
import {
  createPhotoPolaroid,
  type PhotoPolaroidController,
  type PhotoPolaroidOptions,
} from '../core';
import '../style/index.css';

const TAG = 'cos-photo-polaroid';

function parseOptions(el: HTMLElement): PhotoPolaroidOptions {
  const options = {} as PhotoPolaroidOptions;
  readStringAttr(options, el, 'width', 'width');
  readStringAttr(options, el, 'height', 'height');
  readStringAttr(options, el, 'ariaLabel', 'aria-label');
  readNumberAttr(options, el, 'cardWidth', 'card-width');
  readNumberAttr(options, el, 'cardHeight', 'card-height');
  readNumberAttr(options, el, 'scatter', 'scatter');
  readNumberAttr(options, el, 'initialIndex', 'initial-index');
  readBooleanAttr(options, el, 'showCaption', 'show-caption', 'optional-true');
  readJsonAttr(options, el, 'photos', 'photos');
  readPropertyOverride(options, el, 'photos', '_photos');
  options.onPhotoClick = optionCallbackDispatcher(el, 'photo-click');
  return options;
}

class CosPhotoPolaroidElement extends HTMLElement {
  private ctrl: PhotoPolaroidController | null = null;

  _photos?: PhotoPolaroidOptions['photos'];
  get photos(): PhotoPolaroidOptions['photos'] | undefined {
    return this._photos;
  }
  set photos(value: PhotoPolaroidOptions['photos']) {
    this._photos = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return [
      'photos',
      'width',
      'height',
      'card-width',
      'card-height',
      'scatter',
      'show-caption',
      'initial-index',
      'aria-label',
    ];
  }

  connectedCallback() {
    this.ctrl = createPhotoPolaroid(this, parseOptions(this));
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
  customElements.define(TAG, CosPhotoPolaroidElement);
}

export { CosPhotoPolaroidElement, TAG };
