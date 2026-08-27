import { CampaignHero } from './components/campaign-hero';
import { CampaignFlow } from './components/campaign-flow';
import { ScratchCelebrate } from './components/scratch-celebrate';
import { ServerTurntable } from './components/server-turntable';

export default function HomePage() {
  return (
    <main>
      <CampaignHero />
      <CampaignFlow />
      <section className="panel more" id="more-patterns">
        <p className="eyebrow">More patterns</p>
        <h2>Alternate lottery shapes</h2>
        <p>Keep these as optional modules — the primary fork path is the check-in flow above.</p>
      </section>
      <ScratchCelebrate />
      <ServerTurntable />
    </main>
  );
}
