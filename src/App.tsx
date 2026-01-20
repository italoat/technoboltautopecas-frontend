import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { PartsSearch } from './pages/PartsSearch';
import { Login } from './pages/Login';

// Componente que protege a rota
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const user = localStorage.getItem('user');
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Todas as rotas internas protegidas */}
        <Route path="/" element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="search" element={<PartsSearch />} />
          
          {/* Rotas Placeholder */}
          <Route path="*" element={<div className="p-10 text-slate-500">Módulo em desenvolvimento...</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
