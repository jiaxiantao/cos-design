import {
  optionCallbackDispatcher,
  readBooleanAttr,
  readNumberAttr,
  readStringAttr,
} from '@cos-design/shared';
import {
  createProgressChest,
  type ProgressChestController,
  type ProgressChestOptions,
} from '../core';
import '../style/index.css';

const TAG = 'cos-progress-chest';

function parseOptions(el: HTMLElement): ProgressChestOptions {
  const options = {} as ProgressChestOptions;
  readStringAttr(options, el, 'label', 'label');
  readStringAttr(options, el, 'openedLabel', 'opened-label');
  readNumberAttr(options, el, 'progress', 'progress');
  readBooleanAttr(options, el, 'auto', 'auto', 'optional-true');
  options.onOpen = optionCallbackDispatcher(el, 'open');
  return options;
}

class CosProgressChestElement extends HTMLElement {
  private ctrl: ProgressChestController | null = null;

  static get observedAttributes() {
    return ['progress', 'auto', 'label', 'opened-label'];
  }

  connectedCallback() {
    this.ctrl = createProgressChest(this, parseOptions(this));
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
  customElements.define(TAG, CosProgressChestElement);
}

export { CosProgressChestElement, TAG };
