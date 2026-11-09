import {
  readBooleanAttr,
  readNumberAttr,
  readStringAttr,
} from '@cos-design/shared';
import { createParticleNetwork, type ParticleNetworkController, type ParticleNetworkOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-particle-network';

function parseOptions(el: HTMLElement): ParticleNetworkOptions {
  const options = {} as ParticleNetworkOptions;
  readStringAttr(options, el, 'color', 'color');
  readStringAttr(options, el, 'hint', 'hint');
  readNumberAttr(options, el, 'width', 'width');
  readNumberAttr(options, el, 'height', 'height');
  readNumberAttr(options, el, 'particleCount', 'particle-count');
  readNumberAttr(options, el, 'linkDistance', 'link-distance');
  readNumberAttr(options, el, 'repelRadius', 'repel-radius');
  readBooleanAttr(options, el, 'fill', 'fill', 'presence');
  return options;
}

class CosParticleNetworkElement extends HTMLElement {
  private ctrl: ParticleNetworkController | null = null;


  static get observedAttributes() {
    return ['width', 'height', 'fill', 'particle-count', 'link-distance', 'repel-radius', 'color', 'hint'];
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
