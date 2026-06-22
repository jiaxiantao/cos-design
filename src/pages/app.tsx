import * as AllComponents from '@/components';
import React, { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { HashRouter } from 'react-router-dom';
import { componentDemos } from './config/components';
import DemoLayout from './demo-layout';
import ChargeDemo from './demos/charge-demo';
import FireworksDemo from './demos/fireworks-demo';
import FlipCounterDemo from './demos/flip-counter-demo';
import Home from './home';

const {
  CanvasClock,
  Confetti,
  Countdown,
  GlitchText,
  MatrixRain,
  MeteorRain,
  NeonText,
  ParticleNetwork,
  ReturnCity,
  Turntable,
  Typewriter,
  WaveButton
} = AllComponents;

const CountdownDemo = () => {
  const [target] = useState(() => Date.now() + 3 * 24 * 60 * 60 * 1000);
  return <Countdown targetDate={target} color="#f472b6" />;
};

const demoComponents: Record<string, React.ReactNode> = {
  CanvasClock: <CanvasClock />,
  Charge: <ChargeDemo />,
  ReturnCity: <ReturnCity />,
  Turntable: <Turntable />,
  Fireworks: <FireworksDemo />,
  MatrixRain: <MatrixRain />,
  ParticleNetwork: <ParticleNetwork />,
  Typewriter: <Typewriter />,
  NeonText: <NeonText />,
  WaveButton: <WaveButton />,
  FlipCounter: <FlipCounterDemo />,
  Countdown: <CountdownDemo />,
  Confetti: <Confetti auto={false} />,
  GlitchText: <GlitchText text="COS DESIGN" fontSize={56} />,
  MeteorRain: <MeteorRain />
};

const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {componentDemos.map((item) => (
          <Route
            key={item.path}
            path={item.path}
            element={
              <DemoLayout title={item.name} code={item.codeExample}>
                {demoComponents[item.name]}
              </DemoLayout>
            }
          />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
