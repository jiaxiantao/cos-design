import { createCurvedLoop, type CurvedLoopController, type CurvedLoopOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-curved-loop';

function parseOptions(el: HTMLElement): CurvedLoopOptions {
  const options: CurvedLoopOptions = {};
  if (el.hasAttribute('text')) options.text = el.getAttribute('text') ?? undefined;
  if (el.hasAttribute('speed')) options.speed = Number(el.getAttribute('speed'));
  if (el.hasAttribute('curve-amount'))
    options.curveAmount = Number(el.getAttribute('curve-amount'));
  if (el.hasAttribute('interactive')) options.interactive = true;
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  if (el.hasAttribute('font-size')) options.fontSize = Number(el.getAttribute('font-size'));
  return options;
}

class CosCurvedLoopElement extends HTMLElement {
  private ctrl: CurvedLoopController | null = null;

  static get observedAttributes() {
    return ['text', 'speed', 'curve-amount', 'interactive', 'color', 'font-size'];
  }

  connectedCallback() {
    this.ctrl = createCurvedLoop(this, parseOptions(this));
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
  customElements.define(TAG, CosCurvedLoopElement);
}

export { CosCurvedLoopElement, TAG };
