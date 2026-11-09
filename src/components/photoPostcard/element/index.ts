import {
  optionCallbackDispatcher,
  readBooleanAttr,
  readJsonAttr,
  readNumberAttr,
  readPropertyOverride,
  readStringAttr,
} from '@cos-design/shared';
import { createPhotoPostcard, type PhotoPostcardController, type PhotoPostcardOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-photo-postcard';

function parseOptions(el: HTMLElement): PhotoPostcardOptions {
  const options = {} as PhotoPostcardOptions;
  readStringAttr(options, el, 'width', 'width');
  readStringAttr(options, el, 'height', 'height');
  readStringAttr(options, el, 'ariaLabel', 'aria-label');
  readNumberAttr(options, el, 'cardWidth', 'card-width');
  readNumberAttr(options, el, 'cardHeight', 'card-height');
  readNumberAttr(options, el, 'pullThreshold', 'pull-threshold');
  readNumberAttr(options, el, 'initialIndex', 'initial-index');
  readBooleanAttr(options, el, 'showCaption', 'show-caption', 'optional-true');
  readBooleanAttr(options, el, 'initialFlipped', 'initial-flipped', 'presence');
  readJsonAttr(options, el, 'photos', 'photos');
  readPropertyOverride(options, el, 'photos', '_photos');
  options.onPhotoClick = optionCallbackDispatcher(el, 'photo-click');
  options.onIndexChange = optionCallbackDispatcher(el, 'index-change');
  options.onFlipChange = optionCallbackDispatcher(el, 'flip-change');
  return options;
}

class CosPhotoPostcardElement extends HTMLElement {
  private ctrl: PhotoPostcardController | null = null;

  _photos?: PhotoPostcardOptions['photos'];
  get photos(): PhotoPostcardOptions['photos'] | undefined {
    return this._photos;
  }
  set photos(value: PhotoPostcardOptions['photos']) {
    this._photos = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return ['photos', 'width', 'height', 'card-width', 'card-height', 'pull-threshold', 'show-caption', 'initial-index', 'initial-flipped', 'aria-label'];
  }

  connectedCallback() {
    this.ctrl = createPhotoPostcard(this, parseOptions(this));
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
  customElements.define(TAG, CosPhotoPostcardElement);
}

export { CosPhotoPostcardElement, TAG };
