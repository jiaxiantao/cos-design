import {
  optionCallbackDispatcher,
  readBooleanAttr,
  readJsonAttr,
  readNumberAttr,
  readPropertyOverride,
  readStringAttr,
} from '@cos-design/shared';
import { createPhotoFilmstrip, type PhotoFilmstripController, type PhotoFilmstripOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-photo-filmstrip';

function parseOptions(el: HTMLElement): PhotoFilmstripOptions {
  const options = {} as PhotoFilmstripOptions;
  readStringAttr(options, el, 'width', 'width');
  readStringAttr(options, el, 'height', 'height');
  readStringAttr(options, el, 'ariaLabel', 'aria-label');
  readNumberAttr(options, el, 'frameWidth', 'frame-width');
  readNumberAttr(options, el, 'frameHeight', 'frame-height');
  readNumberAttr(options, el, 'frameGap', 'frame-gap');
  readNumberAttr(options, el, 'friction', 'friction');
  readNumberAttr(options, el, 'dragSensitivity', 'drag-sensitivity');
  readNumberAttr(options, el, 'initialIndex', 'initial-index');
  readBooleanAttr(options, el, 'showCaption', 'show-caption', 'optional-true');
  readJsonAttr(options, el, 'photos', 'photos');
  readPropertyOverride(options, el, 'photos', '_photos');
  options.onPhotoClick = optionCallbackDispatcher(el, 'photo-click');
  options.onIndexChange = optionCallbackDispatcher(el, 'index-change');
  return options;
}

class CosPhotoFilmstripElement extends HTMLElement {
  private ctrl: PhotoFilmstripController | null = null;

  _photos?: PhotoFilmstripOptions['photos'];
  get photos(): PhotoFilmstripOptions['photos'] | undefined {
    return this._photos;
  }
  set photos(value: PhotoFilmstripOptions['photos']) {
    this._photos = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return ['photos', 'width', 'height', 'frame-width', 'frame-height', 'frame-gap', 'show-caption', 'friction', 'drag-sensitivity', 'initial-index', 'aria-label'];
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
