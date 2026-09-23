import { createConfetti, type ConfettiController, type ConfettiOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-confetti';

function parseOptions(el: HTMLElement): ConfettiOptions {
  const options = {} as ConfettiOptions;
  if (el.hasAttribute('hint')) options.hint = el.getAttribute('hint') ?? undefined;
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
  if (el.hasAttribute('particle-count'))
    options.particleCount = Number(el.getAttribute('particle-count'));
  options.fill = el.hasAttribute('fill');
  if (el.hasAttribute('auto')) {
    const raw = el.getAttribute('auto');
    options.auto = raw !== 'false' && raw !== '0';
  }
  if (el.hasAttribute('interactive')) {
    const raw = el.getAttribute('interactive');
    options.interactive = raw !== 'false' && raw !== '0';
  }
  options.onComplete = (...args: unknown[]) => {
    el.dispatchEvent(
      new CustomEvent('complete', { detail: args.length <= 1 ? args[0] : args, bubbles: true }),
    );
  };
  return options;
}

class CosConfettiElement extends HTMLElement {
  private ctrl: ConfettiController | null = null;

  static get observedAttributes() {
    return ['width', 'height', 'fill', 'auto', 'interactive', 'particle-count', 'hint'];
  }

  connectedCallback() {
    this.ctrl = createConfetti(this, parseOptions(this));
  }

  disconnectedCallback() {
    this.ctrl?.destroy();
    this.ctrl = null;
  }

  attributeChangedCallback() {
    this.ctrl?.update(parseOptions(this));
  }

  burst() {
    return this.ctrl?.burst();
  }
}

if (typeof customElements !== 'undefined' && !customElements.get(TAG)) {
  customElements.define(TAG, CosConfettiElement);
}

export { CosConfettiElement, TAG };
