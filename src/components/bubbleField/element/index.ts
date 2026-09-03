import { createBubbleField, type BubbleFieldController, type BubbleFieldOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-bubble-field';

function parseOptions(el: HTMLElement): BubbleFieldOptions {
  const options = {} as BubbleFieldOptions;
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
  if (el.hasAttribute('bubble-count'))
    options.bubbleCount = Number(el.getAttribute('bubble-count'));
  if (el.hasAttribute('speed')) options.speed = Number(el.getAttribute('speed'));
  options.fill = el.hasAttribute('fill');
  if (el.hasAttribute('interactive')) {
    const raw = el.getAttribute('interactive');
    options.interactive = raw !== 'false' && raw !== '0';
  }
  return options;
}

class CosBubbleFieldElement extends HTMLElement {
  private ctrl: BubbleFieldController | null = null;

  static get observedAttributes() {
    return ['width', 'height', 'fill', 'bubble-count', 'speed', 'color', 'interactive'];
  }

  connectedCallback() {
    this.ctrl = createBubbleField(this, parseOptions(this));
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
  customElements.define(TAG, CosBubbleFieldElement);
}

export { CosBubbleFieldElement, TAG };
