import { createPhotoAlbum, type PhotoAlbumController, type PhotoAlbumOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-photo-album';

function parseOptions(el: HTMLElement): PhotoAlbumOptions {
  const options = {} as PhotoAlbumOptions;
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
  if (el.hasAttribute('initial-index'))
    options.initialIndex = Number(el.getAttribute('initial-index'));
  if (el.hasAttribute('page-turn-duration'))
    options.pageTurnDuration = Number(el.getAttribute('page-turn-duration'));
  if (el.hasAttribute('object-fit')) options.objectFit = el.getAttribute('object-fit') ?? undefined;
  if (el.hasAttribute('show-page-number'))
    options.showPageNumber = el.getAttribute('show-page-number') !== 'false';
  if (el.hasAttribute('page-color')) options.pageColor = el.getAttribute('page-color') ?? undefined;
  if (el.hasAttribute('cover-color'))
    options.coverColor = el.getAttribute('cover-color') ?? undefined;
  if (el.hasAttribute('aria-label')) options.ariaLabel = el.getAttribute('aria-label') ?? undefined;
  return options;
}

class CosPhotoAlbumElement extends HTMLElement {
  private ctrl: PhotoAlbumController | null = null;

  static get observedAttributes() {
    return [
      'width',
      'height',
      'initial-index',
      'page-turn-duration',
      'object-fit',
      'show-page-number',
      'page-color',
      'cover-color',
      'aria-label',
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
