import { readBooleanAttr, readNumberAttr } from '@cos-design/shared';
import {
  createAudioVisualizer,
  type AudioVisualizerController,
  type AudioVisualizerOptions,
} from '../core';
import '../style/index.css';

const TAG = 'cos-audio-visualizer';

function parseOptions(el: HTMLElement): AudioVisualizerOptions {
  const options = {} as AudioVisualizerOptions;
  readNumberAttr(options, el, 'width', 'width');
  readNumberAttr(options, el, 'height', 'height');
  readNumberAttr(options, el, 'barCount', 'bar-count');
  readBooleanAttr(options, el, 'useMic', 'use-mic', 'presence');
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
