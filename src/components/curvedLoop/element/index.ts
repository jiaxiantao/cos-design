import { createCurvedLoop, type CurvedLoopController, type CurvedLoopOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-curved-loop';

function parseOptions(el: HTMLElement): CurvedLoopOptions {
  const options = {} as CurvedLoopOptions;
  if (el.hasAttribute('text')) options.text = el.getAttribute('text') ?? undefined;
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  if (el.hasAttribute('speed')) options.speed = Number(el.getAttribute('speed'));
  if (el.hasAttribute('curve-amount'))
    options.curveAmount = Number(el.getAttribute('curve-amount'));
  if (el.hasAttribute('font-size')) options.fontSize = Number(el.getAttribute('font-size'));
  if (el.hasAttribute('interactive')) {
    const raw = el.getAttribute('interactive');
    options.interactive = raw !== 'false' && raw !== '0';
  }
  if (el.hasAttribute('direction')) {
    try {
      options.direction = JSON.parse(
        el.getAttribute('direction') ?? 'null',
      ) as CurvedLoopOptions['direction'];
    } catch {
      /* ignore invalid JSON */
    }
  }
  const propdirection = (el as CosCurvedLoopElement)._direction;
  if (propdirection !== undefined)
    options.direction = propdirection as CurvedLoopOptions['direction'];
  return options;
}

class CosCurvedLoopElement extends HTMLElement {
  private ctrl: CurvedLoopController | null = null;

  _direction?: CurvedLoopOptions['direction'];
  get direction(): CurvedLoopOptions['direction'] | undefined {
    return this._direction;
  }
  set direction(value: CurvedLoopOptions['direction']) {
    this._direction = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return ['text', 'speed', 'curve-amount', 'direction', 'interactive', 'color', 'font-size'];
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
