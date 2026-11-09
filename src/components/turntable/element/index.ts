import {
  optionCallbackDispatcher,
  readJsonAttr,
  readNumberAttr,
  readPropertyOverride,
  readStringAttr,
} from '@cos-design/shared';
import { createTurntable, type TurntableController, type TurntableOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-turntable';

function parseOptions(el: HTMLElement): TurntableOptions {
  const options = {} as TurntableOptions;
  readStringAttr(options, el, 'buttonText', 'button-text');
  readStringAttr(options, el, 'spinningText', 'spinning-text');
  readStringAttr(options, el, 'resultPrefix', 'result-prefix');
  readNumberAttr(options, el, 'size', 'size');
  readNumberAttr(options, el, 'spinDuration', 'spin-duration');
  readNumberAttr(options, el, 'spinRounds', 'spin-rounds');
  readNumberAttr(options, el, 'targetIndex', 'target-index');
  readJsonAttr(options, el, 'prizes', 'prizes');
  readPropertyOverride(options, el, 'prizes', '_prizes');
  options.onSpinEnd = optionCallbackDispatcher(el, 'spin-end');
  return options;
}

class CosTurntableElement extends HTMLElement {
  private ctrl: TurntableController | null = null;

  _prizes?: TurntableOptions['prizes'];
  get prizes(): TurntableOptions['prizes'] | undefined {
    return this._prizes;
  }
  set prizes(value: TurntableOptions['prizes']) {
    this._prizes = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return ['prizes', 'size', 'spin-duration', 'spin-rounds', 'target-index', 'button-text', 'spinning-text', 'result-prefix'];
  }

  connectedCallback() {
    this.ctrl = createTurntable(this, parseOptions(this));
  }

  disconnectedCallback() {
    this.ctrl?.destroy();
    this.ctrl = null;
  }

  attributeChangedCallback() {
    this.ctrl?.update(parseOptions(this));
  }

  spin(targetIndex?: number) {
    return this.ctrl?.spin(targetIndex);
  }
  reset() {
    return this.ctrl?.reset();
  }
}

if (typeof customElements !== 'undefined' && !customElements.get(TAG)) {
  customElements.define(TAG, CosTurntableElement);
}

export { CosTurntableElement, TAG };
