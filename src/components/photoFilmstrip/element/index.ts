import {
  createPhotoFilmstrip,
  type PhotoFilmstripController,
  type PhotoFilmstripOptions,
} from '../core';
import '../style/index.css';

const TAG = 'cos-photo-filmstrip';

function parseOptions(el: HTMLElement): PhotoFilmstripOptions {
  const options = {} as PhotoFilmstripOptions;
  if (el.hasAttribute('width')) options.width = el.getAttribute('width') ?? undefined;
  if (el.hasAttribute('height')) options.height = el.getAttribute('height') ?? undefined;
  if (el.hasAttribute('aria-label')) options.ariaLabel = el.getAttribute('aria-label') ?? undefined;
  if (el.hasAttribute('frame-width')) options.frameWidth = Number(el.getAttribute('frame-width'));
  if (el.hasAttribute('frame-height'))
    options.frameHeight = Number(el.getAttribute('frame-height'));
  if (el.hasAttribute('frame-gap')) options.frameGap = Number(el.getAttribute('frame-gap'));
  if (el.hasAttribute('friction')) options.friction = Number(el.getAttribute('friction'));
  if (el.hasAttribute('drag-sensitivity'))
    options.dragSensitivity = Number(el.getAttribute('drag-sensitivity'));
  if (el.hasAttribute('initial-index'))
    options.initialIndex = Number(el.getAttribute('initial-index'));
  options.showCaption = el.hasAttribute('show-caption');
  if (el.hasAttribute('photos')) {
    try {
      options.photos = JSON.parse(
        el.getAttribute('photos') ?? 'null',
      ) as PhotoFilmstripOptions['photos'];
    } catch {
      /* ignore invalid JSON */
    }
  }
  const propphotos = (el as CosPhotoFilmstripElement)._photos;
  if (propphotos !== undefined) options.photos = propphotos as PhotoFilmstripOptions['photos'];
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
    return [
      'photos',
      'width',
      'height',
      'frame-width',
      'frame-height',
      'frame-gap',
      'show-caption',
      'friction',
      'drag-sensitivity',
      'initial-index',
      'aria-label',
    ];
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
