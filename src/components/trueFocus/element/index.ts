import {
  readBooleanAttr,
  readNumberAttr,
  readStringAttr,
} from '@cos-design/shared';
import { createTrueFocus, type TrueFocusController, type TrueFocusOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-true-focus';

function parseOptions(el: HTMLElement): TrueFocusOptions {
  const options = {} as TrueFocusOptions;
  readStringAttr(options, el, 'sentence', 'sentence');
  readStringAttr(options, el, 'separator', 'separator');
  readStringAttr(options, el, 'borderColor', 'border-color');
  readStringAttr(options, el, 'glowColor', 'glow-color');
  readStringAttr(options, el, 'color', 'color');
  readNumberAttr(options, el, 'blurAmount', 'blur-amount');
  readNumberAttr(options, el, 'animationDuration', 'animation-duration');
  readNumberAttr(options, el, 'pauseBetweenAnimations', 'pause-between-animations');
  readNumberAttr(options, el, 'fontSize', 'font-size');
  readBooleanAttr(options, el, 'manualMode', 'manual-mode', 'presence');
  return options;
}

class CosTrueFocusElement extends HTMLElement {
  private ctrl: TrueFocusController | null = null;


  static get observedAttributes() {
    return ['sentence', 'separator', 'manual-mode', 'blur-amount', 'border-color', 'glow-color', 'animation-duration', 'pause-between-animations', 'font-size', 'color'];
  }

  connectedCallback() {
    this.ctrl = createTrueFocus(this, parseOptions(this));
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
  customElements.define(TAG, CosTrueFocusElement);
}

export { CosTrueFocusElement, TAG };
