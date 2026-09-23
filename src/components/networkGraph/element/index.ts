import { createNetworkGraph, type NetworkGraphController, type NetworkGraphOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-network-graph';

function parseOptions(el: HTMLElement): NetworkGraphOptions {
  const options = {} as NetworkGraphOptions;
  if (el.hasAttribute('link-color')) options.linkColor = el.getAttribute('link-color') ?? undefined;
  if (el.hasAttribute('hint')) options.hint = el.getAttribute('hint') ?? undefined;
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
  if (el.hasAttribute('node-radius')) options.nodeRadius = Number(el.getAttribute('node-radius'));
  if (el.hasAttribute('nodes')) {
    try {
      options.nodes = JSON.parse(
        el.getAttribute('nodes') ?? 'null',
      ) as NetworkGraphOptions['nodes'];
    } catch {
      /* ignore invalid JSON */
    }
  }
  const propnodes = (el as CosNetworkGraphElement)._nodes;
  if (propnodes !== undefined) options.nodes = propnodes as NetworkGraphOptions['nodes'];
  if (el.hasAttribute('edges')) {
    try {
      options.edges = JSON.parse(
        el.getAttribute('edges') ?? 'null',
      ) as NetworkGraphOptions['edges'];
    } catch {
      /* ignore invalid JSON */
    }
  }
  const propedges = (el as CosNetworkGraphElement)._edges;
  if (propedges !== undefined) options.edges = propedges as NetworkGraphOptions['edges'];
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
