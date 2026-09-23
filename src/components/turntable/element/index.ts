import { createTurntable, type TurntableController, type TurntableOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-turntable';

function parseOptions(el: HTMLElement): TurntableOptions {
  const options = {} as TurntableOptions;
  if (el.hasAttribute('button-text'))
    options.buttonText = el.getAttribute('button-text') ?? undefined;
  if (el.hasAttribute('spinning-text'))
    options.spinningText = el.getAttribute('spinning-text') ?? undefined;
  if (el.hasAttribute('result-prefix'))
    options.resultPrefix = el.getAttribute('result-prefix') ?? undefined;
  if (el.hasAttribute('size')) options.size = Number(el.getAttribute('size'));
  if (el.hasAttribute('spin-duration'))
    options.spinDuration = Number(el.getAttribute('spin-duration'));
  if (el.hasAttribute('spin-rounds')) options.spinRounds = Number(el.getAttribute('spin-rounds'));
  if (el.hasAttribute('target-index'))
    options.targetIndex = Number(el.getAttribute('target-index'));
  if (el.hasAttribute('prizes')) {
    try {
      options.prizes = JSON.parse(
        el.getAttribute('prizes') ?? 'null',
      ) as TurntableOptions['prizes'];
    } catch {
      /* ignore invalid JSON */
    }
  }
  const propprizes = (el as CosTurntableElement)._prizes;
  if (propprizes !== undefined) options.prizes = propprizes as TurntableOptions['prizes'];
  options.onSpinEnd = (...args: unknown[]) => {
    el.dispatchEvent(
      new CustomEvent('spin-end', { detail: args.length <= 1 ? args[0] : args, bubbles: true }),
    );
  };
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
    return [
      'prizes',
      'size',
      'spin-duration',
      'spin-rounds',
      'target-index',
      'button-text',
      'spinning-text',
      'result-prefix',
    ];
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
