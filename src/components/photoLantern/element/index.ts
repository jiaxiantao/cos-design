import {
  optionCallbackDispatcher,
  readBooleanAttr,
  readJsonAttr,
  readNumberAttr,
  readPropertyOverride,
  readStringAttr,
} from '@cos-design/shared';
import { createPhotoLantern, type PhotoLanternController, type PhotoLanternOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-photo-lantern';

function parseOptions(el: HTMLElement): PhotoLanternOptions {
  const options = {} as PhotoLanternOptions;
  readStringAttr(options, el, 'width', 'width');
  readStringAttr(options, el, 'height', 'height');
  readStringAttr(options, el, 'frameColor', 'frame-color');
  readStringAttr(options, el, 'paperColor', 'paper-color');
  readStringAttr(options, el, 'lightColor', 'light-color');
  readStringAttr(options, el, 'background', 'background');
  readStringAttr(options, el, 'tasselColor', 'tassel-color');
  readStringAttr(options, el, 'objectFit', 'object-fit');
  readStringAttr(options, el, 'ariaLabel', 'aria-label');
  readNumberAttr(options, el, 'autoRotateSpeed', 'auto-rotate-speed');
  readNumberAttr(options, el, 'dragSensitivity', 'drag-sensitivity');
  readNumberAttr(options, el, 'friction', 'friction');
  readNumberAttr(options, el, 'lightSway', 'light-sway');
  readNumberAttr(options, el, 'initialAngle', 'initial-angle');
  readBooleanAttr(options, el, 'autoRotate', 'auto-rotate', 'optional-true');
  readBooleanAttr(options, el, 'showAccessories', 'show-accessories', 'optional-true');
  readBooleanAttr(options, el, 'silhouette', 'silhouette', 'presence');
  readBooleanAttr(options, el, 'showCaption', 'show-caption', 'optional-true');
  readJsonAttr(options, el, 'photos', 'photos');
  readPropertyOverride(options, el, 'photos', '_photos');
  options.onFaceChange = optionCallbackDispatcher(el, 'face-change');
  options.onIndexChange = optionCallbackDispatcher(el, 'index-change');
  options.onPhotoClick = optionCallbackDispatcher(el, 'photo-click');
  return options;
}

class CosPhotoLanternElement extends HTMLElement {
  private ctrl: PhotoLanternController | null = null;

  _photos?: PhotoLanternOptions['photos'];
  get photos(): PhotoLanternOptions['photos'] | undefined {
    return this._photos;
  }
  set photos(value: PhotoLanternOptions['photos']) {
    this._photos = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return [
      'photos',
      'width',
      'height',
      'auto-rotate',
      'auto-rotate-speed',
      'drag-sensitivity',
      'friction',
      'frame-color',
      'paper-color',
      'light-color',
      'background',
      'light-sway',
      'show-accessories',
      'tassel-color',
      'object-fit',
      'silhouette',
      'show-caption',
      'initial-angle',
      'aria-label',
    ];
  }

  connectedCallback() {
    this.ctrl = createPhotoLantern(this, parseOptions(this));
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
  customElements.define(TAG, CosPhotoLanternElement);
}

export { CosPhotoLanternElement, TAG };
