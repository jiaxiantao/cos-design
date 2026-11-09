import {
  optionCallbackDispatcher,
  readBooleanAttr,
  readJsonAttr,
  readNumberAttr,
  readPropertyOverride,
  readStringAttr,
} from '@cos-design/shared';
import { createPhotoViewMaster, type PhotoViewMasterController, type PhotoViewMasterOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-photo-view-master';

function parseOptions(el: HTMLElement): PhotoViewMasterOptions {
  const options = {} as PhotoViewMasterOptions;
  readStringAttr(options, el, 'width', 'width');
  readStringAttr(options, el, 'height', 'height');
  readStringAttr(options, el, 'ariaLabel', 'aria-label');
  readNumberAttr(options, el, 'discSize', 'disc-size');
  readNumberAttr(options, el, 'peepSize', 'peep-size');
  readNumberAttr(options, el, 'dragSensitivity', 'drag-sensitivity');
  readNumberAttr(options, el, 'friction', 'friction');
  readNumberAttr(options, el, 'autoRotateSpeed', 'auto-rotate-speed');
  readNumberAttr(options, el, 'initialIndex', 'initial-index');
  readBooleanAttr(options, el, 'autoRotate', 'auto-rotate', 'optional-true');
  readBooleanAttr(options, el, 'showCaption', 'show-caption', 'optional-true');
  readJsonAttr(options, el, 'photos', 'photos');
  readPropertyOverride(options, el, 'photos', '_photos');
  options.onPhotoClick = optionCallbackDispatcher(el, 'photo-click');
  options.onIndexChange = optionCallbackDispatcher(el, 'index-change');
  return options;
}

class CosPhotoViewMasterElement extends HTMLElement {
  private ctrl: PhotoViewMasterController | null = null;

  _photos?: PhotoViewMasterOptions['photos'];
  get photos(): PhotoViewMasterOptions['photos'] | undefined {
    return this._photos;
  }
  set photos(value: PhotoViewMasterOptions['photos']) {
    this._photos = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return ['photos', 'width', 'height', 'disc-size', 'peep-size', 'drag-sensitivity', 'friction', 'auto-rotate', 'auto-rotate-speed', 'show-caption', 'initial-index', 'aria-label'];
  }

  connectedCallback() {
    this.ctrl = createPhotoViewMaster(this, parseOptions(this));
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
  customElements.define(TAG, CosPhotoViewMasterElement);
}

export { CosPhotoViewMasterElement, TAG };
