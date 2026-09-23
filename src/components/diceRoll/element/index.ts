import { createDiceRoll, type DiceRollController, type DiceRollOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-dice-roll';

function parseOptions(el: HTMLElement): DiceRollOptions {
  const options = {} as DiceRollOptions;
  if (el.hasAttribute('roll-text')) options.rollText = el.getAttribute('roll-text') ?? undefined;
  if (el.hasAttribute('rolling-text'))
    options.rollingText = el.getAttribute('rolling-text') ?? undefined;
  if (el.hasAttribute('result-prefix'))
    options.resultPrefix = el.getAttribute('result-prefix') ?? undefined;
  if (el.hasAttribute('sides')) {
    try {
      options.sides = JSON.parse(el.getAttribute('sides') ?? 'null') as DiceRollOptions['sides'];
    } catch {
      /* ignore invalid JSON */
    }
  }
  const propsides = (el as CosDiceRollElement)._sides;
  if (propsides !== undefined) options.sides = propsides as DiceRollOptions['sides'];
  options.onRoll = (...args: unknown[]) => {
    el.dispatchEvent(
      new CustomEvent('roll', { detail: args.length <= 1 ? args[0] : args, bubbles: true }),
    );
  };
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
