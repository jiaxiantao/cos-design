import {
  optionCallbackDispatcher,
  readBooleanAttr,
  readNumberAttr,
  readStringAttr,
} from '@cos-design/shared';
import { createFireworks, type FireworksController, type FireworksOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-fireworks';

function parseOptions(el: HTMLElement): FireworksOptions {
  const options = {} as FireworksOptions;
  readStringAttr(options, el, 'hint', 'hint');
  readNumberAttr(options, el, 'width', 'width');
  readNumberAttr(options, el, 'height', 'height');
  readBooleanAttr(options, el, 'fill', 'fill', 'presence');
  readBooleanAttr(options, el, 'auto', 'auto', 'optional-true');
  readBooleanAttr(options, el, 'interactive', 'interactive', 'optional-true');
  options.onComplete = optionCallbackDispatcher(el, 'complete');
  return options;
}

class CosFireworksElement extends HTMLElement {
  private ctrl: FireworksController | null = null;

  static get observedAttributes() {
    return ['width', 'height', 'fill', 'auto', 'interactive', 'hint'];
  }

  connectedCallback() {
    this.ctrl = createFireworks(this, parseOptions(this));
  }

  disconnectedCallback() {
    this.ctrl?.destroy();
    this.ctrl = null;
  }

  attributeChangedCallback() {
    this.ctrl?.update(parseOptions(this));
  }

  launch(x?: number) {
    return this.ctrl?.launch(x);
  }
}

if (typeof customElements !== 'undefined' && !customElements.get(TAG)) {
  customElements.define(TAG, CosFireworksElement);
}

export { CosFireworksElement, TAG };
