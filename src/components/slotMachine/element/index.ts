import {
  optionCallbackDispatcher,
  readJsonAttr,
  readNumberAttr,
  readPropertyOverride,
  readStringAttr,
} from '@cos-design/shared';
import { createSlotMachine, type SlotMachineController, type SlotMachineOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-slot-machine';

function parseOptions(el: HTMLElement): SlotMachineOptions {
  const options = {} as SlotMachineOptions;
  readStringAttr(options, el, 'startText', 'start-text');
  readStringAttr(options, el, 'buttonText', 'button-text');
  readStringAttr(options, el, 'spinningText', 'spinning-text');
  readStringAttr(options, el, 'jackpotText', 'jackpot-text');
  readStringAttr(options, el, 'resultPrefix', 'result-prefix');
  readNumberAttr(options, el, 'spinDuration', 'spin-duration');
  readJsonAttr(options, el, 'symbols', 'symbols');
  readPropertyOverride(options, el, 'symbols', '_symbols');
  readJsonAttr(options, el, 'targetResults', 'target-results');
  readPropertyOverride(options, el, 'targetResults', '_targetResults');
  options.onSpinEnd = optionCallbackDispatcher(el, 'spin-end');
  return options;
}

class CosSlotMachineElement extends HTMLElement {
  private ctrl: SlotMachineController | null = null;

  _symbols?: SlotMachineOptions['symbols'];
  get symbols(): SlotMachineOptions['symbols'] | undefined {
    return this._symbols;
  }
  set symbols(value: SlotMachineOptions['symbols']) {
    this._symbols = value;
    this.ctrl?.update(parseOptions(this));
  }
  _targetResults?: SlotMachineOptions['targetResults'];
  get targetResults(): SlotMachineOptions['targetResults'] | undefined {
    return this._targetResults;
  }
  set targetResults(value: SlotMachineOptions['targetResults']) {
    this._targetResults = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return ['symbols', 'spin-duration', 'target-results', 'start-text', 'button-text', 'spinning-text', 'jackpot-text', 'result-prefix'];
  }

  connectedCallback() {
    this.ctrl = createSlotMachine(this, parseOptions(this));
  }

  disconnectedCallback() {
    this.ctrl?.destroy();
    this.ctrl = null;
  }

  attributeChangedCallback() {
    this.ctrl?.update(parseOptions(this));
  }

  spin(results?: string[]) {
    return this.ctrl?.spin(results);
  }
  reset() {
    return this.ctrl?.reset();
  }
}

if (typeof customElements !== 'undefined' && !customElements.get(TAG)) {
  customElements.define(TAG, CosSlotMachineElement);
}

export { CosSlotMachineElement, TAG };
