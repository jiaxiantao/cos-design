import {
  optionCallbackDispatcher,
  readBooleanAttr,
  readJsonAttr,
  readNumberAttr,
  readPropertyOverride,
  readStringAttr,
} from '@cos-design/shared';
import {
  createWeatherBackground,
  type WeatherBackgroundController,
  type WeatherBackgroundOptions,
} from '../core';
import '../style/index.css';

const TAG = 'cos-weather-background';

function parseOptions(el: HTMLElement): WeatherBackgroundOptions {
  const options = {} as WeatherBackgroundOptions;
  readStringAttr(options, el, 'time', 'time');
  readStringAttr(options, el, 'ariaLabel', 'aria-label');
  readStringAttr(options, el, 'loadingText', 'loading-text');
  readNumberAttr(options, el, 'width', 'width');
  readNumberAttr(options, el, 'height', 'height');
  readNumberAttr(options, el, 'latitude', 'latitude');
  readNumberAttr(options, el, 'longitude', 'longitude');
  readNumberAttr(options, el, 'windLevel', 'wind-level');
  readNumberAttr(options, el, 'rainLevel', 'rain-level');
  readNumberAttr(options, el, 'snowLevel', 'snow-level');
  readNumberAttr(options, el, 'hailLevel', 'hail-level');
  readNumberAttr(options, el, 'fogLevel', 'fog-level');
  readNumberAttr(options, el, 'smogLevel', 'smog-level');
  readBooleanAttr(options, el, 'fill', 'fill', 'presence');
  readBooleanAttr(options, el, 'live', 'live', 'presence');
  readBooleanAttr(options, el, 'loading', 'loading', 'presence');
  readJsonAttr(options, el, 'weather', 'weather');
  readPropertyOverride(options, el, 'weather', '_weather');
  options.onLiveWeather = optionCallbackDispatcher(el, 'live-weather');
  return options;
}

class CosWeatherBackgroundElement extends HTMLElement {
  private ctrl: WeatherBackgroundController | null = null;

  _weather?: WeatherBackgroundOptions['weather'];
  get weather(): WeatherBackgroundOptions['weather'] | undefined {
    return this._weather;
  }
  set weather(value: WeatherBackgroundOptions['weather']) {
    this._weather = value;
    this.ctrl?.update(parseOptions(this));
  }

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
      'loading-text',
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
