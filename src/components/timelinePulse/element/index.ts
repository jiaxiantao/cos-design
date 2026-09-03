import {
  createTimelinePulse,
  type TimelinePulseController,
  type TimelinePulseOptions,
} from '../core';
import '../style/index.css';

const TAG = 'cos-timeline-pulse';

function parseOptions(el: HTMLElement): TimelinePulseOptions {
  const options = {} as TimelinePulseOptions;
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  if (el.hasAttribute('current')) options.current = Number(el.getAttribute('current'));
  if (el.hasAttribute('steps')) {
    try {
      options.steps = JSON.parse(
        el.getAttribute('steps') ?? 'null',
      ) as TimelinePulseOptions['steps'];
    } catch {
      /* ignore invalid JSON */
    }
  }
  const propsteps = (el as CosTimelinePulseElement)._steps;
  if (propsteps !== undefined) options.steps = propsteps as TimelinePulseOptions['steps'];
  return options;
}

class CosTimelinePulseElement extends HTMLElement {
  private ctrl: TimelinePulseController | null = null;

  _steps?: TimelinePulseOptions['steps'];
  get steps(): TimelinePulseOptions['steps'] | undefined {
    return this._steps;
  }
  set steps(value: TimelinePulseOptions['steps']) {
    this._steps = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return ['steps', 'current', 'color'];
  }

  connectedCallback() {
    this.ctrl = createTimelinePulse(this, parseOptions(this));
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
  customElements.define(TAG, CosTimelinePulseElement);
}

export { CosTimelinePulseElement, TAG };
