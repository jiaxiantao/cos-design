import { createLavaBubble, type LavaBubbleController, type LavaBubbleOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-lava-bubble';

function parseOptions(el: HTMLElement): LavaBubbleOptions {
  const options = {} as LavaBubbleOptions;
  if (el.hasAttribute('aria-label')) options.ariaLabel = el.getAttribute('aria-label') ?? undefined;
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
  if (el.hasAttribute('heat')) options.heat = Number(el.getAttribute('heat'));
  if (el.hasAttribute('speed')) options.speed = Number(el.getAttribute('speed'));
  if (el.hasAttribute('activity')) options.activity = Number(el.getAttribute('activity'));
  options.fill = el.hasAttribute('fill');
  options.autoSpawn = el.hasAttribute('auto-spawn');
  options.interactive = el.hasAttribute('interactive');
  return options;
}

class CosLavaBubbleElement extends HTMLElement {
  private ctrl: LavaBubbleController | null = null;

  static get observedAttributes() {
    return [
      'width',
      'height',
      'fill',
      'heat',
      'speed',
      'auto-spawn',
      'activity',
      'interactive',
      'aria-label',
    ];
  }

  connectedCallback() {
    this.ctrl = createLavaBubble(this, parseOptions(this));
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
  customElements.define(TAG, CosLavaBubbleElement);
}

export { CosLavaBubbleElement, TAG };
