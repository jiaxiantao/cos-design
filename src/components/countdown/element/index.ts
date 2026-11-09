import {
  optionCallbackDispatcher,
  readBooleanAttr,
  readJsonAttr,
  readPropertyOverride,
  readStringAttr,
} from '@cos-design/shared';
import { createCountdown, type CountdownController, type CountdownOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-countdown';

function parseOptions(el: HTMLElement): CountdownOptions {
  const options = {} as CountdownOptions;
  readStringAttr(options, el, 'targetDate', 'target-date');
  readStringAttr(options, el, 'color', 'color');
  readStringAttr(options, el, 'invalidText', 'invalid-text');
  readStringAttr(options, el, 'endedText', 'ended-text');
  readBooleanAttr(options, el, 'showLabels', 'show-labels', 'presence');
  readJsonAttr(options, el, 'labels', 'labels');
  readPropertyOverride(options, el, 'labels', '_labels');
  options.onEnd = optionCallbackDispatcher(el, 'end');
  return options;
}

class CosCountdownElement extends HTMLElement {
  private ctrl: CountdownController | null = null;

  _labels?: CountdownOptions['labels'];
  get labels(): CountdownOptions['labels'] | undefined {
    return this._labels;
  }
  set labels(value: CountdownOptions['labels']) {
    this._labels = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return ['target-date', 'show-labels', 'color', 'labels', 'invalid-text', 'ended-text'];
  }

  connectedCallback() {
    this.ctrl = createCountdown(this, parseOptions(this));
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
  customElements.define(TAG, CosCountdownElement);
}

export { CosCountdownElement, TAG };
