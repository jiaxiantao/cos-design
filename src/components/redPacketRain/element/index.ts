import {
  optionCallbackDispatcher,
  readBooleanAttr,
  readNumberAttr,
  readStringAttr,
} from '@cos-design/shared';
import { createRedPacketRain, type RedPacketRainController, type RedPacketRainOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-red-packet-rain';

function parseOptions(el: HTMLElement): RedPacketRainOptions {
  const options = {} as RedPacketRainOptions;
  readStringAttr(options, el, 'grabbedLabel', 'grabbed-label');
  readStringAttr(options, el, 'endedText', 'ended-text');
  readStringAttr(options, el, 'hint', 'hint');
  readNumberAttr(options, el, 'width', 'width');
  readNumberAttr(options, el, 'height', 'height');
  readNumberAttr(options, el, 'duration', 'duration');
  readBooleanAttr(options, el, 'fill', 'fill', 'presence');
  readBooleanAttr(options, el, 'auto', 'auto', 'optional-true');
  options.onGrab = optionCallbackDispatcher(el, 'grab');
  options.onEnd = optionCallbackDispatcher(el, 'end');
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
