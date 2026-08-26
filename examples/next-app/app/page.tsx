import { CampaignHero } from './components/campaign-hero';
import { ScratchCelebrate } from './components/scratch-celebrate';
import { ServerTurntable } from './components/server-turntable';

export default function HomePage() {
  return (
    <main>
      <CampaignHero />
      <ScratchCelebrate />
      <ServerTurntable />
    </main>
  );
}
