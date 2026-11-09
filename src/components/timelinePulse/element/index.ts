import {
  readJsonAttr,
  readNumberAttr,
  readPropertyOverride,
  readStringAttr,
} from '@cos-design/shared';
import { createTimelinePulse, type TimelinePulseController, type TimelinePulseOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-timeline-pulse';

function parseOptions(el: HTMLElement): TimelinePulseOptions {
  const options = {} as TimelinePulseOptions;
  readStringAttr(options, el, 'color', 'color');
  readNumberAttr(options, el, 'current', 'current');
  readJsonAttr(options, el, 'steps', 'steps');
  readPropertyOverride(options, el, 'steps', '_steps');
  return options;
}

class CosTimelinePulseElement extends HTMLElement {
  private ctrl: TimelinePulseController | null = null;

  _steps?: TimelinePulseOptions['steps'];
  get steps(): TimelinePulseOptions['steps'] | undefined {
    return this._steps;
  }
  set steps(value: TimelinePulseOptions['steps']) {
    this._steps = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return ['steps', 'current', 'color'];
  }

  connectedCallback() {
    this.ctrl = createTimelinePulse(this, parseOptions(this));
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
  customElements.define(TAG, CosTimelinePulseElement);
}

export { CosTimelinePulseElement, TAG };
