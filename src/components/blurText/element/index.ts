import {
  optionCallbackDispatcher,
  readJsonAttr,
  readNumberAttr,
  readPropertyOverride,
  readStringAttr,
} from '@cos-design/shared';
import { createBlurText, type BlurTextController, type BlurTextOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-blur-text';

function parseOptions(el: HTMLElement): BlurTextOptions {
  const options = {} as BlurTextOptions;
  readStringAttr(options, el, 'text', 'text');
  readStringAttr(options, el, 'color', 'color');
  readNumberAttr(options, el, 'stagger', 'stagger');
  readNumberAttr(options, el, 'duration', 'duration');
  readNumberAttr(options, el, 'fontSize', 'font-size');
  readJsonAttr(options, el, 'animateBy', 'animate-by');
  readPropertyOverride(options, el, 'animateBy', '_animateBy');
  readJsonAttr(options, el, 'direction', 'direction');
  readPropertyOverride(options, el, 'direction', '_direction');
  options.onAnimationComplete = optionCallbackDispatcher(el, 'animation-complete');
  return options;
}

class CosBlurTextElement extends HTMLElement {
  private ctrl: BlurTextController | null = null;

  _animateBy?: BlurTextOptions['animateBy'];
  get animateBy(): BlurTextOptions['animateBy'] | undefined {
    return this._animateBy;
  }
  set animateBy(value: BlurTextOptions['animateBy']) {
    this._animateBy = value;
    this.ctrl?.update(parseOptions(this));
  }
  _direction?: BlurTextOptions['direction'];
  get direction(): BlurTextOptions['direction'] | undefined {
    return this._direction;
  }
  set direction(value: BlurTextOptions['direction']) {
    this._direction = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return ['text', 'animate-by', 'direction', 'stagger', 'duration', 'font-size', 'color'];
  }

  connectedCallback() {
    this.ctrl = createBlurText(this, parseOptions(this));
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
  customElements.define(TAG, CosBlurTextElement);
}

export { CosBlurTextElement, TAG };
