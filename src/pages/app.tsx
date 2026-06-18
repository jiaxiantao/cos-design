import * as AllComponents from '@/components';
import { Navigate, Route, Routes } from 'react-router';
import { HashRouter } from 'react-router-dom';
import DemoLayout from './demo-layout';
import Home from './home';

const { CanvasClock, Charge, ReturnCity, Turntable } = AllComponents;

const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/canvasClock"
          element={
            <DemoLayout title="CanvasClock">
              <CanvasClock />
            </DemoLayout>
          }
        />
        <Route
          path="/charge"
          element={
            <DemoLayout title="Charge">
              <Charge />
            </DemoLayout>
          }
        />
        <Route
          path="/returnCity"
          element={
            <DemoLayout title="ReturnCity">
              <ReturnCity />
            </DemoLayout>
          }
        />
        <Route
          path="/turntable"
          element={
            <DemoLayout title="Turntable">
              <Turntable />
            </DemoLayout>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
