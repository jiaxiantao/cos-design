import { WeatherBackground, useLiveWeather, type WeatherType } from '@/components';
import { useState } from 'react';

const WEATHER_OPTIONS: { value: WeatherType; label: string }[] = [
  { value: 'sunny', label: '☀️ 大晴天' },
  { value: 'partlyCloudy', label: '⛅ 多云' },
  { value: 'overcast', label: '☁️ 阴天' },
  { value: 'lightRain', label: '🌦️ 小雨' },
  { value: 'moderateRain', label: '🌧️ 中雨' },
  { value: 'heavyRain', label: '⛈️ 大雨' },
  { value: 'thunderstorm', label: '🌩️ 雷阵雨' },
  { value: 'fog', label: '🌫️ 雾' },
  { value: 'lightSnow', label: '❄️ 小雪' },
  { value: 'moderateSnow', label: '🌨️ 中雪' },
  { value: 'heavySnow', label: '☃️ 大雪' },
  { value: 'sleet', label: '🌧️❄️ 雨夹雪' },
  { value: 'hail', label: '🧊 冰雹' },
  { value: 'smog', label: '😷 霾' },
  { value: 'gale', label: '💨 大风' }
];

const WEATHER_LABELS = Object.fromEntries(WEATHER_OPTIONS.map((o) => [o.value, o.label])) as Record<
  WeatherType,
  string
>;

const CITY_OPTIONS: { label: string; coords: { latitude: number; longitude: number } | null }[] = [
  { label: '📍 当前位置', coords: null },
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

const WeatherBackgroundDemo = () => {
  const [weather, setWeather] = useState<WeatherType>('sunny');
  const [nightEnabled, setNightEnabled] = useState(false);
  const [liveEnabled, setLiveEnabled] = useState(false);
  const [cityIndex, setCityIndex] = useState(0);
  const city = CITY_OPTIONS[cityIndex];
  const liveState = useLiveWeather(liveEnabled, city.coords ?? undefined);

  const activeWeather = liveEnabled && liveState.weather ? liveState.weather : weather;
  const activeNight = liveEnabled && liveState.current ? !liveState.current.isDay : nightEnabled;
  const liveLoading = liveEnabled && (liveState.status === 'locating' || liveState.status === 'fetching');

  const liveStatusText = (() => {
    if (!liveEnabled) return null;
    switch (liveState.status) {
      case 'locating':
        return '正在获取定位…（需授权）';
      case 'fetching':
        return '正在请求 Open-Meteo 实况…';
      case 'success': {
        const c = liveState.current;
        return `${city.coords ? city.label : '当前位置'}实况：${WEATHER_LABELS[liveState.weather!]} · ${c?.isDay ? '☀️ 白天' : '🌙 夜晚'}（WMO ${c?.weatherCode} · 风速 ${c?.windSpeed} km/h）`;
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
        <button type="button" onClick={() => setLiveEnabled((v) => !v)} style={buttonStyle(liveEnabled)}>
          📍 实时天气（Open-Meteo）
        </button>
        <button
          type="button"
          onClick={() => setNightEnabled((v) => !v)}
          disabled={liveEnabled}
          style={{ ...buttonStyle(!liveEnabled && nightEnabled), opacity: liveEnabled ? 0.4 : 1 }}
          title={liveEnabled ? '实时模式下日夜由当地实况决定' : undefined}
        >
          🌙 夜间模式
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
      {liveEnabled && (
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
      )}
      {liveStatusText && <p style={{ margin: 0, color: '#8b92a8', fontSize: 13 }}>{liveStatusText}</p>}
      <WeatherBackground weather={activeWeather} night={activeNight} loading={liveLoading} width={720} height={400} />
    </div>
  );
};

export default WeatherBackgroundDemo;
