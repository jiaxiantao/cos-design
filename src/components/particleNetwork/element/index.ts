import {
  createParticleNetwork,
  type ParticleNetworkController,
  type ParticleNetworkOptions,
} from '../core';
import '../style/index.css';

const TAG = 'cos-particle-network';

function parseOptions(_el: HTMLElement): ParticleNetworkOptions {
  void _el;
  const options: ParticleNetworkOptions = {};

  return options;
}

class CosParticleNetworkElement extends HTMLElement {
  private ctrl: ParticleNetworkController | null = null;

  static get observedAttributes() {
    return [];
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
