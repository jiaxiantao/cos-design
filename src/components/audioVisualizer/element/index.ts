import {
  createAudioVisualizer,
  type AudioVisualizerController,
  type AudioVisualizerOptions,
} from '../core';
import '../style/index.css';

const TAG = 'cos-audio-visualizer';

function parseOptions(el: HTMLElement): AudioVisualizerOptions {
  const options = {} as AudioVisualizerOptions;
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
  if (el.hasAttribute('bar-count')) options.barCount = Number(el.getAttribute('bar-count'));
  options.useMic = el.hasAttribute('use-mic');
  return options;
}

class CosAudioVisualizerElement extends HTMLElement {
  private ctrl: AudioVisualizerController | null = null;

  static get observedAttributes() {
    return ['width', 'height', 'bar-count', 'use-mic'];
  }

  connectedCallback() {
    this.ctrl = createAudioVisualizer(this, parseOptions(this));
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
  customElements.define(TAG, CosAudioVisualizerElement);
}

export { CosAudioVisualizerElement, TAG };
