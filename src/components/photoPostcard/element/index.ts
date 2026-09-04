import {
  createPhotoPostcard,
  type PhotoPostcardController,
  type PhotoPostcardOptions,
} from '../core';
import '../style/index.css';

const TAG = 'cos-photo-postcard';

function parseOptions(el: HTMLElement): PhotoPostcardOptions {
  const options = {} as PhotoPostcardOptions;
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
  if (el.hasAttribute('card-width')) options.cardWidth = Number(el.getAttribute('card-width'));
  if (el.hasAttribute('card-height')) options.cardHeight = Number(el.getAttribute('card-height'));
  if (el.hasAttribute('pull-threshold'))
    options.pullThreshold = Number(el.getAttribute('pull-threshold'));
  if (el.hasAttribute('initial-index'))
    options.initialIndex = Number(el.getAttribute('initial-index'));
  if (el.hasAttribute('show-caption')) {
    const raw = el.getAttribute('show-caption');
    options.showCaption = raw !== 'false' && raw !== '0';
  }
  if (el.hasAttribute('initial-flipped')) {
    const raw = el.getAttribute('initial-flipped');
    options.initialFlipped = raw !== 'false' && raw !== '0';
  }
  if (el.hasAttribute('photos')) {
    try {
      options.photos = JSON.parse(
        el.getAttribute('photos') ?? 'null',
      ) as PhotoPostcardOptions['photos'];
    } catch {
      /* ignore invalid JSON */
    }
  }
  const propphotos = (el as CosPhotoPostcardElement)._photos;
  if (propphotos !== undefined) options.photos = propphotos as PhotoPostcardOptions['photos'];
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
  options.onFlipChange = (...args: unknown[]) => {
    el.dispatchEvent(
      new CustomEvent('flip-change', { detail: args.length <= 1 ? args[0] : args, bubbles: true }),
    );
  };
  return options;
}

class CosPhotoPostcardElement extends HTMLElement {
  private ctrl: PhotoPostcardController | null = null;

  _photos?: PhotoPostcardOptions['photos'];
  get photos(): PhotoPostcardOptions['photos'] | undefined {
    return this._photos;
  }
  set photos(value: PhotoPostcardOptions['photos']) {
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
      'pull-threshold',
      'show-caption',
      'initial-index',
      'initial-flipped',
      'aria-label',
    ];
  }

  connectedCallback() {
    this.ctrl = createPhotoPostcard(this, parseOptions(this));
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
  customElements.define(TAG, CosPhotoPostcardElement);
}

export { CosPhotoPostcardElement, TAG };
