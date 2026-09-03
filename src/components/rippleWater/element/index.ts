import { createRippleWater, type RippleWaterController, type RippleWaterOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-ripple-water';

function parseOptions(el: HTMLElement): RippleWaterOptions {
  const options = {} as RippleWaterOptions;
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
  if (el.hasAttribute('fill')) options.fill = true;
  if (el.hasAttribute('from-color')) options.fromColor = el.getAttribute('from-color') ?? undefined;
  if (el.hasAttribute('to-color')) options.toColor = el.getAttribute('to-color') ?? undefined;
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  if (el.hasAttribute('wave-amplitude')) options.waveAmplitude = Number(el.getAttribute('wave-amplitude'));
  if (el.hasAttribute('wave-speed')) options.waveSpeed = Number(el.getAttribute('wave-speed'));
  if (el.hasAttribute('shimmer')) options.shimmer = Number(el.getAttribute('shimmer'));
  if (el.hasAttribute('reflection')) options.reflection = Number(el.getAttribute('reflection'));
  if (el.hasAttribute('ripple-strength')) options.rippleStrength = Number(el.getAttribute('ripple-strength'));
  if (el.hasAttribute('ripple-radius')) options.rippleRadius = Number(el.getAttribute('ripple-radius'));
  if (el.hasAttribute('damping')) options.damping = Number(el.getAttribute('damping'));
  if (el.hasAttribute('spread')) options.spread = Number(el.getAttribute('spread'));
  if (el.hasAttribute('interactive')) options.interactive = el.getAttribute('interactive') !== 'false';
  if (el.hasAttribute('show-hint')) options.showHint = el.getAttribute('show-hint') !== 'false';
  if (el.hasAttribute('hint')) options.hint = el.getAttribute('hint') ?? undefined;
  return options;
}

class CosRippleWaterElement extends HTMLElement {
  private ctrl: RippleWaterController | null = null;

  static get observedAttributes() {
    return [
      'width',
      'height',
      'fill',
      'from-color',
      'to-color',
      'color',
      'wave-amplitude',
      'wave-speed',
      'shimmer',
      'reflection',
      'ripple-strength',
      'ripple-radius',
      'damping',
      'spread',
      'interactive',
      'show-hint',
      'hint'
    ];
  }

  connectedCallback() {
    this.ctrl = createRippleWater(this, parseOptions(this));
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
  customElements.define(TAG, CosRippleWaterElement);
}

export { CosRippleWaterElement, TAG };
