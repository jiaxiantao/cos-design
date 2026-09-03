import { createPhotoLantern, type PhotoLanternController, type PhotoLanternOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-photo-lantern';

function parseOptions(el: HTMLElement): PhotoLanternOptions {
  const options = {} as PhotoLanternOptions;
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
  if (el.hasAttribute('auto-rotate'))
    options.autoRotate = el.getAttribute('auto-rotate') !== 'false';
  if (el.hasAttribute('auto-rotate-speed'))
    options.autoRotateSpeed = Number(el.getAttribute('auto-rotate-speed'));
  if (el.hasAttribute('drag-sensitivity'))
    options.dragSensitivity = Number(el.getAttribute('drag-sensitivity'));
  if (el.hasAttribute('friction')) options.friction = Number(el.getAttribute('friction'));
  if (el.hasAttribute('frame-color'))
    options.frameColor = el.getAttribute('frame-color') ?? undefined;
  if (el.hasAttribute('paper-color'))
    options.paperColor = el.getAttribute('paper-color') ?? undefined;
  if (el.hasAttribute('light-color'))
    options.lightColor = el.getAttribute('light-color') ?? undefined;
  if (el.hasAttribute('background'))
    options.background = el.getAttribute('background') ?? undefined;
  if (el.hasAttribute('light-sway')) options.lightSway = Number(el.getAttribute('light-sway'));
  if (el.hasAttribute('show-accessories'))
    options.showAccessories = el.getAttribute('show-accessories') !== 'false';
  if (el.hasAttribute('tassel-color'))
    options.tasselColor = el.getAttribute('tassel-color') ?? undefined;
  if (el.hasAttribute('object-fit')) options.objectFit = el.getAttribute('object-fit') ?? undefined;
  if (el.hasAttribute('silhouette')) options.silhouette = el.getAttribute('silhouette') !== 'false';
  if (el.hasAttribute('show-caption'))
    options.showCaption = el.getAttribute('show-caption') !== 'false';
  if (el.hasAttribute('initial-angle'))
    options.initialAngle = Number(el.getAttribute('initial-angle'));
  if (el.hasAttribute('aria-label')) options.ariaLabel = el.getAttribute('aria-label') ?? undefined;
  return options;
}

class CosPhotoLanternElement extends HTMLElement {
  private ctrl: PhotoLanternController | null = null;

  static get observedAttributes() {
    return [
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
