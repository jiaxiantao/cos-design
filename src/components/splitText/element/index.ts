import { createSplitText, type SplitTextController, type SplitTextOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-split-text';

function parseOptions(el: HTMLElement): SplitTextOptions {
  const options: SplitTextOptions = {};
  if (el.hasAttribute('text')) options.text = el.getAttribute('text') ?? undefined;
  if (el.hasAttribute('animation')) options.animation = el.getAttribute('animation') as SplitTextOptions['animation'];
  if (el.hasAttribute('stagger')) options.stagger = Number(el.getAttribute('stagger'));
  if (el.hasAttribute('duration')) options.duration = Number(el.getAttribute('duration'));
  if (el.hasAttribute('loop')) options.loop = true;
  if (el.hasAttribute('font-size')) options.fontSize = Number(el.getAttribute('font-size'));
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  return options;
}

class CosSplitTextElement extends HTMLElement {
  private ctrl: SplitTextController | null = null;

  static get observedAttributes() {
    return ['text', 'animation', 'stagger', 'duration', 'loop', 'font-size', 'color'];
  }

  connectedCallback() {
    this.ctrl = createSplitText(this, parseOptions(this));
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
  customElements.define(TAG, CosSplitTextElement);
}

export { CosSplitTextElement, TAG };
