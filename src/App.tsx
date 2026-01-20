import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { PartsSearch } from './pages/PartsSearch';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="search" element={<PartsSearch />} />
          
          {/* Rotas Placeholders para os outros módulos */}
          <Route path="*" element={<div className="p-10 text-slate-500">Módulo em desenvolvimento...</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
