import {
  optionCallbackDispatcher,
  readJsonAttr,
  readPropertyOverride,
  readStringAttr,
} from '@cos-design/shared';
import { createDiceRoll, type DiceRollController, type DiceRollOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-dice-roll';

function parseOptions(el: HTMLElement): DiceRollOptions {
  const options = {} as DiceRollOptions;
  readStringAttr(options, el, 'rollText', 'roll-text');
  readStringAttr(options, el, 'rollingText', 'rolling-text');
  readStringAttr(options, el, 'resultPrefix', 'result-prefix');
  readJsonAttr(options, el, 'sides', 'sides');
  readPropertyOverride(options, el, 'sides', '_sides');
  options.onRoll = optionCallbackDispatcher(el, 'roll');
  return options;
}

class CosDiceRollElement extends HTMLElement {
  private ctrl: DiceRollController | null = null;

  _sides?: DiceRollOptions['sides'];
  get sides(): DiceRollOptions['sides'] | undefined {
    return this._sides;
  }
  set sides(value: DiceRollOptions['sides']) {
    this._sides = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return ['sides', 'roll-text', 'rolling-text', 'result-prefix'];
  }

  connectedCallback() {
    this.ctrl = createDiceRoll(this, parseOptions(this));
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
  customElements.define(TAG, CosDiceRollElement);
}

export { CosDiceRollElement, TAG };
