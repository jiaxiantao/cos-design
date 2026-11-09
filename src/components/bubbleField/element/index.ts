import {
  readBooleanAttr,
  readNumberAttr,
  readStringAttr,
} from '@cos-design/shared';
import { createBubbleField, type BubbleFieldController, type BubbleFieldOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-bubble-field';

function parseOptions(el: HTMLElement): BubbleFieldOptions {
  const options = {} as BubbleFieldOptions;
  readStringAttr(options, el, 'color', 'color');
  readNumberAttr(options, el, 'width', 'width');
  readNumberAttr(options, el, 'height', 'height');
  readNumberAttr(options, el, 'bubbleCount', 'bubble-count');
  readNumberAttr(options, el, 'speed', 'speed');
  readBooleanAttr(options, el, 'fill', 'fill', 'presence');
  readBooleanAttr(options, el, 'interactive', 'interactive', 'optional-true');
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
