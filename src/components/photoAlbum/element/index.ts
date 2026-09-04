import { createPhotoAlbum, type PhotoAlbumController, type PhotoAlbumOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-photo-album';

function parseOptions(el: HTMLElement): PhotoAlbumOptions {
  const options = {} as PhotoAlbumOptions;
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
  if (el.hasAttribute('object-fit')) options.objectFit = el.getAttribute('object-fit') ?? undefined;
  if (el.hasAttribute('page-color')) options.pageColor = el.getAttribute('page-color') ?? undefined;
  if (el.hasAttribute('cover-color'))
    options.coverColor = el.getAttribute('cover-color') ?? undefined;
  if (el.hasAttribute('aria-label')) options.ariaLabel = el.getAttribute('aria-label') ?? undefined;
  if (el.hasAttribute('initial-index'))
    options.initialIndex = Number(el.getAttribute('initial-index'));
  if (el.hasAttribute('page-turn-duration'))
    options.pageTurnDuration = Number(el.getAttribute('page-turn-duration'));
  if (el.hasAttribute('show-page-number')) {
    const raw = el.getAttribute('show-page-number');
    options.showPageNumber = raw !== 'false' && raw !== '0';
  }
  if (el.hasAttribute('photos')) {
    try {
      options.photos = JSON.parse(
        el.getAttribute('photos') ?? 'null',
      ) as PhotoAlbumOptions['photos'];
    } catch {
      /* ignore invalid JSON */
    }
  }
  const propphotos = (el as CosPhotoAlbumElement)._photos;
  if (propphotos !== undefined) options.photos = propphotos as PhotoAlbumOptions['photos'];
  if (el.hasAttribute('labels')) {
    try {
      options.labels = JSON.parse(
        el.getAttribute('labels') ?? 'null',
      ) as PhotoAlbumOptions['labels'];
    } catch {
      /* ignore invalid JSON */
    }
  }
  const proplabels = (el as CosPhotoAlbumElement)._labels;
  if (proplabels !== undefined) options.labels = proplabels as PhotoAlbumOptions['labels'];
  options.onPageChange = (...args: unknown[]) => {
    el.dispatchEvent(
      new CustomEvent('page-change', { detail: args.length <= 1 ? args[0] : args, bubbles: true }),
    );
  };
  options.onIndexChange = (...args: unknown[]) => {
    el.dispatchEvent(
      new CustomEvent('index-change', { detail: args.length <= 1 ? args[0] : args, bubbles: true }),
    );
  };
  return options;
}

class CosPhotoAlbumElement extends HTMLElement {
  private ctrl: PhotoAlbumController | null = null;

  _photos?: PhotoAlbumOptions['photos'];
  get photos(): PhotoAlbumOptions['photos'] | undefined {
    return this._photos;
  }
  set photos(value: PhotoAlbumOptions['photos']) {
    this._photos = value;
    this.ctrl?.update(parseOptions(this));
  }
  _labels?: PhotoAlbumOptions['labels'];
  get labels(): PhotoAlbumOptions['labels'] | undefined {
    return this._labels;
  }
  set labels(value: PhotoAlbumOptions['labels']) {
    this._labels = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return [
      'photos',
      'width',
      'height',
      'initial-index',
      'page-turn-duration',
      'object-fit',
      'show-page-number',
      'page-color',
      'cover-color',
      'aria-label',
      'labels',
    ];
  }

  connectedCallback() {
    this.ctrl = createPhotoAlbum(this, parseOptions(this));
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
  customElements.define(TAG, CosPhotoAlbumElement);
}

export { CosPhotoAlbumElement, TAG };
