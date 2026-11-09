import {
  optionCallbackDispatcher,
  readBooleanAttr,
  readJsonAttr,
  readNumberAttr,
  readPropertyOverride,
  readStringAttr,
} from '@cos-design/shared';
import { createPhotoTunnel, type PhotoTunnelController, type PhotoTunnelOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-photo-tunnel';

function parseOptions(el: HTMLElement): PhotoTunnelOptions {
  const options = {} as PhotoTunnelOptions;
  readStringAttr(options, el, 'width', 'width');
  readStringAttr(options, el, 'height', 'height');
  readStringAttr(options, el, 'ariaLabel', 'aria-label');
  readNumberAttr(options, el, 'depthStep', 'depth-step');
  readNumberAttr(options, el, 'dragSensitivity', 'drag-sensitivity');
  readNumberAttr(options, el, 'friction', 'friction');
  readNumberAttr(options, el, 'autoAdvanceSpeed', 'auto-advance-speed');
  readNumberAttr(options, el, 'initialIndex', 'initial-index');
  readBooleanAttr(options, el, 'autoAdvance', 'auto-advance', 'presence');
  readBooleanAttr(options, el, 'showCaption', 'show-caption', 'optional-true');
  readJsonAttr(options, el, 'photos', 'photos');
  readPropertyOverride(options, el, 'photos', '_photos');
  options.onPhotoClick = optionCallbackDispatcher(el, 'photo-click');
  options.onIndexChange = optionCallbackDispatcher(el, 'index-change');
  return options;
}

class CosPhotoTunnelElement extends HTMLElement {
  private ctrl: PhotoTunnelController | null = null;

  _photos?: PhotoTunnelOptions['photos'];
  get photos(): PhotoTunnelOptions['photos'] | undefined {
    return this._photos;
  }
  set photos(value: PhotoTunnelOptions['photos']) {
    this._photos = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return ['photos', 'width', 'height', 'depth-step', 'drag-sensitivity', 'friction', 'auto-advance', 'auto-advance-speed', 'show-caption', 'initial-index', 'aria-label'];
  }

  connectedCallback() {
    this.ctrl = createPhotoTunnel(this, parseOptions(this));
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
  customElements.define(TAG, CosPhotoTunnelElement);
}

export { CosPhotoTunnelElement, TAG };
