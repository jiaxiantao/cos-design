import { createCyberGrid, type CyberGridController, type CyberGridOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-cyber-grid';

function parseOptions(el: HTMLElement): CyberGridOptions {
  const options = {} as CyberGridOptions;
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
  if (el.hasAttribute('speed')) options.speed = Number(el.getAttribute('speed'));
  options.fill = el.hasAttribute('fill');
  return options;
}

class CosCyberGridElement extends HTMLElement {
  private ctrl: CyberGridController | null = null;

  static get observedAttributes() {
    return ['width', 'height', 'fill', 'color', 'speed'];
  }

  connectedCallback() {
    this.ctrl = createCyberGrid(this, parseOptions(this));
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
  customElements.define(TAG, CosCyberGridElement);
}

export { CosCyberGridElement, TAG };
