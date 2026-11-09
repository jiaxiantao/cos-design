import {
  optionCallbackDispatcher,
  readBooleanAttr,
  readJsonAttr,
  readNumberAttr,
  readPropertyOverride,
  readStringAttr,
} from '@cos-design/shared';
import { createPhotoAlbum, type PhotoAlbumController, type PhotoAlbumOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-photo-album';

function parseOptions(el: HTMLElement): PhotoAlbumOptions {
  const options = {} as PhotoAlbumOptions;
  readStringAttr(options, el, 'width', 'width');
  readStringAttr(options, el, 'height', 'height');
  readStringAttr(options, el, 'objectFit', 'object-fit');
  readStringAttr(options, el, 'pageColor', 'page-color');
  readStringAttr(options, el, 'coverColor', 'cover-color');
  readStringAttr(options, el, 'ariaLabel', 'aria-label');
  readNumberAttr(options, el, 'initialIndex', 'initial-index');
  readNumberAttr(options, el, 'pageTurnDuration', 'page-turn-duration');
  readBooleanAttr(options, el, 'showPageNumber', 'show-page-number', 'optional-true');
  readJsonAttr(options, el, 'photos', 'photos');
  readPropertyOverride(options, el, 'photos', '_photos');
  readJsonAttr(options, el, 'labels', 'labels');
  readPropertyOverride(options, el, 'labels', '_labels');
  options.onPageChange = optionCallbackDispatcher(el, 'page-change');
  options.onIndexChange = optionCallbackDispatcher(el, 'index-change');
  return options;
}

class CosPhotoAlbumElement extends HTMLElement {
  private ctrl: PhotoAlbumController | null = null;

  _photos?: PhotoAlbumOptions['photos'];
  get photos(): PhotoAlbumOptions['photos'] | undefined {
    return this._photos;
  }
  set photos(value: PhotoAlbumOptions['photos']) {
    this._photos = value;
    this.ctrl?.update(parseOptions(this));
  }
  _labels?: PhotoAlbumOptions['labels'];
  get labels(): PhotoAlbumOptions['labels'] | undefined {
    return this._labels;
  }
  set labels(value: PhotoAlbumOptions['labels']) {
    this._labels = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return ['photos', 'width', 'height', 'initial-index', 'page-turn-duration', 'object-fit', 'show-page-number', 'page-color', 'cover-color', 'aria-label', 'labels'];
  }

  connectedCallback() {
    this.ctrl = createPhotoAlbum(this, parseOptions(this));
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
  customElements.define(TAG, CosPhotoAlbumElement);
}

export { CosPhotoAlbumElement, TAG };
