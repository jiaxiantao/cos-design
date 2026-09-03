import { createCountdown, type CountdownController, type CountdownOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-countdown';

function parseOptions(el: HTMLElement): CountdownOptions {
  const options = {} as CountdownOptions;
  if (el.hasAttribute('target-date'))
    options.targetDate = el.getAttribute('target-date') ?? undefined;
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  if (el.hasAttribute('invalid-text'))
    options.invalidText = el.getAttribute('invalid-text') ?? undefined;
  if (el.hasAttribute('ended-text')) options.endedText = el.getAttribute('ended-text') ?? undefined;
  options.showLabels = el.hasAttribute('show-labels');
  if (el.hasAttribute('labels')) {
    try {
      options.labels = JSON.parse(
        el.getAttribute('labels') ?? 'null',
      ) as CountdownOptions['labels'];
    } catch {
      /* ignore invalid JSON */
    }
  }
  const proplabels = (el as CosCountdownElement)._labels;
  if (proplabels !== undefined) options.labels = proplabels as CountdownOptions['labels'];
  options.onEnd = (...args: unknown[]) => {
    el.dispatchEvent(
      new CustomEvent('end', { detail: args.length <= 1 ? args[0] : args, bubbles: true }),
    );
  };
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
