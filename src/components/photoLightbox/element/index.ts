import {
  createPhotoLightbox,
  type PhotoLightboxController,
  type PhotoLightboxOptions,
} from '../core';
import '../style/index.css';

const TAG = 'cos-photo-lightbox';

function parseOptions(el: HTMLElement): PhotoLightboxOptions {
  const options = {} as PhotoLightboxOptions;
  if (el.hasAttribute('width')) options.width = el.getAttribute('width') ?? undefined;
  if (el.hasAttribute('height')) options.height = el.getAttribute('height') ?? undefined;
  if (el.hasAttribute('aria-label')) options.ariaLabel = el.getAttribute('aria-label') ?? undefined;
  if (el.hasAttribute('slide-width')) options.slideWidth = Number(el.getAttribute('slide-width'));
  if (el.hasAttribute('slide-height'))
    options.slideHeight = Number(el.getAttribute('slide-height'));
  if (el.hasAttribute('pull-threshold'))
    options.pullThreshold = Number(el.getAttribute('pull-threshold'));
  if (el.hasAttribute('initial-index'))
    options.initialIndex = Number(el.getAttribute('initial-index'));
  options.showCaption = el.hasAttribute('show-caption');
  if (el.hasAttribute('photos')) {
    try {
      options.photos = JSON.parse(
        el.getAttribute('photos') ?? 'null',
      ) as PhotoLightboxOptions['photos'];
    } catch {
      /* ignore invalid JSON */
    }
  }
  const propphotos = (el as CosPhotoLightboxElement)._photos;
  if (propphotos !== undefined) options.photos = propphotos as PhotoLightboxOptions['photos'];
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

class CosPhotoLightboxElement extends HTMLElement {
  private ctrl: PhotoLightboxController | null = null;

  _photos?: PhotoLightboxOptions['photos'];
  get photos(): PhotoLightboxOptions['photos'] | undefined {
    return this._photos;
  }
  set photos(value: PhotoLightboxOptions['photos']) {
    this._photos = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return [
      'photos',
      'width',
      'height',
      'slide-width',
      'slide-height',
      'pull-threshold',
      'show-caption',
      'initial-index',
      'aria-label',
    ];
  }

  connectedCallback() {
    this.ctrl = createPhotoLightbox(this, parseOptions(this));
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
  customElements.define(TAG, CosPhotoLightboxElement);
}

export { CosPhotoLightboxElement, TAG };
