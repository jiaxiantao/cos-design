import { Navigate, Route, Routes } from 'react-router';
import { HashRouter } from 'react-router-dom';
import { componentDemos } from './config/components';
import CatalogPage from './playground/catalog-page';
import ComponentPage from './playground/component-page';
import HomePage from './playground/home-page';
import PlaygroundLayout from './playground/playground-layout';
import QuickstartPage from './playground/quickstart-page';
import { PlaygroundSearchProvider } from './playground/search-context';

const App = () => {
  return (
    <HashRouter>
      <PlaygroundSearchProvider>
        <Routes>
          <Route element={<PlaygroundLayout />}>
            <Route index element={<HomePage />} />
            <Route path="catalog" element={<CatalogPage />} />
            <Route path="quickstart" element={<QuickstartPage />} />
            {componentDemos.map((item) => (
              <Route key={item.path} path={item.path.replace(/^\//, '')} element={<ComponentPage />} />
            ))}
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PlaygroundSearchProvider>
    </HashRouter>
  );
};

export default App;
