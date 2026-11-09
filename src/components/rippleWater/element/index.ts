import {
  readBooleanAttr,
  readNumberAttr,
  readStringAttr,
} from '@cos-design/shared';
import { createRippleWater, type RippleWaterController, type RippleWaterOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-ripple-water';

function parseOptions(el: HTMLElement): RippleWaterOptions {
  const options = {} as RippleWaterOptions;
  readStringAttr(options, el, 'fromColor', 'from-color');
  readStringAttr(options, el, 'toColor', 'to-color');
  readStringAttr(options, el, 'color', 'color');
  readStringAttr(options, el, 'hint', 'hint');
  readNumberAttr(options, el, 'width', 'width');
  readNumberAttr(options, el, 'height', 'height');
  readNumberAttr(options, el, 'waveAmplitude', 'wave-amplitude');
  readNumberAttr(options, el, 'waveSpeed', 'wave-speed');
  readNumberAttr(options, el, 'shimmer', 'shimmer');
  readNumberAttr(options, el, 'reflection', 'reflection');
  readNumberAttr(options, el, 'rippleStrength', 'ripple-strength');
  readNumberAttr(options, el, 'rippleRadius', 'ripple-radius');
  readNumberAttr(options, el, 'damping', 'damping');
  readNumberAttr(options, el, 'spread', 'spread');
  readBooleanAttr(options, el, 'fill', 'fill', 'presence');
  readBooleanAttr(options, el, 'interactive', 'interactive', 'optional-true');
  readBooleanAttr(options, el, 'showHint', 'show-hint', 'optional-true');
  return options;
}

class CosRippleWaterElement extends HTMLElement {
  private ctrl: RippleWaterController | null = null;


  static get observedAttributes() {
    return ['width', 'height', 'fill', 'from-color', 'to-color', 'color', 'wave-amplitude', 'wave-speed', 'shimmer', 'reflection', 'ripple-strength', 'ripple-radius', 'damping', 'spread', 'interactive', 'show-hint', 'hint'];
  }

  connectedCallback() {
    this.ctrl = createRippleWater(this, parseOptions(this));
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
  customElements.define(TAG, CosRippleWaterElement);
}

export { CosRippleWaterElement, TAG };
