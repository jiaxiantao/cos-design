import {
  WeatherBackground,
  useLiveWeather,
  kmhToWindLevel,
  clampFogLevel,
  clampHailLevel,
  clampPrecipLevel,
  clampSmogLevel,
  formatLocalHm,
  normalizeWeatherType,
  precipBand,
  supportsFogLevel,
  supportsHailLevel,
  supportsRainLevel,
  supportsSmogLevel,
  supportsSnowLevel,
  type WeatherType
} from '@/components';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBackgroundDemoCopy } from '../i18n/hooks';
import BackgroundDemoContent from '../playground/background-demo-content';
import FillStage from '../playground/fill-stage';
import styles from './style/weather-background-demo.module.less';

const WEATHER_OPTIONS: WeatherType[] = [
  'sunny',
  'partlyCloudy',
  'overcast',
  'rain',
  'thunderstorm',
  'snow',
  'sleet',
  'hail',
  'fog',
  'smog'
];

const CITY_OPTIONS: { id: string; coords: { latitude: number; longitude: number } }[] = [
  { id: 'beijing', coords: { latitude: 39.9042, longitude: 116.4074 } },
  { id: 'shanghai', coords: { latitude: 31.2304, longitude: 121.4737 } },
  { id: 'guangzhou', coords: { latitude: 23.1291, longitude: 113.2644 } },
  { id: 'hangzhou', coords: { latitude: 30.2741, longitude: 120.1551 } },
  { id: 'chengdu', coords: { latitude: 30.5728, longitude: 104.0668 } },
  { id: 'harbin', coords: { latitude: 45.8038, longitude: 126.535 } },
  { id: 'lhasa', coords: { latitude: 29.6525, longitude: 91.1721 } },
  { id: 'tokyo', coords: { latitude: 35.6762, longitude: 139.6503 } },
  { id: 'london', coords: { latitude: 51.5074, longitude: -0.1278 } },
  { id: 'newYork', coords: { latitude: 40.7128, longitude: -74.006 } },
  { id: 'sydney', coords: { latitude: -33.8688, longitude: 151.2093 } }
];

const pad2 = (n: number) => String(n).padStart(2, '0');

const minutesToTime = (minutes: number) => {
  const m = ((Math.round(minutes) % 1440) + 1440) % 1440;
  return `${pad2(Math.floor(m / 60))}:${pad2(m % 60)}`;
};

const timeToMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return 14 * 60;
  return Math.min(23, Math.max(0, h)) * 60 + Math.min(59, Math.max(0, m));
};

const buttonStyle = (active: boolean): React.CSSProperties => ({
  padding: '6px 14px',
  borderRadius: 999,
  border: '1px solid rgba(255, 255, 255, 0.12)',
  background: active ? 'rgba(139, 92, 246, 0.35)' : 'rgba(255, 255, 255, 0.05)',
  color: active ? '#e8eaef' : '#8b92a8',
  fontSize: 13,
  cursor: 'pointer',
  transition: 'all 0.2s'
});

const sliderRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  flexWrap: 'wrap',
  width: '100%',
  maxWidth: 720,
  padding: '8px 12px',
  borderRadius: 12,
  background: 'rgba(255, 255, 255, 0.04)',
  border: '1px solid rgba(255, 255, 255, 0.08)'
};

const sliderLabelStyle: React.CSSProperties = {
  minWidth: 72,
  color: '#aeb6c8',
  fontSize: 13,
  flexShrink: 0
};

const sliderValueStyle: React.CSSProperties = {
  minWidth: 108,
  color: '#e8eaef',
  fontSize: 13,
  textAlign: 'right',
  flexShrink: 0
};

const rangeStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 160,
  accentColor: '#8b5cf6',
  cursor: 'pointer'
};

const WeatherBackgroundDemo = () => {
  const { t } = useTranslation();
  const [weather, setWeather] = useState<WeatherType>('partlyCloudy');
  const [sceneTime, setSceneTime] = useState('14:00');
  const [windLevel, setWindLevel] = useState(3);
  const [rainLevel, setRainLevel] = useState(5);
  const [snowLevel, setSnowLevel] = useState(5);
  const [hailLevel, setHailLevel] = useState(2);
  const [fogLevel, setFogLevel] = useState(2);
  const [smogLevel, setSmogLevel] = useState(2);
  const [liveEnabled, setLiveEnabled] = useState(false);
  /** 默认杭州：仅用于昼夜判定 / 实况查询，不会自动开启实时天气 */
  const [cityIndex, setCityIndex] = useState(3);
  /** 实况时钟刷新计数，驱动当地时刻滑块走动 */
  const [liveClockTick, setLiveClockTick] = useState(0);
  const city = CITY_OPTIONS[cityIndex];
  const cityLabel = t(`demos.weather.cities.${city.id}`);
  const backgroundCopy = useBackgroundDemoCopy('WeatherBackground');
  const liveState = useLiveWeather(liveEnabled, liveEnabled ? city.coords : undefined);

  const activeWeather = normalizeWeatherType(liveEnabled && liveState.weather ? liveState.weather : weather);
  const liveLoading = liveEnabled && (liveState.status === 'locating' || liveState.status === 'fetching');

  const liveClockHm = liveEnabled ? formatLocalHm(liveState.current?.timezone, liveState.current?.localTime) : null;
  void liveClockTick;

  const liveWindLevel = liveEnabled && liveState.current ? kmhToWindLevel(liveState.current.windSpeed) : null;
  const displayTime = liveClockHm ?? sceneTime;
  const displayWindLevel = liveWindLevel ?? windLevel;
  const displayRainLevel = liveEnabled && liveState.rainLevel != null ? liveState.rainLevel : rainLevel;
  const displaySnowLevel = liveEnabled && liveState.snowLevel != null ? liveState.snowLevel : snowLevel;
  const displayHailLevel = liveEnabled && liveState.hailLevel != null ? liveState.hailLevel : hailLevel;
  const displayFogLevel = liveEnabled && liveState.fogLevel != null ? liveState.fogLevel : fogLevel;
  const displaySmogLevel = liveEnabled && liveState.smogLevel != null ? liveState.smogLevel : smogLevel;
  const timeMinutes = timeToMinutes(displayTime);
  const showRainSlider = supportsRainLevel(activeWeather);
  const showSnowSlider = supportsSnowLevel(activeWeather);
  const showHailSlider = supportsHailLevel(activeWeather);
  const showFogSlider = supportsFogLevel(activeWeather);
  const showSmogSlider = supportsSmogLevel(activeWeather);

  const weatherLabel = (type: WeatherType) => t(`demos.weather.options.${type}`, { defaultValue: type });

  /** 档位文案统一为 `档位 · 名称`，名称按当前语言取词表 */
  const levelLabel = (kind: 'rain' | 'snow' | 'hail' | 'fog' | 'smog', level: number) => {
    const names = t(`demos.weather.levels.${kind}`, { returnObjects: true }) as string[];
    const value =
      kind === 'rain' || kind === 'snow'
        ? clampPrecipLevel(level)
        : kind === 'hail'
          ? clampHailLevel(level)
          : kind === 'fog'
            ? clampFogLevel(level)
            : clampSmogLevel(level);
    const index = kind === 'rain' || kind === 'snow' ? precipBand(level) - 1 : value - 1;
    return t('demos.weather.levels.format', { level: value, label: names[index] });
  };

  const windText = (level: number) => {
    const names = t('demos.weather.windLevels', { returnObjects: true }) as string[];
    return t('demos.weather.windValue', { level, name: names[level] });
  };

  useEffect(() => {
    if (!liveEnabled) return;
    const id = window.setInterval(() => setLiveClockTick((n) => n + 1), 15_000);
    return () => window.clearInterval(id);
  }, [liveEnabled]);

  const liveStatusText = (() => {
    if (!liveEnabled) return null;
    switch (liveState.status) {
      case 'locating':
        return t('demos.weather.statusLocating');
      case 'fetching':
        return t('demos.weather.statusFetching', { city: cityLabel });
      case 'success': {
        const c = liveState.current;
        const hm = liveClockHm ?? c?.localTime;
        const extra =
          liveState.rainLevel != null
            ? ` · ${levelLabel('rain', liveState.rainLevel)}`
            : liveState.snowLevel != null
              ? ` · ${levelLabel('snow', liveState.snowLevel)}`
              : liveState.hailLevel != null
                ? ` · ${levelLabel('hail', liveState.hailLevel)}`
                : liveState.fogLevel != null
                  ? ` · ${levelLabel('fog', liveState.fogLevel)}`
                  : liveState.smogLevel != null
                    ? ` · ${levelLabel('smog', liveState.smogLevel)}`
                    : '';
        return t('demos.weather.statusSuccess', {
          city: cityLabel,
          weather: weatherLabel(liveState.weather!),
          time: hm
            ? t('demos.weather.statusTime', { time: hm })
            : c?.isDay
              ? t('demos.weather.statusDay')
              : t('demos.weather.statusNight'),
          wind: kmhToWindLevel(c?.windSpeed ?? 0),
          speed: c?.windSpeed,
          extra,
          code: c?.weatherCode
        });
      }
      case 'error':
        return t('demos.weather.statusError', { error: liveState.error });
      default:
        return null;
    }
  })();

  return (
    <div className={styles.root}>
      <div className={styles.stage}>
        <FillStage
          overlay={<BackgroundDemoContent headline={backgroundCopy.headline} subtitle={backgroundCopy.subtitle} />}
        >
          <WeatherBackground
            weather={activeWeather}
            time={sceneTime}
            windLevel={windLevel}
            rainLevel={rainLevel}
            snowLevel={snowLevel}
            hailLevel={hailLevel}
            fogLevel={fogLevel}
            smogLevel={smogLevel}
            latitude={city.coords.latitude}
            longitude={city.coords.longitude}
            live={liveEnabled}
            loading={liveLoading}
            ariaLabel={t('demos.weather.canvasAria', {
              weather: weatherLabel(activeWeather),
              wind: displayWindLevel
            })}
            loadingText={t('demos.weather.loading')}
          />
        </FillStage>
      </div>

      {liveStatusText && <p className={styles.meta}>{liveStatusText}</p>}
      {!liveEnabled && (
        <p className={styles.meta}>
          {t('demos.weather.summary', {
            city: cityLabel,
            time: sceneTime,
            wind: windText(windLevel),
            extra: [
              showRainSlider ? ` · ${levelLabel('rain', rainLevel)}` : '',
              showSnowSlider ? ` · ${levelLabel('snow', snowLevel)}` : '',
              showHailSlider ? ` · ${levelLabel('hail', hailLevel)}` : '',
              showFogSlider ? ` · ${levelLabel('fog', fogLevel)}` : '',
              showSmogSlider ? ` · ${levelLabel('smog', smogLevel)}` : ''
            ].join('')
          })}
        </p>
      )}

      <div className={styles.toolbar}>
        <button
          type="button"
          onClick={() => setLiveEnabled((v) => !v)}
          style={buttonStyle(liveEnabled)}
          title={
            liveEnabled
              ? t('demos.weather.liveToggleOffTitle')
              : t('demos.weather.liveToggleOnTitle', { city: cityLabel })
          }
        >
          {t('demos.weather.liveToggle')}
        </button>
        {WEATHER_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => {
              setLiveEnabled(false);
              setWeather(option);
            }}
            style={buttonStyle(!liveEnabled && weather === option)}
          >
            {weatherLabel(option)}
          </button>
        ))}
      </div>

      <div
        className={styles.sliders}
        style={{
          opacity: liveEnabled ? 0.85 : 1,
          pointerEvents: liveEnabled ? 'none' : 'auto'
        }}
      >
        <label style={sliderRowStyle}>
          <span style={sliderLabelStyle}>{t('demos.weather.timeLabel')}</span>
          <input
            type="range"
            min={0}
            max={1439}
            step={liveEnabled ? 1 : 15}
            value={timeMinutes}
            onChange={(e) => setSceneTime(minutesToTime(Number(e.target.value)))}
            style={rangeStyle}
            aria-label={t('demos.weather.timeAria')}
            disabled={liveEnabled}
          />
          <span style={sliderValueStyle}>{displayTime}</span>
        </label>
        <label style={sliderRowStyle}>
          <span style={sliderLabelStyle}>{t('demos.weather.windLabel')}</span>
          <input
            type="range"
            min={0}
            max={12}
            step={1}
            value={displayWindLevel}
            onChange={(e) => setWindLevel(Number(e.target.value))}
            style={rangeStyle}
            aria-label={t('demos.weather.windAria')}
            disabled={liveEnabled}
          />
          <span style={sliderValueStyle}>{windText(displayWindLevel)}</span>
        </label>
        {showRainSlider && (
          <label style={sliderRowStyle}>
            <span style={sliderLabelStyle}>{t('demos.weather.rainLabel')}</span>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={displayRainLevel}
              onChange={(e) => setRainLevel(Number(e.target.value))}
              style={rangeStyle}
              aria-label={t('demos.weather.rainAria')}
              disabled={liveEnabled}
            />
            <span style={sliderValueStyle}>{levelLabel('rain', displayRainLevel)}</span>
          </label>
        )}
        {showSnowSlider && (
          <label style={sliderRowStyle}>
            <span style={sliderLabelStyle}>{t('demos.weather.snowLabel')}</span>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={displaySnowLevel}
              onChange={(e) => setSnowLevel(Number(e.target.value))}
              style={rangeStyle}
              aria-label={t('demos.weather.snowAria')}
              disabled={liveEnabled}
            />
            <span style={sliderValueStyle}>{levelLabel('snow', displaySnowLevel)}</span>
          </label>
        )}
        {showHailSlider && (
          <label style={sliderRowStyle}>
            <span style={sliderLabelStyle}>{t('demos.weather.hailLabel')}</span>
            <input
              type="range"
              min={1}
              max={3}
              step={1}
              value={displayHailLevel}
              onChange={(e) => setHailLevel(Number(e.target.value))}
              style={rangeStyle}
              aria-label={t('demos.weather.hailAria')}
              disabled={liveEnabled}
            />
            <span style={sliderValueStyle}>{levelLabel('hail', displayHailLevel)}</span>
          </label>
        )}
        {showFogSlider && (
          <label style={sliderRowStyle}>
            <span style={sliderLabelStyle}>{t('demos.weather.fogLabel')}</span>
            <input
              type="range"
              min={1}
              max={3}
              step={1}
              value={displayFogLevel}
              onChange={(e) => setFogLevel(Number(e.target.value))}
              style={rangeStyle}
              aria-label={t('demos.weather.fogAria')}
              disabled={liveEnabled}
            />
            <span style={sliderValueStyle}>{levelLabel('fog', displayFogLevel)}</span>
          </label>
        )}
        {showSmogSlider && (
          <label style={sliderRowStyle}>
            <span style={sliderLabelStyle}>{t('demos.weather.smogLabel')}</span>
            <input
              type="range"
              min={1}
              max={3}
              step={1}
              value={displaySmogLevel}
              onChange={(e) => setSmogLevel(Number(e.target.value))}
              style={rangeStyle}
              aria-label={t('demos.weather.smogAria')}
              disabled={liveEnabled}
            />
            <span style={sliderValueStyle}>{levelLabel('smog', displaySmogLevel)}</span>
          </label>
        )}
        {liveEnabled && <p className={styles.hint}>{t('demos.weather.liveHint', { city: cityLabel })}</p>}
      </div>

      <div className={styles.toolbar}>
        {CITY_OPTIONS.map((option, index) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setCityIndex(index)}
            style={buttonStyle(cityIndex === index)}
          >
            {t(`demos.weather.cities.${option.id}`)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WeatherBackgroundDemo;
