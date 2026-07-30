import {
  WeatherBackground,
  useLiveWeather,
  kmhToWindLevel,
  formatLocalHm,
  formatFogLevel,
  formatHailLevel,
  formatPrecipLevel,
  formatSmogLevel,
  normalizeWeatherType,
  supportsFogLevel,
  supportsHailLevel,
  supportsRainLevel,
  supportsSmogLevel,
  supportsSnowLevel,
  type WeatherType
} from '@/components';
import { useEffect, useState } from 'react';
import BackgroundDemoContent from '../playground/background-demo-content';
import { BACKGROUND_DEMO_HEADLINES, BACKGROUND_DEMO_SUBTITLES } from '../playground/background-demo-headlines';

const WEATHER_OPTIONS: { value: WeatherType; label: string }[] = [
  { value: 'sunny', label: '☀️ 大晴天' },
  { value: 'partlyCloudy', label: '⛅ 多云' },
  { value: 'overcast', label: '☁️ 阴天' },
  { value: 'rain', label: '🌧️ 雨天' },
  { value: 'thunderstorm', label: '🌩️ 雷阵雨' },
  { value: 'snow', label: '❄️ 雪天' },
  { value: 'sleet', label: '🌧️❄️ 雨夹雪' },
  { value: 'hail', label: '🧊 冰雹' },
  { value: 'fog', label: '🌫️ 雾' },
  { value: 'smog', label: '😷 霾' }
];

const WEATHER_LABELS: Partial<Record<WeatherType, string>> = Object.fromEntries(
  WEATHER_OPTIONS.map((o) => [o.value, o.label])
);

const CITY_OPTIONS: { label: string; coords: { latitude: number; longitude: number } }[] = [
  { label: '北京', coords: { latitude: 39.9042, longitude: 116.4074 } },
  { label: '上海', coords: { latitude: 31.2304, longitude: 121.4737 } },
  { label: '广州', coords: { latitude: 23.1291, longitude: 113.2644 } },
  { label: '杭州', coords: { latitude: 30.2741, longitude: 120.1551 } },
  { label: '成都', coords: { latitude: 30.5728, longitude: 104.0668 } },
  { label: '哈尔滨', coords: { latitude: 45.8038, longitude: 126.535 } },
  { label: '拉萨', coords: { latitude: 29.6525, longitude: 91.1721 } },
  { label: '东京', coords: { latitude: 35.6762, longitude: 139.6503 } },
  { label: '伦敦', coords: { latitude: 51.5074, longitude: -0.1278 } },
  { label: '纽约', coords: { latitude: 40.7128, longitude: -74.006 } },
  { label: '悉尼', coords: { latitude: -33.8688, longitude: 151.2093 } }
];

const WIND_LEVEL_LABELS = [
  '无风',
  '软风',
  '轻风',
  '微风',
  '和风',
  '清劲风',
  '强风',
  '疾风',
  '大风',
  '烈风',
  '狂风',
  '暴风',
  '飓风'
] as const;

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

  useEffect(() => {
    if (!liveEnabled) return;
    const id = window.setInterval(() => setLiveClockTick((n) => n + 1), 15_000);
    return () => window.clearInterval(id);
  }, [liveEnabled]);

  const liveStatusText = (() => {
    if (!liveEnabled) return null;
    switch (liveState.status) {
      case 'locating':
        return '正在获取定位…（需授权）';
      case 'fetching':
        return `正在请求 ${city.label} 实况…`;
      case 'success': {
        const c = liveState.current;
        const hm = liveClockHm ?? c?.localTime;
        const precip =
          liveState.rainLevel != null
            ? ` · ${formatPrecipLevel(liveState.rainLevel, 'rain')}`
            : liveState.snowLevel != null
              ? ` · ${formatPrecipLevel(liveState.snowLevel, 'snow')}`
              : liveState.hailLevel != null
                ? ` · ${formatHailLevel(liveState.hailLevel)}`
                : liveState.fogLevel != null
                  ? ` · ${formatFogLevel(liveState.fogLevel)}`
                  : liveState.smogLevel != null
                    ? ` · ${formatSmogLevel(liveState.smogLevel)}`
                    : '';
        return `${city.label}实况：${WEATHER_LABELS[liveState.weather!] ?? liveState.weather} · ${hm ? `时刻 ${hm}` : c?.isDay ? '☀️ 白天' : '🌙 夜晚'} · ${kmhToWindLevel(c?.windSpeed ?? 0)}级风（${c?.windSpeed} km/h）${precip} · WMO ${c?.weatherCode}`;
      }
      case 'error':
        return `获取失败：${liveState.error}，已回退手动选择`;
      default:
        return null;
    }
  })();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
        <button
          type="button"
          onClick={() => setLiveEnabled((v) => !v)}
          style={buttonStyle(liveEnabled)}
          title={liveEnabled ? '关闭实时天气，恢复手动调节' : `按当前城市（${city.label}）开启实时天气`}
        >
          📍 实时天气（Open-Meteo）
        </button>
        {WEATHER_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              setLiveEnabled(false);
              setWeather(option.value);
            }}
            style={buttonStyle(!liveEnabled && weather === option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          width: '100%',
          maxWidth: 720,
          opacity: liveEnabled ? 0.85 : 1,
          pointerEvents: liveEnabled ? 'none' : 'auto'
        }}
      >
        <label style={sliderRowStyle}>
          <span style={sliderLabelStyle}>🕐 时刻</span>
          <input
            type="range"
            min={0}
            max={1439}
            step={liveEnabled ? 1 : 15}
            value={timeMinutes}
            onChange={(e) => setSceneTime(minutesToTime(Number(e.target.value)))}
            style={rangeStyle}
            aria-label="调节场景时刻"
            disabled={liveEnabled}
          />
          <span style={sliderValueStyle}>{displayTime}</span>
        </label>
        <label style={sliderRowStyle}>
          <span style={sliderLabelStyle}>💨 风速</span>
          <input
            type="range"
            min={0}
            max={12}
            step={1}
            value={displayWindLevel}
            onChange={(e) => setWindLevel(Number(e.target.value))}
            style={rangeStyle}
            aria-label="调节蒲福风级"
            disabled={liveEnabled}
          />
          <span style={sliderValueStyle}>
            {displayWindLevel}级 {WIND_LEVEL_LABELS[displayWindLevel]}
          </span>
        </label>
        {showRainSlider && (
          <label style={sliderRowStyle}>
            <span style={sliderLabelStyle}>🌧️ 雨量</span>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={displayRainLevel}
              onChange={(e) => setRainLevel(Number(e.target.value))}
              style={rangeStyle}
              aria-label="调节雨量"
              disabled={liveEnabled}
            />
            <span style={sliderValueStyle}>{formatPrecipLevel(displayRainLevel, 'rain')}</span>
          </label>
        )}
        {showSnowSlider && (
          <label style={sliderRowStyle}>
            <span style={sliderLabelStyle}>❄️ 雪量</span>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={displaySnowLevel}
              onChange={(e) => setSnowLevel(Number(e.target.value))}
              style={rangeStyle}
              aria-label="调节雪量"
              disabled={liveEnabled}
            />
            <span style={sliderValueStyle}>{formatPrecipLevel(displaySnowLevel, 'snow')}</span>
          </label>
        )}
        {showHailSlider && (
          <label style={sliderRowStyle}>
            <span style={sliderLabelStyle}>🧊 雹强</span>
            <input
              type="range"
              min={1}
              max={3}
              step={1}
              value={displayHailLevel}
              onChange={(e) => setHailLevel(Number(e.target.value))}
              style={rangeStyle}
              aria-label="调节冰雹强度"
              disabled={liveEnabled}
            />
            <span style={sliderValueStyle}>{formatHailLevel(displayHailLevel)}</span>
          </label>
        )}
        {showFogSlider && (
          <label style={sliderRowStyle}>
            <span style={sliderLabelStyle}>🌫️ 雾浓</span>
            <input
              type="range"
              min={1}
              max={3}
              step={1}
              value={displayFogLevel}
              onChange={(e) => setFogLevel(Number(e.target.value))}
              style={rangeStyle}
              aria-label="调节雾浓度"
              disabled={liveEnabled}
            />
            <span style={sliderValueStyle}>{formatFogLevel(displayFogLevel)}</span>
          </label>
        )}
        {showSmogSlider && (
          <label style={sliderRowStyle}>
            <span style={sliderLabelStyle}>😷 霾强</span>
            <input
              type="range"
              min={1}
              max={3}
              step={1}
              value={displaySmogLevel}
              onChange={(e) => setSmogLevel(Number(e.target.value))}
              style={rangeStyle}
              aria-label="调节霾强度"
              disabled={liveEnabled}
            />
            <span style={sliderValueStyle}>{formatSmogLevel(displaySmogLevel)}</span>
          </label>
        )}
        {liveEnabled && (
          <p style={{ margin: 0, color: '#8b92a8', fontSize: 12 }}>
            已开启实时天气：滑块显示 {city.label}{' '}
            当地时刻、风速与强度参数（只读）。关闭「实时天气」或选择上方天气类型后可手动调节。
          </p>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
        {CITY_OPTIONS.map((option, index) => (
          <button
            key={option.label}
            type="button"
            onClick={() => setCityIndex(index)}
            style={buttonStyle(cityIndex === index)}
          >
            {option.label}
          </button>
        ))}
      </div>
      {liveStatusText && <p style={{ margin: 0, color: '#8b92a8', fontSize: 13 }}>{liveStatusText}</p>}
      {!liveEnabled && (
        <p style={{ margin: 0, color: '#8b92a8', fontSize: 13 }}>
          {city.label} · 时刻 {sceneTime} · {windLevel}级{WIND_LEVEL_LABELS[windLevel]}
          {showRainSlider ? ` · ${formatPrecipLevel(rainLevel, 'rain')}` : ''}
          {showSnowSlider ? ` · ${formatPrecipLevel(snowLevel, 'snow')}` : ''}
          {showHailSlider ? ` · ${formatHailLevel(hailLevel)}` : ''}
          {showFogSlider ? ` · ${formatFogLevel(fogLevel)}` : ''}
          {showSmogSlider ? ` · ${formatSmogLevel(smogLevel)}` : ''} · 昼夜按当地日出日落自动判定
        </p>
      )}
      <div style={{ position: 'relative', width: 720, maxWidth: '100%', overflow: 'hidden', borderRadius: 12 }}>
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
          width={720}
          height={400}
        />
        <BackgroundDemoContent
          headline={BACKGROUND_DEMO_HEADLINES.WeatherBackground}
          subtitle={BACKGROUND_DEMO_SUBTITLES.WeatherBackground}
        />
      </div>
    </div>
  );
};

export default WeatherBackgroundDemo;
