import {
  optionCallbackDispatcher,
  readBooleanAttr,
  readJsonAttr,
  readNumberAttr,
  readPropertyOverride,
  readStringAttr,
} from '@cos-design/shared';
import { createPhotoClothesline, type PhotoClotheslineController, type PhotoClotheslineOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-photo-clothesline';

function parseOptions(el: HTMLElement): PhotoClotheslineOptions {
  const options = {} as PhotoClotheslineOptions;
  readStringAttr(options, el, 'width', 'width');
  readStringAttr(options, el, 'height', 'height');
  readStringAttr(options, el, 'ropeColor', 'rope-color');
  readStringAttr(options, el, 'bandColor', 'band-color');
  readStringAttr(options, el, 'pinColor', 'pin-color');
  readStringAttr(options, el, 'frameColor', 'frame-color');
  readStringAttr(options, el, 'background', 'background');
  readStringAttr(options, el, 'objectFit', 'object-fit');
  readStringAttr(options, el, 'ariaLabel', 'aria-label');
  readNumberAttr(options, el, 'photoWidth', 'photo-width');
  readNumberAttr(options, el, 'photoHeight', 'photo-height');
  readNumberAttr(options, el, 'photoGap', 'photo-gap');
  readNumberAttr(options, el, 'ropeTop', 'rope-top');
  readNumberAttr(options, el, 'ropeSag', 'rope-sag');
  readNumberAttr(options, el, 'bandLength', 'band-length');
  readNumberAttr(options, el, 'bandWidth', 'band-width');
  readNumberAttr(options, el, 'maxPull', 'max-pull');
  readNumberAttr(options, el, 'stiffness', 'stiffness');
  readNumberAttr(options, el, 'damping', 'damping');
  readNumberAttr(options, el, 'tension', 'tension');
  readNumberAttr(options, el, 'tilt', 'tilt');
  readNumberAttr(options, el, 'initialIndex', 'initial-index');
  readBooleanAttr(options, el, 'showCaption', 'show-caption', 'optional-true');
  readJsonAttr(options, el, 'photos', 'photos');
  readPropertyOverride(options, el, 'photos', '_photos');
  options.onIndexChange = optionCallbackDispatcher(el, 'index-change');
  options.onPhotoClick = optionCallbackDispatcher(el, 'photo-click');
  return options;
}

class CosPhotoClotheslineElement extends HTMLElement {
  private ctrl: PhotoClotheslineController | null = null;

  _photos?: PhotoClotheslineOptions['photos'];
  get photos(): PhotoClotheslineOptions['photos'] | undefined {
    return this._photos;
  }
  set photos(value: PhotoClotheslineOptions['photos']) {
    this._photos = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return ['photos', 'width', 'height', 'photo-width', 'photo-height', 'photo-gap', 'rope-top', 'rope-sag', 'band-length', 'band-width', 'max-pull', 'stiffness', 'damping', 'tension', 'tilt', 'rope-color', 'band-color', 'pin-color', 'frame-color', 'background', 'object-fit', 'show-caption', 'initial-index', 'aria-label'];
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
