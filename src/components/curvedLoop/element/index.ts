import {
  readBooleanAttr,
  readJsonAttr,
  readNumberAttr,
  readPropertyOverride,
  readStringAttr,
} from '@cos-design/shared';
import { createCurvedLoop, type CurvedLoopController, type CurvedLoopOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-curved-loop';

function parseOptions(el: HTMLElement): CurvedLoopOptions {
  const options = {} as CurvedLoopOptions;
  readStringAttr(options, el, 'text', 'text');
  readStringAttr(options, el, 'color', 'color');
  readNumberAttr(options, el, 'speed', 'speed');
  readNumberAttr(options, el, 'curveAmount', 'curve-amount');
  readNumberAttr(options, el, 'fontSize', 'font-size');
  readBooleanAttr(options, el, 'interactive', 'interactive', 'optional-true');
  readJsonAttr(options, el, 'direction', 'direction');
  readPropertyOverride(options, el, 'direction', '_direction');
  return options;
}

class CosCurvedLoopElement extends HTMLElement {
  private ctrl: CurvedLoopController | null = null;

  _direction?: CurvedLoopOptions['direction'];
  get direction(): CurvedLoopOptions['direction'] | undefined {
    return this._direction;
  }
  set direction(value: CurvedLoopOptions['direction']) {
    this._direction = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return ['text', 'speed', 'curve-amount', 'direction', 'interactive', 'color', 'font-size'];
  }

  connectedCallback() {
    this.ctrl = createCurvedLoop(this, parseOptions(this));
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
  customElements.define(TAG, CosCurvedLoopElement);
}

export { CosCurvedLoopElement, TAG };
