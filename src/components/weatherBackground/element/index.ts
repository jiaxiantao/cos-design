import { createWeatherBackground, type WeatherBackgroundController, type WeatherBackgroundOptions } from '../core';
import '../style/index.css';

const TAG = 'cos-weather-background';

function parseOptions(el: HTMLElement): WeatherBackgroundOptions {
  const options = {} as WeatherBackgroundOptions;
  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));
  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));
  if (el.hasAttribute('fill')) options.fill = true;
  if (el.hasAttribute('weather'))
    options.weather = (el.getAttribute('weather') ?? undefined) as WeatherBackgroundOptions['weather'];
  if (el.hasAttribute('time')) options.time = el.getAttribute('time') ?? undefined;
  if (el.hasAttribute('live')) options.live = el.getAttribute('live') !== 'false';
  if (el.hasAttribute('latitude')) options.latitude = Number(el.getAttribute('latitude'));
  if (el.hasAttribute('longitude')) options.longitude = Number(el.getAttribute('longitude'));
  if (el.hasAttribute('wind-level')) options.windLevel = Number(el.getAttribute('wind-level'));
  if (el.hasAttribute('rain-level')) options.rainLevel = Number(el.getAttribute('rain-level'));
  if (el.hasAttribute('snow-level')) options.snowLevel = Number(el.getAttribute('snow-level'));
  if (el.hasAttribute('hail-level')) options.hailLevel = Number(el.getAttribute('hail-level'));
  if (el.hasAttribute('fog-level')) options.fogLevel = Number(el.getAttribute('fog-level'));
  if (el.hasAttribute('smog-level')) options.smogLevel = Number(el.getAttribute('smog-level'));
  if (el.hasAttribute('loading')) options.loading = el.getAttribute('loading') !== 'false';
  if (el.hasAttribute('aria-label')) options.ariaLabel = el.getAttribute('aria-label') ?? undefined;
  if (el.hasAttribute('loading-text')) options.loadingText = el.getAttribute('loading-text') ?? undefined;
  return options;
}

class CosWeatherBackgroundElement extends HTMLElement {
  private ctrl: WeatherBackgroundController | null = null;

  static get observedAttributes() {
    return [
      'width',
      'height',
      'fill',
      'weather',
      'time',
      'live',
      'latitude',
      'longitude',
      'wind-level',
      'rain-level',
      'snow-level',
      'hail-level',
      'fog-level',
      'smog-level',
      'loading',
      'aria-label',
      'loading-text'
    ];
  }

  connectedCallback() {
    this.ctrl = createWeatherBackground(this, parseOptions(this));
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
  customElements.define(TAG, CosWeatherBackgroundElement);
}

export { CosWeatherBackgroundElement, TAG };
