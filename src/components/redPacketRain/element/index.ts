import {
  createRedPacketRain,
  type RedPacketRainController,
  type RedPacketRainOptions,
} from '../core';
import '../style/index.css';

const TAG = 'cos-red-packet-rain';

function parseOptions(_el: HTMLElement): RedPacketRainOptions {
  const options: RedPacketRainOptions = {};
  if (_el.hasAttribute('width')) options.width = Number(_el.getAttribute('width'));
  if (_el.hasAttribute('height')) options.height = Number(_el.getAttribute('height'));
  if (_el.hasAttribute('fill')) options.fill = true;
  if (_el.hasAttribute('auto')) options.auto = _el.getAttribute('auto') !== 'false';
  return options;
}

class CosRedPacketRainElement extends HTMLElement {
  private ctrl: RedPacketRainController | null = null;

  static get observedAttributes() {
    return ['width', 'height', 'fill', 'auto'];
  }

  connectedCallback() {
    this.ctrl = createRedPacketRain(this, parseOptions(this));
  }

  disconnectedCallback() {
    this.ctrl?.destroy();
    this.ctrl = null;
  }

  attributeChangedCallback() {
    this.ctrl?.update(parseOptions(this));
  }

  start() {
    this.ctrl?.start();
  }
  stop() {
    this.ctrl?.stop();
  }
  reset() {
    this.ctrl?.reset();
  }
}

if (typeof customElements !== 'undefined' && !customElements.get(TAG)) {
  customElements.define(TAG, CosRedPacketRainElement);
}

export { CosRedPacketRainElement, TAG };
