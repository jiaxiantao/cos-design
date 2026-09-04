import { createPhotoPrism, type PhotoPrismController, type PhotoPrismOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-photo-prism';

function parseOptions(el: HTMLElement): PhotoPrismOptions {
  const options = {} as PhotoPrismOptions;
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
  if (el.hasAttribute('size')) options.size = Number(el.getAttribute('size'));
  if (el.hasAttribute('drag-sensitivity'))
    options.dragSensitivity = Number(el.getAttribute('drag-sensitivity'));
  if (el.hasAttribute('friction')) options.friction = Number(el.getAttribute('friction'));
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
      ) as PhotoPrismOptions['photos'];
    } catch {
      /* ignore invalid JSON */
    }
  }
  const propphotos = (el as CosPhotoPrismElement)._photos;
  if (propphotos !== undefined) options.photos = propphotos as PhotoPrismOptions['photos'];
  options.onPhotoClick = (...args: unknown[]) => {
    el.dispatchEvent(
      new CustomEvent('photo-click', { detail: args.length <= 1 ? args[0] : args, bubbles: true }),
    );
  };
  return options;
}

class CosPhotoPrismElement extends HTMLElement {
  private ctrl: PhotoPrismController | null = null;

  _photos?: PhotoPrismOptions['photos'];
  get photos(): PhotoPrismOptions['photos'] | undefined {
    return this._photos;
  }
  set photos(value: PhotoPrismOptions['photos']) {
    this._photos = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return [
      'photos',
      'width',
      'height',
      'size',
      'auto-rotate',
      'drag-sensitivity',
      'friction',
      'show-caption',
      'aria-label',
    ];
  }

  connectedCallback() {
    this.ctrl = createPhotoPrism(this, parseOptions(this));
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
  customElements.define(TAG, CosPhotoPrismElement);
}

export { CosPhotoPrismElement, TAG };
