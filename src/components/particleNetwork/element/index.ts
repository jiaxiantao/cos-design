import {
  createParticleNetwork,
  type ParticleNetworkController,
  type ParticleNetworkOptions,
} from '../core';
import '../style/index.css';

const TAG = 'cos-particle-network';

function parseOptions(el: HTMLElement): ParticleNetworkOptions {
  const options = {} as ParticleNetworkOptions;
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  if (el.hasAttribute('hint')) options.hint = el.getAttribute('hint') ?? undefined;
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
  if (el.hasAttribute('particle-count'))
    options.particleCount = Number(el.getAttribute('particle-count'));
  if (el.hasAttribute('link-distance'))
    options.linkDistance = Number(el.getAttribute('link-distance'));
  if (el.hasAttribute('repel-radius'))
    options.repelRadius = Number(el.getAttribute('repel-radius'));
  options.fill = el.hasAttribute('fill');
  return options;
}

class CosParticleNetworkElement extends HTMLElement {
  private ctrl: ParticleNetworkController | null = null;

  static get observedAttributes() {
    return [
      'width',
      'height',
      'fill',
      'particle-count',
      'link-distance',
      'repel-radius',
      'color',
      'hint',
    ];
  }

  connectedCallback() {
    this.ctrl = createParticleNetwork(this, parseOptions(this));
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
  customElements.define(TAG, CosParticleNetworkElement);
}

export { CosParticleNetworkElement, TAG };
