import {
  createRedPacketRain,
  type RedPacketRainController,
  type RedPacketRainOptions,
} from '../core';
import '../style/index.css';

const TAG = 'cos-red-packet-rain';

function parseOptions(el: HTMLElement): RedPacketRainOptions {
  const options = {} as RedPacketRainOptions;
  if (el.hasAttribute('grabbed-label'))
    options.grabbedLabel = el.getAttribute('grabbed-label') ?? undefined;
  if (el.hasAttribute('ended-text')) options.endedText = el.getAttribute('ended-text') ?? undefined;
  if (el.hasAttribute('hint')) options.hint = el.getAttribute('hint') ?? undefined;
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
  if (el.hasAttribute('duration')) options.duration = Number(el.getAttribute('duration'));
  options.fill = el.hasAttribute('fill');
  if (el.hasAttribute('auto')) {
    const raw = el.getAttribute('auto');
    options.auto = raw !== 'false' && raw !== '0';
  }
  options.onGrab = (...args: unknown[]) => {
    el.dispatchEvent(
      new CustomEvent('grab', { detail: args.length <= 1 ? args[0] : args, bubbles: true }),
    );
  };
  options.onEnd = (...args: unknown[]) => {
    el.dispatchEvent(
      new CustomEvent('end', { detail: args.length <= 1 ? args[0] : args, bubbles: true }),
    );
  };
  return options;
}

class CosRedPacketRainElement extends HTMLElement {
  private ctrl: RedPacketRainController | null = null;

  static get observedAttributes() {
    return ['width', 'height', 'fill', 'duration', 'auto', 'grabbed-label', 'ended-text', 'hint'];
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
    return this.ctrl?.start();
  }
  stop() {
    return this.ctrl?.stop();
  }
  reset() {
    return this.ctrl?.reset();
  }
}

if (typeof customElements !== 'undefined' && !customElements.get(TAG)) {
  customElements.define(TAG, CosRedPacketRainElement);
}

export { CosRedPacketRainElement, TAG };
