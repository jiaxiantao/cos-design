import { createAudioVisualizer, type AudioVisualizerController, type AudioVisualizerOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-audio-visualizer';

function parseOptions(_el: HTMLElement): AudioVisualizerOptions {
  void _el;
  const options: AudioVisualizerOptions = {};

  return options;
}

class CosAudioVisualizerElement extends HTMLElement {
  private ctrl: AudioVisualizerController | null = null;

  static get observedAttributes() {
    return [];
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
