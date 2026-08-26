'use client';

import dynamic from 'next/dynamic';
import { NeonText } from '@cos-design/neon-text';

const WeatherBackground = dynamic(() => import('@cos-design/weather-background').then((m) => m.WeatherBackground), {
  ssr: false
});

export function CampaignHero() {
  return (
    <section className="hero">
      <WeatherBackground fill weather="partlyCloudy" live={false} />
      <div className="heroContent">
        <NeonText text="COS DESIGN" />
        <p>fill background · Next.js App Router · client-only canvas</p>
      </div>
    </section>
  );
}
