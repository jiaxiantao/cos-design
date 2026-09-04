import {
  createProgressChest,
  type ProgressChestController,
  type ProgressChestOptions,
} from '../core';
import '../style/index.css';

const TAG = 'cos-progress-chest';

function parseOptions(el: HTMLElement): ProgressChestOptions {
  const options = {} as ProgressChestOptions;
  if (el.hasAttribute('label')) options.label = el.getAttribute('label') ?? undefined;
  if (el.hasAttribute('opened-label'))
    options.openedLabel = el.getAttribute('opened-label') ?? undefined;
  if (el.hasAttribute('progress')) options.progress = Number(el.getAttribute('progress'));
  if (el.hasAttribute('auto')) {
    const raw = el.getAttribute('auto');
    options.auto = raw !== 'false' && raw !== '0';
  }
  options.onOpen = (...args: unknown[]) => {
    el.dispatchEvent(
      new CustomEvent('open', { detail: args.length <= 1 ? args[0] : args, bubbles: true }),
    );
  };
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
