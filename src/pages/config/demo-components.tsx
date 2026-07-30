import * as C from '@/components';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ChargeDemo from '../demos/charge-demo';
import FireworksDemo from '../demos/fireworks-demo';
import FlipCounterDemo from '../demos/flip-counter-demo';
import WeatherBackgroundDemo from '../demos/weather-background-demo';

/** 演示内的行内文案，按 i18n key 渲染 */
const DemoCopy = ({ i18nKey }: { i18nKey: string }) => {
  const { t } = useTranslation();
  return <>{t(i18nKey)}</>;
};

const CountdownDemo = () => {
  const { t } = useTranslation();
  const [target] = useState(() => Date.now() + 3 * 24 * 60 * 60 * 1000);
  return (
    <C.Countdown
      targetDate={target}
      color="#f472b6"
      labels={t('demos.componentCopy.countdownLabels', { returnObjects: true }) as C.CountdownProps['labels']}
      invalidText={t('demos.componentCopy.countdownInvalid')}
      endedText={t('demos.componentCopy.countdownEnded')}
    />
  );
};

const ProgressChestDemo = () => {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 2));
    }, 120);
    return () => clearInterval(timer);
  }, []);
  return (
    <C.ProgressChest
      progress={progress}
      label={t('demos.progressChestLabel')}
      openedLabel={t('demos.progressChestOpened')}
    />
  );
};

const TimelinePulseDemo = () => {
  const { t } = useTranslation();
  const steps = t('demos.timelineSteps', { returnObjects: true }) as string[];
  return <C.TimelinePulse steps={steps} current={2} color="#38bdf8" />;
};

const HolographicCardDemo = () => {
  const { t } = useTranslation();
  return <C.HolographicCard title="COS VIP" subtitle={t('demos.holographicSubtitle')} />;
};

type LocalizedDemoName =
  | 'BurnAway'
  | 'Confetti'
  | 'CursorTrail'
  | 'DiceRoll'
  | 'GameOfLife'
  | 'NetworkGraph'
  | 'ParticleNetwork'
  | 'RedPacketRain'
  | 'RippleWater'
  | 'SandFall'
  | 'ScratchCard'
  | 'SlotMachine'
  | 'SmokeFog'
  | 'SpringMass'
  | 'Turntable'
  | 'Typewriter'
  | 'WaveButton';

/** 给组件库传入当前语言的展示文案，组件本身不依赖站点 i18n 实例。 */
const LocalizedComponentDemo = ({
  name,
  width,
  height
}: {
  name: LocalizedDemoName;
  width?: number;
  height?: number;
}) => {
  const { t } = useTranslation();
  const key = 'demos.componentCopy';

  switch (name) {
    case 'BurnAway':
      return <C.BurnAway text="COS DESIGN" fontSize={56} completedText={t(`${key}.burnAwayCompleted`)} />;
    case 'Confetti':
      return <C.Confetti auto={false} hint={t(`${key}.confettiHint`)} />;
    case 'CursorTrail':
      return <C.CursorTrail hint={t(`${key}.cursorTrailHint`)} />;
    case 'DiceRoll':
      return (
        <C.DiceRoll
          rollText={t(`${key}.diceRoll`)}
          rollingText={t(`${key}.diceRolling`)}
          resultPrefix={t(`${key}.diceResult`)}
        />
      );
    case 'GameOfLife':
      return (
        <C.GameOfLife
          width={width ?? 560}
          height={height ?? 420}
          labels={t(`${key}.gameOfLifeLabels`, { returnObjects: true }) as C.GameOfLifeProps['labels']}
        />
      );
    case 'NetworkGraph':
      return <C.NetworkGraph width={width ?? 640} height={height ?? 420} hint={t(`${key}.networkGraphHint`)} />;
    case 'ParticleNetwork':
      return <C.ParticleNetwork width={width} height={height} hint={t(`${key}.particleNetworkHint`)} />;
    case 'RedPacketRain':
      return (
        <C.RedPacketRain
          grabbedLabel={t(`${key}.redPacketGrabbed`)}
          endedText={t(`${key}.redPacketEnded`)}
          hint={t(`${key}.redPacketHint`)}
        />
      );
    case 'RippleWater':
      return <C.RippleWater width={width} height={height} hint={t(`${key}.rippleHint`)} />;
    case 'SandFall':
      return (
        <C.SandFall
          width={width ?? 480}
          height={height ?? 400}
          hint={t(`${key}.sandHint`)}
          clearText={t(`${key}.sandClear`)}
        />
      );
    case 'ScratchCard':
      return <C.ScratchCard prize={t(`${key}.scratchPrize`)} coverText={t(`${key}.scratchCover`)} />;
    case 'SlotMachine':
      return (
        <C.SlotMachine
          startText={t(`${key}.slotStart`)}
          spinningText={t(`${key}.slotSpinning`)}
          jackpotText={t(`${key}.slotJackpot`)}
          resultPrefix={t(`${key}.slotResult`)}
        />
      );
    case 'SmokeFog':
      return <C.SmokeFog width={width} height={height} ariaLabel={t(`${key}.smokeAria`)} />;
    case 'SpringMass':
      return <C.SpringMass width={width ?? 560} height={height ?? 380} hint={t(`${key}.springMassHint`)} />;
    case 'Turntable': {
      const prizes = (t(`${key}.turntablePrizes`, { returnObjects: true }) as string[]).map((label) => ({ label }));
      return (
        <C.Turntable
          prizes={prizes}
          buttonText={t(`${key}.turntableStart`)}
          spinningText={t(`${key}.turntableSpinning`)}
          resultPrefix={t(`${key}.turntableResult`)}
        />
      );
    }
    case 'Typewriter':
      return <C.Typewriter texts={t(`${key}.typewriterTexts`, { returnObjects: true }) as string[]} />;
    case 'WaveButton':
      return <C.WaveButton text={t(`${key}.waveButton`)} />;
  }
};

export const demoComponents: Record<string, React.ReactNode> = {
  Aurora: <C.Aurora />,
  AudioVisualizer: <C.AudioVisualizer width={480} height={200} />,
  BarcodeScan: (
    <C.BarcodeScan>
      <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: 4 }}>SCAN ME</span>
    </C.BarcodeScan>
  ),
  BlurText: <C.BlurText text="BLUR INTO FOCUS" animateBy="words" fontSize={48} />,
  BurnAway: <LocalizedComponentDemo name="BurnAway" />,
  CanvasClock: <C.CanvasClock />,
  Charge: <ChargeDemo />,
  CircularText: <C.CircularText text="COS DESIGN • REACT BITS • " spinDuration={18} />,
  ClickSpark: (
    <C.ClickSpark>
      <p style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
        <DemoCopy i18nKey="demos.clickSpark" />
      </p>
    </C.ClickSpark>
  ),
  Confetti: <LocalizedComponentDemo name="Confetti" />,
  Countdown: <CountdownDemo />,
  CountUp: <C.CountUp value={128560} duration={1800} prefix="$" />,
  CurvedLoop: <C.CurvedLoop text="COS DESIGN ✦ CURVED LOOP ✦ " speed={2} />,
  CyberGrid: <C.CyberGrid />,
  CursorTrail: <LocalizedComponentDemo name="CursorTrail" />,
  DiceRoll: <LocalizedComponentDemo name="DiceRoll" />,
  DoublePendulum: <C.DoublePendulum width={420} height={420} />,
  DnaHelix: <C.DnaHelix width={280} height={420} />,
  ElectricArc: <C.ElectricArc width={420} height={200} />,
  Fireworks: <FireworksDemo />,
  FlipCounter: <FlipCounterDemo />,
  FuzzyText: <C.FuzzyText text="FUZZY" fontSize={72} />,
  GlitchText: <C.GlitchText text="COS DESIGN" fontSize={56} />,
  GradientFlow: <C.GradientFlow text="GRADIENT FLOW" fontSize={48} />,
  GameOfLife: <LocalizedComponentDemo name="GameOfLife" />,
  GravityBalls: <C.GravityBalls width={600} height={380} />,
  HolographicCard: <HolographicCardDemo />,
  LiquidGlass: (
    <C.LiquidGlass>
      <h3 style={{ margin: 0 }}>
        <DemoCopy i18nKey="demos.liquidGlassTitle" />
      </h3>
      <p style={{ margin: '8px 0 0', opacity: 0.8 }}>
        <DemoCopy i18nKey="demos.liquidGlassDesc" />
      </p>
    </C.LiquidGlass>
  ),
  LiquidProgress: <C.LiquidProgress value={68} size={160} />,
  LorenzAttractor: <C.LorenzAttractor width={480} height={400} />,
  MagneticButton: (
    <C.MagneticButton>
      <DemoCopy i18nKey="demos.magneticButton" />
    </C.MagneticButton>
  ),
  MatrixRain: <C.MatrixRain showOverlay={false} />,
  MetaballPool: <C.MetaballPool width={560} height={360} />,
  MazeGenerator: <C.MazeGenerator width={400} height={400} />,
  MeteorRain: <C.MeteorRain />,
  NetworkGraph: <LocalizedComponentDemo name="NetworkGraph" />,
  NeonText: <C.NeonText />,
  NewtonCradle: <C.NewtonCradle />,
  OrbitalChart: (
    <C.OrbitalChart
      size={260}
      data={[
        { label: 'React', value: 40, color: '#38bdf8' },
        { label: 'Canvas', value: 30, color: '#a78bfa' },
        { label: 'CSS', value: 30, color: '#f472b6' }
      ]}
    />
  ),
  ParticleNetwork: <LocalizedComponentDemo name="ParticleNetwork" />,
  PlasmaBall: <C.PlasmaBall width={360} height={360} />,
  ProgressChest: <ProgressChestDemo />,
  RadarScan: <C.RadarScan size={280} />,
  RedPacketRain: <LocalizedComponentDemo name="RedPacketRain" />,
  ReturnCity: <C.ReturnCity />,
  RopeChain: <C.RopeChain width={420} height={420} />,
  RippleWater: <LocalizedComponentDemo name="RippleWater" />,
  RotatingText: <C.RotatingText texts={['React', 'Motion', 'Design', 'COS']} fontSize={52} />,
  ScrambleText: <C.ScrambleText text="ACCESS GRANTED" />,
  ScratchCard: <LocalizedComponentDemo name="ScratchCard" />,
  SlotMachine: <LocalizedComponentDemo name="SlotMachine" />,
  SmokeFog: <LocalizedComponentDemo name="SmokeFog" />,
  BubbleField: <C.BubbleField width={800} height={500} />,
  SolarSystem: <C.SolarSystem width={420} height={420} speed={1.2} />,
  Snowfall: <C.Snowfall mode="sakura" />,
  ShinyText: <C.ShinyText text="SHINY TEXT" fontSize={56} />,
  Speedometer: <C.Speedometer value={86} max={120} label="km/h" />,
  SandFall: <LocalizedComponentDemo name="SandFall" />,
  SplitReveal: <C.SplitReveal text="WELCOME" color="#38bdf8" />,
  SplitText: <C.SplitText text="SPLIT TEXT" animation="fadeUp" fontSize={56} />,
  SpringMass: <LocalizedComponentDemo name="SpringMass" />,
  Spotlight: (
    <C.Spotlight>
      <p style={{ padding: 40, fontSize: 18 }}>
        <DemoCopy i18nKey="demos.spotlight" />
      </p>
    </C.Spotlight>
  ),
  Starfield: <C.Starfield />,
  TimelinePulse: <TimelinePulseDemo />,
  Turntable: <LocalizedComponentDemo name="Turntable" />,
  TextMorph: <C.TextMorph texts={['COS DESIGN', 'FLUID WORDS', 'PIXEL TO MOTION']} fontSize={56} />,
  TrueFocus: <C.TrueFocus sentence="True Focus Mode" fontSize={42} />,
  Typewriter: <LocalizedComponentDemo name="Typewriter" />,
  WaveButton: <LocalizedComponentDemo name="WaveButton" />,
  WaveText: <C.WaveText text="WAVE TEXT" fontSize={48} />,
  WeatherBackground: <WeatherBackgroundDemo />
};
