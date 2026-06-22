import React from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { HashRouter } from 'react-router-dom';
import { componentDemos } from './config/components';
import { demoComponents } from './config/demo-components';
import DemoLayout from './demo-layout';
import Home from './home';

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
                {demoComponents[item.name] ?? <p>演示暂未配置</p>}
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
