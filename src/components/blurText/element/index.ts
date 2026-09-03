import { createBlurText, type BlurTextController, type BlurTextOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-blur-text';

function parseOptions(el: HTMLElement): BlurTextOptions {
  const options = {} as BlurTextOptions;
  if (el.hasAttribute('text')) options.text = el.getAttribute('text') ?? undefined;
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  if (el.hasAttribute('stagger')) options.stagger = Number(el.getAttribute('stagger'));
  if (el.hasAttribute('duration')) options.duration = Number(el.getAttribute('duration'));
  if (el.hasAttribute('font-size')) options.fontSize = Number(el.getAttribute('font-size'));
  if (el.hasAttribute('animate-by')) {
    try {
      options.animateBy = JSON.parse(
        el.getAttribute('animate-by') ?? 'null',
      ) as BlurTextOptions['animateBy'];
    } catch {
      /* ignore invalid JSON */
    }
  }
  const propanimateBy = (el as CosBlurTextElement)._animateBy;
  if (propanimateBy !== undefined)
    options.animateBy = propanimateBy as BlurTextOptions['animateBy'];
  if (el.hasAttribute('direction')) {
    try {
      options.direction = JSON.parse(
        el.getAttribute('direction') ?? 'null',
      ) as BlurTextOptions['direction'];
    } catch {
      /* ignore invalid JSON */
    }
  }
  const propdirection = (el as CosBlurTextElement)._direction;
  if (propdirection !== undefined)
    options.direction = propdirection as BlurTextOptions['direction'];
  options.onAnimationComplete = (...args: unknown[]) => {
    el.dispatchEvent(
      new CustomEvent('animation-complete', {
        detail: args.length <= 1 ? args[0] : args,
        bubbles: true,
      }),
    );
  };
  return options;
}

class CosBlurTextElement extends HTMLElement {
  private ctrl: BlurTextController | null = null;

  _animateBy?: BlurTextOptions['animateBy'];
  get animateBy(): BlurTextOptions['animateBy'] | undefined {
    return this._animateBy;
  }
  set animateBy(value: BlurTextOptions['animateBy']) {
    this._animateBy = value;
    this.ctrl?.update(parseOptions(this));
  }
  _direction?: BlurTextOptions['direction'];
  get direction(): BlurTextOptions['direction'] | undefined {
    return this._direction;
  }
  set direction(value: BlurTextOptions['direction']) {
    this._direction = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return ['text', 'animate-by', 'direction', 'stagger', 'duration', 'font-size', 'color'];
  }

  connectedCallback() {
    this.ctrl = createBlurText(this, parseOptions(this));
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
  customElements.define(TAG, CosBlurTextElement);
}

export { CosBlurTextElement, TAG };
