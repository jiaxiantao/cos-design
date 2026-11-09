import { readBooleanAttr, readNumberAttr, readStringAttr } from '@cos-design/shared';
import { createLavaBubble, type LavaBubbleController, type LavaBubbleOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-lava-bubble';

function parseOptions(el: HTMLElement): LavaBubbleOptions {
  const options = {} as LavaBubbleOptions;
  readStringAttr(options, el, 'ariaLabel', 'aria-label');
  readNumberAttr(options, el, 'width', 'width');
  readNumberAttr(options, el, 'height', 'height');
  readNumberAttr(options, el, 'heat', 'heat');
  readNumberAttr(options, el, 'speed', 'speed');
  readNumberAttr(options, el, 'activity', 'activity');
  readBooleanAttr(options, el, 'fill', 'fill', 'presence');
  readBooleanAttr(options, el, 'autoSpawn', 'auto-spawn', 'presence');
  readBooleanAttr(options, el, 'interactive', 'interactive', 'optional-true');
  return options;
}

class CosLavaBubbleElement extends HTMLElement {
  private ctrl: LavaBubbleController | null = null;

  static get observedAttributes() {
    return [
      'width',
      'height',
      'fill',
      'heat',
      'speed',
      'auto-spawn',
      'activity',
      'interactive',
      'aria-label',
    ];
  }

  connectedCallback() {
    this.ctrl = createLavaBubble(this, parseOptions(this));
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
  customElements.define(TAG, CosLavaBubbleElement);
}

export { CosLavaBubbleElement, TAG };
