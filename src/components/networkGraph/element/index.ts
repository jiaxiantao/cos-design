import {
  readJsonAttr,
  readNumberAttr,
  readPropertyOverride,
  readStringAttr,
} from '@cos-design/shared';
import { createNetworkGraph, type NetworkGraphController, type NetworkGraphOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-network-graph';

function parseOptions(el: HTMLElement): NetworkGraphOptions {
  const options = {} as NetworkGraphOptions;
  readStringAttr(options, el, 'linkColor', 'link-color');
  readStringAttr(options, el, 'hint', 'hint');
  readNumberAttr(options, el, 'width', 'width');
  readNumberAttr(options, el, 'height', 'height');
  readNumberAttr(options, el, 'nodeRadius', 'node-radius');
  readJsonAttr(options, el, 'nodes', 'nodes');
  readPropertyOverride(options, el, 'nodes', '_nodes');
  readJsonAttr(options, el, 'edges', 'edges');
  readPropertyOverride(options, el, 'edges', '_edges');
  return options;
}

class CosNetworkGraphElement extends HTMLElement {
  private ctrl: NetworkGraphController | null = null;

  _nodes?: NetworkGraphOptions['nodes'];
  get nodes(): NetworkGraphOptions['nodes'] | undefined {
    return this._nodes;
  }
  set nodes(value: NetworkGraphOptions['nodes']) {
    this._nodes = value;
    this.ctrl?.update(parseOptions(this));
  }
  _edges?: NetworkGraphOptions['edges'];
  get edges(): NetworkGraphOptions['edges'] | undefined {
    return this._edges;
  }
  set edges(value: NetworkGraphOptions['edges']) {
    this._edges = value;
    this.ctrl?.update(parseOptions(this));
  }

  static get observedAttributes() {
    return ['width', 'height', 'nodes', 'edges', 'link-color', 'node-radius', 'hint'];
  }

  connectedCallback() {
    this.ctrl = createNetworkGraph(this, parseOptions(this));
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
  customElements.define(TAG, CosNetworkGraphElement);
}

export { CosNetworkGraphElement, TAG };
