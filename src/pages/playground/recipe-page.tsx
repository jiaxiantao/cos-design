import type { ReactElement } from 'react';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import {
  Charge,
  Confetti,
  Countdown,
  Fireworks,
  NeonText,
  ProgressChest,
  RedPacketRain,
  ScratchCard,
  SlotMachine,
  Turntable,
  WeatherBackground,
  type ConfettiHandle,
  type FireworksHandle,
  type RedPacketRainHandle
} from '@/components';
import { recipes } from '../config/recipes';
import styles from './style/recipes.module.less';

const toComponentPath = (name: string) => `/${name.charAt(0).toLowerCase()}${name.slice(1)}`;

const ScratchCelebrateRecipe = () => {
  const { t } = useTranslation();
  const fireworksRef = useRef<FireworksHandle>(null);
  const prize = t('recipes.items.scratchCelebrate.prize');

  return (
    <div className={styles.stage}>
      <ScratchCard
        width={320}
        height={180}
        prize={prize}
        coverText={t('recipes.items.scratchCelebrate.cover')}
        onReveal={() => {
          fireworksRef.current?.launch(160);
          fireworksRef.current?.launch(280);
          fireworksRef.current?.launch(400);
        }}
      />
      <Fireworks ref={fireworksRef} width={560} height={320} auto={false} hint={t('recipes.hintFireworks')} />
    </div>
  );
};

const CountdownRainRecipe = () => {
  const { t } = useTranslation();
  const rainRef = useRef<RedPacketRainHandle>(null);
  const [targetDate] = useState(() => Date.now() + 8000);
  const [ended, setEnded] = useState(false);

  const handleEnd = useCallback(() => {
    setEnded(true);
    rainRef.current?.start();
  }, []);

  return (
    <div className={styles.stage}>
      <div className={styles.countdownBlock}>
        <Countdown targetDate={targetDate} onEnd={handleEnd} />
        <p className={styles.status}>
          {ended ? t('recipes.items.countdownRain.ended') : t('recipes.items.countdownRain.waiting')}
        </p>
      </div>
      <RedPacketRain
        ref={rainRef}
        width={420}
        height={360}
        auto={false}
        duration={12000}
        hint={t('recipes.items.countdownRain.hint')}
      />
    </div>
  );
};

const TurntableConfettiRecipe = () => {
  const { t } = useTranslation();
  const confettiRef = useRef<ConfettiHandle>(null);

  return (
    <div className={styles.stage}>
      <Turntable
        size={280}
        onSpinEnd={() => {
          confettiRef.current?.burst();
        }}
        buttonText={t('recipes.items.turntableConfetti.button')}
      />
      <Confetti ref={confettiRef} width={480} height={280} auto={false} hint={t('recipes.hintConfetti')} />
    </div>
  );
};

const ChestOpenRecipe = () => {
  const { t } = useTranslation();
  const confettiRef = useRef<ConfettiHandle>(null);
  const [progress, setProgress] = useState(0);

  return (
    <div className={styles.stage}>
      <div className={styles.countdownBlock}>
        <Charge
          value={progress}
          autoCharge
          interval={80}
          step={1}
          onChange={setProgress}
          onComplete={() => confettiRef.current?.burst()}
        />
        <ProgressChest
          progress={progress}
          label={t('recipes.items.chestOpen.charging')}
          openedLabel={t('recipes.items.chestOpen.opened')}
        />
      </div>
      <Confetti ref={confettiRef} width={420} height={260} auto={false} hint={t('recipes.hintConfetti')} />
    </div>
  );
};

const SlotJackpotRecipe = () => {
  const { t } = useTranslation();
  const confettiRef = useRef<ConfettiHandle>(null);

  return (
    <div className={styles.stage}>
      <SlotMachine
        buttonText={t('recipes.items.slotJackpot.button')}
        onSpinEnd={(results) => {
          if (results.length >= 3 && results[0] === results[1] && results[1] === results[2]) {
            confettiRef.current?.burst();
          }
        }}
      />
      <Confetti ref={confettiRef} width={420} height={260} auto={false} hint={t('recipes.hintConfetti')} />
    </div>
  );
};

const FillHeroRecipe = () => {
  return (
    <div className={styles.fillHero}>
      <WeatherBackground fill weather="partlyCloudy" live={false} />
      <div className={styles.fillHeroContent}>
        <NeonText text="COS DESIGN" />
      </div>
    </div>
  );
};

const recipeViews: Record<string, () => ReactElement> = {
  'scratch-celebrate': ScratchCelebrateRecipe,
  'countdown-rain': CountdownRainRecipe,
  'turntable-confetti': TurntableConfettiRecipe,
  'chest-open': ChestOpenRecipe,
  'slot-jackpot': SlotJackpotRecipe,
  'fill-hero': FillHeroRecipe
};

const RecipePage = () => {
  const { recipeId } = useParams<{ recipeId: string }>();
  const { t } = useTranslation();
  const recipe = recipes.find((item) => item.id === recipeId);
  const View = recipeId ? recipeViews[recipeId] : undefined;

  if (!recipe || !View) {
    return (
      <div className={styles.page}>
        <p>{t('recipes.notFound')}</p>
        <Link to="/recipes">{t('recipes.back')}</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Link to="/recipes" className={styles.back}>
        {t('recipes.back')}
      </Link>
      <header className={styles.header}>
        <h1>{t(recipe.titleKey)}</h1>
        <p>{t(recipe.descriptionKey)}</p>
        <div className={styles.tags}>
          {recipe.components.map((name) => (
            <Link key={name} to={toComponentPath(name)} className={styles.tag}>
              {name}
            </Link>
          ))}
        </div>
      </header>
      <View />
      <section className={styles.note}>
        <h2>{t('recipes.howTitle')}</h2>
        <p>{t(recipe.titleKey.replace('.title', '.how'))}</p>
      </section>
    </div>
  );
};

export default RecipePage;
