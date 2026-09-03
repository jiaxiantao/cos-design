import { createPhotoLantern, type PhotoLanternController, type PhotoLanternOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-photo-lantern';

function parseOptions(el: HTMLElement): PhotoLanternOptions {
  const options = {} as PhotoLanternOptions;
  if (el.hasAttribute('width')) options.width = el.getAttribute('width') ?? undefined;
  if (el.hasAttribute('height')) options.height = el.getAttribute('height') ?? undefined;
  if (el.hasAttribute('frame-color'))
    options.frameColor = el.getAttribute('frame-color') ?? undefined;
  if (el.hasAttribute('paper-color'))
    options.paperColor = el.getAttribute('paper-color') ?? undefined;
  if (el.hasAttribute('light-color'))
    options.lightColor = el.getAttribute('light-color') ?? undefined;
  if (el.hasAttribute('background'))
    options.background = el.getAttribute('background') ?? undefined;
  if (el.hasAttribute('tassel-color'))
    options.tasselColor = el.getAttribute('tassel-color') ?? undefined;
  if (el.hasAttribute('object-fit')) options.objectFit = el.getAttribute('object-fit') ?? undefined;
  if (el.hasAttribute('aria-label')) options.ariaLabel = el.getAttribute('aria-label') ?? undefined;
  if (el.hasAttribute('auto-rotate-speed'))
    options.autoRotateSpeed = Number(el.getAttribute('auto-rotate-speed'));
  if (el.hasAttribute('drag-sensitivity'))
    options.dragSensitivity = Number(el.getAttribute('drag-sensitivity'));
  if (el.hasAttribute('friction')) options.friction = Number(el.getAttribute('friction'));
  if (el.hasAttribute('light-sway')) options.lightSway = Number(el.getAttribute('light-sway'));
  if (el.hasAttribute('initial-angle'))
    options.initialAngle = Number(el.getAttribute('initial-angle'));
  options.autoRotate = el.hasAttribute('auto-rotate');
  options.showAccessories = el.hasAttribute('show-accessories');
  options.silhouette = el.hasAttribute('silhouette');
  options.showCaption = el.hasAttribute('show-caption');
  if (el.hasAttribute('photos')) {
    try {
      options.photos = JSON.parse(
        el.getAttribute('photos') ?? 'null',
      ) as PhotoLanternOptions['photos'];
    } catch {
      /* ignore invalid JSON */
    }
  }
  const propphotos = (el as CosPhotoLanternElement)._photos;
  if (propphotos !== undefined) options.photos = propphotos as PhotoLanternOptions['photos'];
  options.onFaceChange = (...args: unknown[]) => {
    el.dispatchEvent(
      new CustomEvent('face-change', { detail: args.length <= 1 ? args[0] : args, bubbles: true }),
    );
  };
  options.onIndexChange = (...args: unknown[]) => {
    el.dispatchEvent(
      new CustomEvent('index-change', { detail: args.length <= 1 ? args[0] : args, bubbles: true }),
    );
  };
  options.onPhotoClick = (...args: unknown[]) => {
    el.dispatchEvent(
      new CustomEvent('photo-click', { detail: args.length <= 1 ? args[0] : args, bubbles: true }),
    );
  };
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
