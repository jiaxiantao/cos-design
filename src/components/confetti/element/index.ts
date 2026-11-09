import {
  optionCallbackDispatcher,
  readBooleanAttr,
  readNumberAttr,
  readStringAttr,
} from '@cos-design/shared';
import { createConfetti, type ConfettiController, type ConfettiOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-confetti';

function parseOptions(el: HTMLElement): ConfettiOptions {
  const options = {} as ConfettiOptions;
  readStringAttr(options, el, 'hint', 'hint');
  readNumberAttr(options, el, 'width', 'width');
  readNumberAttr(options, el, 'height', 'height');
  readNumberAttr(options, el, 'particleCount', 'particle-count');
  readBooleanAttr(options, el, 'fill', 'fill', 'presence');
  readBooleanAttr(options, el, 'auto', 'auto', 'optional-true');
  readBooleanAttr(options, el, 'interactive', 'interactive', 'optional-true');
  options.onComplete = optionCallbackDispatcher(el, 'complete');
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
