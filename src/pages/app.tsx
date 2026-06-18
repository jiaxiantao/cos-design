import * as AllComponents from '@/components';
import React from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { HashRouter } from 'react-router-dom';
import { componentDemos } from './config/components';
import DemoLayout from './demo-layout';
import Home from './home';

const {
  CanvasClock,
  Charge,
  Fireworks,
  MatrixRain,
  NeonText,
  ParticleNetwork,
  ReturnCity,
  Turntable,
  Typewriter,
  WaveButton
} = AllComponents;

const demoComponents: Record<string, React.ReactNode> = {
  CanvasClock: <CanvasClock />,
  Charge: <Charge />,
  ReturnCity: <ReturnCity />,
  Turntable: <Turntable />,
  Fireworks: <Fireworks />,
  MatrixRain: <MatrixRain />,
  ParticleNetwork: <ParticleNetwork />,
  Typewriter: <Typewriter />,
  NeonText: <NeonText />,
  WaveButton: <WaveButton />
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
            element={<DemoLayout title={item.name}>{demoComponents[item.name]}</DemoLayout>}
          />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
