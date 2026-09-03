import { createOrbitalChart, type OrbitalChartController, type OrbitalChartOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-orbital-chart';

function parseOptions(el: HTMLElement): OrbitalChartOptions {
  const options = {} as OrbitalChartOptions;
  if (el.hasAttribute('size')) options.size = Number(el.getAttribute('size'));
  return options;
}

class CosOrbitalChartElement extends HTMLElement {
  private ctrl: OrbitalChartController | null = null;

  static get observedAttributes() {
    return ['size'];
  }

  connectedCallback() {
    this.ctrl = createOrbitalChart(this, parseOptions(this));
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
  customElements.define(TAG, CosOrbitalChartElement);
}

export { CosOrbitalChartElement, TAG };
