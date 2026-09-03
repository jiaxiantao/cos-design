import { createPhotoTunnel, type PhotoTunnelController, type PhotoTunnelOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-photo-tunnel';

function parseOptions(el: HTMLElement): PhotoTunnelOptions {
  const options = {} as PhotoTunnelOptions;
  if (el.hasAttribute('width')) options.width = el.getAttribute('width') ?? undefined;
  if (el.hasAttribute('height')) options.height = el.getAttribute('height') ?? undefined;
  if (el.hasAttribute('aria-label')) options.ariaLabel = el.getAttribute('aria-label') ?? undefined;
  if (el.hasAttribute('depth-step')) options.depthStep = Number(el.getAttribute('depth-step'));
  if (el.hasAttribute('drag-sensitivity'))
    options.dragSensitivity = Number(el.getAttribute('drag-sensitivity'));
  if (el.hasAttribute('friction')) options.friction = Number(el.getAttribute('friction'));
  if (el.hasAttribute('auto-advance-speed'))
    options.autoAdvanceSpeed = Number(el.getAttribute('auto-advance-speed'));
  if (el.hasAttribute('initial-index'))
    options.initialIndex = Number(el.getAttribute('initial-index'));
  options.autoAdvance = el.hasAttribute('auto-advance');
  options.showCaption = el.hasAttribute('show-caption');
  if (el.hasAttribute('photos')) {
    try {
      options.photos = JSON.parse(
        el.getAttribute('photos') ?? 'null',
      ) as PhotoTunnelOptions['photos'];
    } catch {
      /* ignore invalid JSON */
    }
  }
  const propphotos = (el as CosPhotoTunnelElement)._photos;
  if (propphotos !== undefined) options.photos = propphotos as PhotoTunnelOptions['photos'];
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

class CosPhotoTunnelElement extends HTMLElement {
  private ctrl: PhotoTunnelController | null = null;

  _photos?: PhotoTunnelOptions['photos'];
  get photos(): PhotoTunnelOptions['photos'] | undefined {
    return this._photos;
  }
  set photos(value: PhotoTunnelOptions['photos']) {
    this._photos = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return [
      'photos',
      'width',
      'height',
      'depth-step',
      'drag-sensitivity',
      'friction',
      'auto-advance',
      'auto-advance-speed',
      'show-caption',
      'initial-index',
      'aria-label',
    ];
  }

  connectedCallback() {
    this.ctrl = createPhotoTunnel(this, parseOptions(this));
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
  customElements.define(TAG, CosPhotoTunnelElement);
}

export { CosPhotoTunnelElement, TAG };
