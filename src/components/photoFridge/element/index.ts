import {
  optionCallbackDispatcher,
  readBooleanAttr,
  readJsonAttr,
  readNumberAttr,
  readPropertyOverride,
  readStringAttr,
} from '@cos-design/shared';
import { createPhotoFridge, type PhotoFridgeController, type PhotoFridgeOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-photo-fridge';

function parseOptions(el: HTMLElement): PhotoFridgeOptions {
  const options = {} as PhotoFridgeOptions;
  readStringAttr(options, el, 'width', 'width');
  readStringAttr(options, el, 'height', 'height');
  readStringAttr(options, el, 'ariaLabel', 'aria-label');
  readNumberAttr(options, el, 'cardWidth', 'card-width');
  readNumberAttr(options, el, 'cardHeight', 'card-height');
  readNumberAttr(options, el, 'scatter', 'scatter');
  readNumberAttr(options, el, 'friction', 'friction');
  readNumberAttr(options, el, 'initialIndex', 'initial-index');
  readBooleanAttr(options, el, 'showCaption', 'show-caption', 'optional-true');
  readJsonAttr(options, el, 'photos', 'photos');
  readPropertyOverride(options, el, 'photos', '_photos');
  options.onPhotoClick = optionCallbackDispatcher(el, 'photo-click');
  return options;
}

class CosPhotoFridgeElement extends HTMLElement {
  private ctrl: PhotoFridgeController | null = null;

  _photos?: PhotoFridgeOptions['photos'];
  get photos(): PhotoFridgeOptions['photos'] | undefined {
    return this._photos;
  }
  set photos(value: PhotoFridgeOptions['photos']) {
    this._photos = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return ['photos', 'width', 'height', 'card-width', 'card-height', 'scatter', 'friction', 'show-caption', 'initial-index', 'aria-label'];
  }

  connectedCallback() {
    this.ctrl = createPhotoFridge(this, parseOptions(this));
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
  customElements.define(TAG, CosPhotoFridgeElement);
}

export { CosPhotoFridgeElement, TAG };
