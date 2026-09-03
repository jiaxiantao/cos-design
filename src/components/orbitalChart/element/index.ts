import { createOrbitalChart, type OrbitalChartController, type OrbitalChartOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-orbital-chart';

function parseOptions(el: HTMLElement): OrbitalChartOptions {
  const options = {} as OrbitalChartOptions;
  if (el.hasAttribute('size')) options.size = Number(el.getAttribute('size'));
  if (el.hasAttribute('data')) {
    try {
      options.data = JSON.parse(el.getAttribute('data') ?? 'null') as OrbitalChartOptions['data'];
    } catch {
      /* ignore invalid JSON */
    }
  }
  const propdata = (el as CosOrbitalChartElement)._data;
  if (propdata !== undefined) options.data = propdata as OrbitalChartOptions['data'];
  return options;
}

class CosOrbitalChartElement extends HTMLElement {
  private ctrl: OrbitalChartController | null = null;

  _data?: OrbitalChartOptions['data'];
  get data(): OrbitalChartOptions['data'] | undefined {
    return this._data;
  }
  set data(value: OrbitalChartOptions['data']) {
    this._data = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return ['data', 'size'];
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
