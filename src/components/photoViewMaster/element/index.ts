import {
  createPhotoViewMaster,
  type PhotoViewMasterController,
  type PhotoViewMasterOptions,
} from '../core';
import '../style/index.css';

const TAG = 'cos-photo-view-master';

function parseOptions(el: HTMLElement): PhotoViewMasterOptions {
  const options = {} as PhotoViewMasterOptions;
  if (el.hasAttribute('width')) {
    const raw = el.getAttribute('width');
    const n = Number(raw);
    options.width = raw != null && raw !== '' && !Number.isNaN(n) ? n : (raw ?? undefined);
  }
  if (el.hasAttribute('height')) {
    const raw = el.getAttribute('height');
    const n = Number(raw);
    options.height = raw != null && raw !== '' && !Number.isNaN(n) ? n : (raw ?? undefined);
  }
  if (el.hasAttribute('aria-label')) options.ariaLabel = el.getAttribute('aria-label') ?? undefined;
  if (el.hasAttribute('disc-size')) options.discSize = Number(el.getAttribute('disc-size'));
  if (el.hasAttribute('peep-size')) options.peepSize = Number(el.getAttribute('peep-size'));
  if (el.hasAttribute('drag-sensitivity'))
    options.dragSensitivity = Number(el.getAttribute('drag-sensitivity'));
  if (el.hasAttribute('friction')) options.friction = Number(el.getAttribute('friction'));
  if (el.hasAttribute('auto-rotate-speed'))
    options.autoRotateSpeed = Number(el.getAttribute('auto-rotate-speed'));
  if (el.hasAttribute('initial-index'))
    options.initialIndex = Number(el.getAttribute('initial-index'));
  if (el.hasAttribute('auto-rotate')) {
    const raw = el.getAttribute('auto-rotate');
    options.autoRotate = raw !== 'false' && raw !== '0';
  }
  if (el.hasAttribute('show-caption')) {
    const raw = el.getAttribute('show-caption');
    options.showCaption = raw !== 'false' && raw !== '0';
  }
  if (el.hasAttribute('photos')) {
    try {
      options.photos = JSON.parse(
        el.getAttribute('photos') ?? 'null',
      ) as PhotoViewMasterOptions['photos'];
    } catch {
      /* ignore invalid JSON */
    }
  }
  const propphotos = (el as CosPhotoViewMasterElement)._photos;
  if (propphotos !== undefined) options.photos = propphotos as PhotoViewMasterOptions['photos'];
  options.onPhotoClick = (...args: unknown[]) => {
    el.dispatchEvent(
      new CustomEvent('photo-click', { detail: args.length <= 1 ? args[0] : args, bubbles: true }),
    );
  };
  options.onIndexChange = (...args: unknown[]) => {
    el.dispatchEvent(
      new CustomEvent('index-change', { detail: args.length <= 1 ? args[0] : args, bubbles: true }),
    );
  };
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
    return [
      'photos',
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
      'aria-label',
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
