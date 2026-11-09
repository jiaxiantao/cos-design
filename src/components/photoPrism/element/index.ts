import {
  optionCallbackDispatcher,
  readBooleanAttr,
  readJsonAttr,
  readNumberAttr,
  readPropertyOverride,
  readStringAttr,
} from '@cos-design/shared';
import { createPhotoPrism, type PhotoPrismController, type PhotoPrismOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-photo-prism';

function parseOptions(el: HTMLElement): PhotoPrismOptions {
  const options = {} as PhotoPrismOptions;
  readStringAttr(options, el, 'width', 'width');
  readStringAttr(options, el, 'height', 'height');
  readStringAttr(options, el, 'ariaLabel', 'aria-label');
  readNumberAttr(options, el, 'size', 'size');
  readNumberAttr(options, el, 'dragSensitivity', 'drag-sensitivity');
  readNumberAttr(options, el, 'friction', 'friction');
  readBooleanAttr(options, el, 'autoRotate', 'auto-rotate', 'optional-true');
  readBooleanAttr(options, el, 'showCaption', 'show-caption', 'optional-true');
  readJsonAttr(options, el, 'photos', 'photos');
  readPropertyOverride(options, el, 'photos', '_photos');
  options.onPhotoClick = optionCallbackDispatcher(el, 'photo-click');
  return options;
}

class CosPhotoPrismElement extends HTMLElement {
  private ctrl: PhotoPrismController | null = null;

  _photos?: PhotoPrismOptions['photos'];
  get photos(): PhotoPrismOptions['photos'] | undefined {
    return this._photos;
  }
  set photos(value: PhotoPrismOptions['photos']) {
    this._photos = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return [
      'photos',
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
