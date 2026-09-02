import { createSpotlight, type SpotlightController, type SpotlightOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-spotlight';

function parseOptions(el: HTMLElement): SpotlightOptions {
  const options: SpotlightOptions = {};
  if (el.hasAttribute('radius')) options.radius = Number(el.getAttribute('radius'));
  if (el.hasAttribute('dim-color')) options.dimColor = el.getAttribute('dim-color') ?? undefined;
  return options;
}

class CosSpotlightElement extends HTMLElement {
  private ctrl: SpotlightController | null = null;

  static get observedAttributes() {
    return ['radius', 'dim-color'];
  }

  connectedCallback() {
    this.ctrl = createSpotlight(this, parseOptions(this));
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
  customElements.define(TAG, CosSpotlightElement);
}

export { CosSpotlightElement, TAG };
