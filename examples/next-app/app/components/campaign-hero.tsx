'use client';

import dynamic from 'next/dynamic';
import { NeonText } from '@cos-design/neon-text';

const WeatherBackground = dynamic(
  () => import('@cos-design/weather-background').then((m) => m.WeatherBackground),
  {
    ssr: false,
  },
);

/** Full-viewport campaign open — one background + one brand signal. */
export function CampaignHero() {
  return (
    <section className="hero" id="hero">
      <WeatherBackground fill weather="partlyCloudy" live={false} />
      <div className="heroContent">
        <NeonText text="COS DESIGN" />
        <p>Campaign starter · fill hero → check-in → draw</p>
        <a className="heroCta" href="#campaign">
          Start check-in
        </a>
      </div>
    </section>
  );
}
