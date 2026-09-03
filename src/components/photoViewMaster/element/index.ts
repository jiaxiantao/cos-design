import { createPhotoViewMaster, type PhotoViewMasterController, type PhotoViewMasterOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-photo-view-master';

function parseOptions(el: HTMLElement): PhotoViewMasterOptions {
  const options = {} as PhotoViewMasterOptions;
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
  if (el.hasAttribute('disc-size')) options.discSize = Number(el.getAttribute('disc-size'));
  if (el.hasAttribute('peep-size')) options.peepSize = Number(el.getAttribute('peep-size'));
  if (el.hasAttribute('drag-sensitivity')) options.dragSensitivity = Number(el.getAttribute('drag-sensitivity'));
  if (el.hasAttribute('friction')) options.friction = Number(el.getAttribute('friction'));
  if (el.hasAttribute('auto-rotate')) options.autoRotate = el.getAttribute('auto-rotate') !== 'false';
  if (el.hasAttribute('auto-rotate-speed')) options.autoRotateSpeed = Number(el.getAttribute('auto-rotate-speed'));
  if (el.hasAttribute('show-caption')) options.showCaption = el.getAttribute('show-caption') !== 'false';
  if (el.hasAttribute('initial-index')) options.initialIndex = Number(el.getAttribute('initial-index'));
  if (el.hasAttribute('aria-label')) options.ariaLabel = el.getAttribute('aria-label') ?? undefined;
  return options;
}

class CosPhotoViewMasterElement extends HTMLElement {
  private ctrl: PhotoViewMasterController | null = null;

  static get observedAttributes() {
    return [
      'width',
      'height',
      'disc-size',
      'peep-size',
      'drag-sensitivity',
      'friction',
      'auto-rotate',
      'auto-rotate-speed',
      'show-caption',
      'initial-index',
      'aria-label'
    ];
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
