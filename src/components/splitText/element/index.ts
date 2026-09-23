import { createSplitText, type SplitTextController, type SplitTextOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-split-text';

function parseOptions(el: HTMLElement): SplitTextOptions {
  const options = {} as SplitTextOptions;
  if (el.hasAttribute('text')) options.text = el.getAttribute('text') ?? undefined;
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  if (el.hasAttribute('stagger')) options.stagger = Number(el.getAttribute('stagger'));
  if (el.hasAttribute('duration')) options.duration = Number(el.getAttribute('duration'));
  if (el.hasAttribute('loop-pause')) options.loopPause = Number(el.getAttribute('loop-pause'));
  if (el.hasAttribute('font-size')) options.fontSize = Number(el.getAttribute('font-size'));
  options.loop = el.hasAttribute('loop');
  if (el.hasAttribute('animation')) {
    try {
      options.animation = JSON.parse(
        el.getAttribute('animation') ?? 'null',
      ) as SplitTextOptions['animation'];
    } catch {
      /* ignore invalid JSON */
    }
  }
  const propanimation = (el as CosSplitTextElement)._animation;
  if (propanimation !== undefined)
    options.animation = propanimation as SplitTextOptions['animation'];
  return options;
}

class CosSplitTextElement extends HTMLElement {
  private ctrl: SplitTextController | null = null;

  _animation?: SplitTextOptions['animation'];
  get animation(): SplitTextOptions['animation'] | undefined {
    return this._animation;
  }
  set animation(value: SplitTextOptions['animation']) {
    this._animation = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return ['text', 'animation', 'stagger', 'duration', 'loop', 'loop-pause', 'font-size', 'color'];
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
