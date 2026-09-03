import { createSlotMachine, type SlotMachineController, type SlotMachineOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-slot-machine';

function parseOptions(el: HTMLElement): SlotMachineOptions {
  const options = {} as SlotMachineOptions;
  if (el.hasAttribute('start-text')) options.startText = el.getAttribute('start-text') ?? undefined;
  if (el.hasAttribute('button-text'))
    options.buttonText = el.getAttribute('button-text') ?? undefined;
  if (el.hasAttribute('spinning-text'))
    options.spinningText = el.getAttribute('spinning-text') ?? undefined;
  if (el.hasAttribute('jackpot-text'))
    options.jackpotText = el.getAttribute('jackpot-text') ?? undefined;
  if (el.hasAttribute('result-prefix'))
    options.resultPrefix = el.getAttribute('result-prefix') ?? undefined;
  if (el.hasAttribute('spin-duration'))
    options.spinDuration = Number(el.getAttribute('spin-duration'));
  if (el.hasAttribute('symbols')) {
    try {
      options.symbols = JSON.parse(
        el.getAttribute('symbols') ?? 'null',
      ) as SlotMachineOptions['symbols'];
    } catch {
      /* ignore invalid JSON */
    }
  }
  const propsymbols = (el as CosSlotMachineElement)._symbols;
  if (propsymbols !== undefined) options.symbols = propsymbols as SlotMachineOptions['symbols'];
  if (el.hasAttribute('target-results')) {
    try {
      options.targetResults = JSON.parse(
        el.getAttribute('target-results') ?? 'null',
      ) as SlotMachineOptions['targetResults'];
    } catch {
      /* ignore invalid JSON */
    }
  }
  const proptargetResults = (el as CosSlotMachineElement)._targetResults;
  if (proptargetResults !== undefined)
    options.targetResults = proptargetResults as SlotMachineOptions['targetResults'];
  options.onSpinEnd = (...args: unknown[]) => {
    el.dispatchEvent(
      new CustomEvent('spin-end', { detail: args.length <= 1 ? args[0] : args, bubbles: true }),
    );
  };
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
    return [
      'symbols',
      'spin-duration',
      'target-results',
      'start-text',
      'button-text',
      'spinning-text',
      'jackpot-text',
      'result-prefix',
    ];
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
