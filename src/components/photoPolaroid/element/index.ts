import {
  createPhotoPolaroid,
  type PhotoPolaroidController,
  type PhotoPolaroidOptions,
} from '../core';
import '../style/index.css';

const TAG = 'cos-photo-polaroid';

function parseOptions(el: HTMLElement): PhotoPolaroidOptions {
  const options = {} as PhotoPolaroidOptions;
  if (el.hasAttribute('width')) options.width = el.getAttribute('width') ?? undefined;
  if (el.hasAttribute('height')) options.height = el.getAttribute('height') ?? undefined;
  if (el.hasAttribute('aria-label')) options.ariaLabel = el.getAttribute('aria-label') ?? undefined;
  if (el.hasAttribute('card-width')) options.cardWidth = Number(el.getAttribute('card-width'));
  if (el.hasAttribute('card-height')) options.cardHeight = Number(el.getAttribute('card-height'));
  if (el.hasAttribute('scatter')) options.scatter = Number(el.getAttribute('scatter'));
  if (el.hasAttribute('initial-index'))
    options.initialIndex = Number(el.getAttribute('initial-index'));
  options.showCaption = el.hasAttribute('show-caption');
  if (el.hasAttribute('photos')) {
    try {
      options.photos = JSON.parse(
        el.getAttribute('photos') ?? 'null',
      ) as PhotoPolaroidOptions['photos'];
    } catch {
      /* ignore invalid JSON */
    }
  }
  const propphotos = (el as CosPhotoPolaroidElement)._photos;
  if (propphotos !== undefined) options.photos = propphotos as PhotoPolaroidOptions['photos'];
  options.onPhotoClick = (...args: unknown[]) => {
    el.dispatchEvent(
      new CustomEvent('photo-click', { detail: args.length <= 1 ? args[0] : args, bubbles: true }),
    );
  };
  return options;
}

class CosPhotoPolaroidElement extends HTMLElement {
  private ctrl: PhotoPolaroidController | null = null;

  _photos?: PhotoPolaroidOptions['photos'];
  get photos(): PhotoPolaroidOptions['photos'] | undefined {
    return this._photos;
  }
  set photos(value: PhotoPolaroidOptions['photos']) {
    this._photos = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return [
      'photos',
      'width',
      'height',
      'card-width',
      'card-height',
      'scatter',
      'show-caption',
      'initial-index',
      'aria-label',
    ];
  }

  connectedCallback() {
    this.ctrl = createPhotoPolaroid(this, parseOptions(this));
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
  customElements.define(TAG, CosPhotoPolaroidElement);
}

export { CosPhotoPolaroidElement, TAG };
