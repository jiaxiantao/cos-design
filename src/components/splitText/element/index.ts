import {
  readBooleanAttr,
  readJsonAttr,
  readNumberAttr,
  readPropertyOverride,
  readStringAttr,
} from '@cos-design/shared';
import { createSplitText, type SplitTextController, type SplitTextOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-split-text';

function parseOptions(el: HTMLElement): SplitTextOptions {
  const options = {} as SplitTextOptions;
  readStringAttr(options, el, 'text', 'text');
  readStringAttr(options, el, 'color', 'color');
  readNumberAttr(options, el, 'stagger', 'stagger');
  readNumberAttr(options, el, 'duration', 'duration');
  readNumberAttr(options, el, 'loopPause', 'loop-pause');
  readNumberAttr(options, el, 'fontSize', 'font-size');
  readBooleanAttr(options, el, 'loop', 'loop', 'presence');
  readJsonAttr(options, el, 'animation', 'animation');
  readPropertyOverride(options, el, 'animation', '_animation');
  return options;
}

class CosSplitTextElement extends HTMLElement {
  private ctrl: SplitTextController | null = null;

  _animation?: SplitTextOptions['animation'];
  get animation(): SplitTextOptions['animation'] | undefined {
    return this._animation;
  }
  set animation(value: SplitTextOptions['animation']) {
    this._animation = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return ['text', 'animation', 'stagger', 'duration', 'loop', 'loop-pause', 'font-size', 'color'];
  }

  connectedCallback() {
    this.ctrl = createSplitText(this, parseOptions(this));
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
  customElements.define(TAG, CosSplitTextElement);
}

export { CosSplitTextElement, TAG };
