import {
  createTimelinePulse,
  type TimelinePulseController,
  type TimelinePulseOptions,
} from '../core';
import '../style/index.css';

const TAG = 'cos-timeline-pulse';

function parseOptions(el: HTMLElement): TimelinePulseOptions {
  const options: TimelinePulseOptions = {};
  if (el.hasAttribute('current')) options.current = Number(el.getAttribute('current'));
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  return options;
}

class CosTimelinePulseElement extends HTMLElement {
  private ctrl: TimelinePulseController | null = null;

  static get observedAttributes() {
    return ['current', 'color'];
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
