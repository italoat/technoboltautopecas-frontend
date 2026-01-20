import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { PartsSearch } from './pages/PartsSearch';
import { Login } from './pages/Login';
import { Vision } from './pages/Vision'; // <--- Importação nova

// Componente que protege a rota
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const user = localStorage.getItem('user'); // Ou 'technobolt_user' se atualizou o login anteriormente
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota Pública */}
        <Route path="/login" element={<Login />} />
        
        {/* Rota Protegida - Modo Imersivo (Sem Layout Padrão) */}
        <Route path="/vision" element={
          <PrivateRoute>
            <Vision />
          </PrivateRoute>
        } />

        {/* Rotas Protegidas - Com Layout Padrão (Sidebar/Header) */}
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
