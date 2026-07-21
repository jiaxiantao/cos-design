import { WeatherBackground, type WeatherType } from '@/components';
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

const WeatherBackgroundDemo = () => {
  const [weather, setWeather] = useState<WeatherType>('sunny');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
        {WEATHER_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setWeather(option.value)}
            style={{
              padding: '6px 14px',
              borderRadius: 999,
              border: '1px solid rgba(255, 255, 255, 0.12)',
              background: weather === option.value ? 'rgba(139, 92, 246, 0.35)' : 'rgba(255, 255, 255, 0.05)',
              color: weather === option.value ? '#e8eaef' : '#8b92a8',
              fontSize: 13,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
      <WeatherBackground weather={weather} width={720} height={400} />
    </div>
  );
};

export default WeatherBackgroundDemo;
