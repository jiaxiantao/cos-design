import {
  readBooleanAttr,
  readNumberAttr,
  readStringAttr,
} from '@cos-design/shared';
import { createSmokeFog, type SmokeFogController, type SmokeFogOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-smoke-fog';

function parseOptions(el: HTMLElement): SmokeFogOptions {
  const options = {} as SmokeFogOptions;
  readStringAttr(options, el, 'color', 'color');
  readStringAttr(options, el, 'backgroundColor', 'background-color');
  readStringAttr(options, el, 'ariaLabel', 'aria-label');
  readNumberAttr(options, el, 'width', 'width');
  readNumberAttr(options, el, 'height', 'height');
  readNumberAttr(options, el, 'density', 'density');
  readNumberAttr(options, el, 'speed', 'speed');
  readNumberAttr(options, el, 'disperseStrength', 'disperse-strength');
  readNumberAttr(options, el, 'disperseRadius', 'disperse-radius');
  readBooleanAttr(options, el, 'fill', 'fill', 'presence');
  readBooleanAttr(options, el, 'interactive', 'interactive', 'optional-true');
  return options;
}

class CosSmokeFogElement extends HTMLElement {
  private ctrl: SmokeFogController | null = null;


  static get observedAttributes() {
    return ['width', 'height', 'fill', 'density', 'color', 'background-color', 'speed', 'disperse-strength', 'disperse-radius', 'interactive', 'aria-label'];
  }

  connectedCallback() {
    this.ctrl = createSmokeFog(this, parseOptions(this));
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
  customElements.define(TAG, CosSmokeFogElement);
}

export { CosSmokeFogElement, TAG };
