import { createSlotMachine, type SlotMachineController, type SlotMachineOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-slot-machine';

function parseOptions(el: HTMLElement): SlotMachineOptions {
  const options = {} as SlotMachineOptions;
  if (el.hasAttribute('symbols')) {
    try {
      options.symbols = JSON.parse(el.getAttribute('symbols') ?? 'null');
    } catch {
      /* ignore invalid JSON */
    }
  }
  if (el.hasAttribute('spin-duration'))
    options.spinDuration = Number(el.getAttribute('spin-duration'));
  if (el.hasAttribute('target-results')) {
    try {
      options.targetResults = JSON.parse(el.getAttribute('target-results') ?? 'null');
    } catch {
      /* ignore invalid JSON */
    }
  }
  if (el.hasAttribute('start-text')) options.startText = el.getAttribute('start-text') ?? undefined;
  if (el.hasAttribute('button-text'))
    options.buttonText = el.getAttribute('button-text') ?? undefined;
  if (el.hasAttribute('spinning-text'))
    options.spinningText = el.getAttribute('spinning-text') ?? undefined;
  if (el.hasAttribute('jackpot-text'))
    options.jackpotText = el.getAttribute('jackpot-text') ?? undefined;
  if (el.hasAttribute('result-prefix'))
    options.resultPrefix = el.getAttribute('result-prefix') ?? undefined;
  return options;
}

class CosSlotMachineElement extends HTMLElement {
  private ctrl: SlotMachineController | null = null;

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
    this.ctrl?.spin(results);
  }

  reset() {
    this.ctrl?.reset();
  }
}

if (typeof customElements !== 'undefined' && !customElements.get(TAG)) {
  customElements.define(TAG, CosSlotMachineElement);
}

export { CosSlotMachineElement, TAG };
