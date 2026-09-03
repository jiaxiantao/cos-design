import { createPhotoTunnel, type PhotoTunnelController, type PhotoTunnelOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-photo-tunnel';

function parseOptions(el: HTMLElement): PhotoTunnelOptions {
  const options = {} as PhotoTunnelOptions;
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
  if (el.hasAttribute('depth-step')) options.depthStep = Number(el.getAttribute('depth-step'));
  if (el.hasAttribute('drag-sensitivity'))
    options.dragSensitivity = Number(el.getAttribute('drag-sensitivity'));
  if (el.hasAttribute('friction')) options.friction = Number(el.getAttribute('friction'));
  if (el.hasAttribute('auto-advance'))
    options.autoAdvance = el.getAttribute('auto-advance') !== 'false';
  if (el.hasAttribute('auto-advance-speed'))
    options.autoAdvanceSpeed = Number(el.getAttribute('auto-advance-speed'));
  if (el.hasAttribute('show-caption'))
    options.showCaption = el.getAttribute('show-caption') !== 'false';
  if (el.hasAttribute('initial-index'))
    options.initialIndex = Number(el.getAttribute('initial-index'));
  if (el.hasAttribute('aria-label')) options.ariaLabel = el.getAttribute('aria-label') ?? undefined;
  return options;
}

class CosPhotoTunnelElement extends HTMLElement {
  private ctrl: PhotoTunnelController | null = null;

  static get observedAttributes() {
    return [
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
