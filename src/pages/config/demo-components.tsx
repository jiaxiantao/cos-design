import * as C from '@/components';
import React, { useEffect, useState } from 'react';
import ChargeDemo from '../demos/charge-demo';
import FireworksDemo from '../demos/fireworks-demo';
import FlipCounterDemo from '../demos/flip-counter-demo';

const CountdownDemo = () => {
  const [target] = useState(() => Date.now() + 3 * 24 * 60 * 60 * 1000);
  return <C.Countdown targetDate={target} color="#f472b6" />;
};

const ProgressChestDemo = () => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 2));
    }, 120);
    return () => clearInterval(timer);
  }, []);
  return <C.ProgressChest progress={progress} label="自动填充宝箱" />;
};

export const demoComponents: Record<string, React.ReactNode> = {
  Aurora: <C.Aurora />,
  AudioVisualizer: <C.AudioVisualizer width={480} height={200} />,
  BarcodeScan: (
    <C.BarcodeScan>
      <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: 4 }}>SCAN ME</span>
    </C.BarcodeScan>
  ),
  BurnAway: <C.BurnAway text="COS DESIGN" fontSize={56} />,
  CanvasClock: <C.CanvasClock />,
  Charge: <ChargeDemo />,
  ClickSpark: (
    <C.ClickSpark>
      <p style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>点击任意位置迸发火花</p>
    </C.ClickSpark>
  ),
  Confetti: <C.Confetti auto={false} />,
  Countdown: <CountdownDemo />,
  CyberGrid: <C.CyberGrid />,
  CursorTrail: <C.CursorTrail />,
  DiceRoll: <C.DiceRoll />,
  DnaHelix: <C.DnaHelix width={280} height={420} />,
  ElectricArc: <C.ElectricArc width={420} height={200} />,
  Fireworks: <FireworksDemo />,
  FlipCounter: <FlipCounterDemo />,
  GlitchText: <C.GlitchText text="COS DESIGN" fontSize={56} />,
  GradientFlow: <C.GradientFlow text="GRADIENT FLOW" fontSize={48} />,
  GravityBalls: <C.GravityBalls width={600} height={380} />,
  HolographicCard: <C.HolographicCard title="COS VIP" subtitle="全息会员卡 · 限量编号 #001" />,
  LiquidGlass: (
    <C.LiquidGlass>
      <h3 style={{ margin: 0 }}>液态玻璃面板</h3>
      <p style={{ margin: '8px 0 0', opacity: 0.8 }}>backdrop-filter 毛玻璃效果</p>
    </C.LiquidGlass>
  ),
  LiquidProgress: <C.LiquidProgress value={68} size={160} />,
  MagneticButton: <C.MagneticButton>磁吸按钮</C.MagneticButton>,
  MatrixRain: <C.MatrixRain />,
  MazeGenerator: <C.MazeGenerator width={400} height={400} />,
  MeteorRain: <C.MeteorRain />,
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
  ParticleNetwork: <C.ParticleNetwork />,
  ProgressChest: <ProgressChestDemo />,
  RadarScan: <C.RadarScan size={280} />,
  RedPacketRain: <C.RedPacketRain />,
  ReturnCity: <C.ReturnCity />,
  RippleWater: <C.RippleWater />,
  ScrambleText: <C.ScrambleText text="ACCESS GRANTED" />,
  ScratchCard: <C.ScratchCard />,
  SlotMachine: <C.SlotMachine />,
  SmokeFog: <C.SmokeFog />,
  Snowfall: <C.Snowfall mode="sakura" />,
  Speedometer: <C.Speedometer value={86} max={120} label="km/h" />,
  SplitReveal: <C.SplitReveal text="WELCOME" color="#38bdf8" />,
  Spotlight: (
    <C.Spotlight>
      <p style={{ padding: 40, fontSize: 18 }}>移动鼠标照亮隐藏区域 ✨</p>
    </C.Spotlight>
  ),
  Starfield: <C.Starfield />,
  TimelinePulse: <C.TimelinePulse steps={['需求', '设计', '开发', '测试', '上线']} current={2} color="#38bdf8" />,
  Turntable: <C.Turntable />,
  Typewriter: <C.Typewriter />,
  WaveButton: <C.WaveButton />,
  WaveText: <C.WaveText text="WAVE TEXT" fontSize={48} />
};
