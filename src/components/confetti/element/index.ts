import { createConfetti, type ConfettiController, type ConfettiOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-confetti';

function parseOptions(_el: HTMLElement): ConfettiOptions {
  const options: ConfettiOptions = {};
  if (_el.hasAttribute('width')) options.width = Number(_el.getAttribute('width'));
  if (_el.hasAttribute('height')) options.height = Number(_el.getAttribute('height'));
  if (_el.hasAttribute('fill')) options.fill = true;
  if (_el.hasAttribute('auto')) options.auto = _el.getAttribute('auto') !== 'false';
  return options;
}

class CosConfettiElement extends HTMLElement {
  private ctrl: ConfettiController | null = null;

  static get observedAttributes() {
    return ['width', 'height', 'fill', 'auto'];
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
    this.ctrl?.burst();
  }
}

if (typeof customElements !== 'undefined' && !customElements.get(TAG)) {
  customElements.define(TAG, CosConfettiElement);
}

export { CosConfettiElement, TAG };
