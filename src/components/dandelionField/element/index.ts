import { readBooleanAttr, readNumberAttr, readStringAttr } from '@cos-design/shared';
import {
  createDandelionField,
  type DandelionFieldController,
  type DandelionFieldOptions,
} from '../core';
import '../style/index.css';

const TAG = 'cos-dandelion-field';

function parseOptions(el: HTMLElement): DandelionFieldOptions {
  const options = {} as DandelionFieldOptions;
  readStringAttr(options, el, 'ariaLabel', 'aria-label');
  readNumberAttr(options, el, 'width', 'width');
  readNumberAttr(options, el, 'height', 'height');
  readNumberAttr(options, el, 'plantCount', 'plant-count');
  readNumberAttr(options, el, 'seedCount', 'seed-count');
  readNumberAttr(options, el, 'speed', 'speed');
  readBooleanAttr(options, el, 'fill', 'fill', 'presence');
  readBooleanAttr(options, el, 'interactive', 'interactive', 'optional-true');
  return options;
}

class CosDandelionFieldElement extends HTMLElement {
  private ctrl: DandelionFieldController | null = null;

  static get observedAttributes() {
    return [
      'width',
      'height',
      'fill',
      'plant-count',
      'seed-count',
      'speed',
      'interactive',
      'aria-label',
    ];
  }

  connectedCallback() {
    this.ctrl = createDandelionField(this, parseOptions(this));
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
  customElements.define(TAG, CosDandelionFieldElement);
}

export { CosDandelionFieldElement, TAG };
