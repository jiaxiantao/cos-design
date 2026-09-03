import { createDiceRoll, type DiceRollController, type DiceRollOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-dice-roll';

function parseOptions(_el: HTMLElement): DiceRollOptions {
  void _el;
  const options: DiceRollOptions = {};

  return options;
}

class CosDiceRollElement extends HTMLElement {
  private ctrl: DiceRollController | null = null;

  static get observedAttributes() {
    return [];
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
