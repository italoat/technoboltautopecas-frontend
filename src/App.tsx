import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { PartsSearch } from './pages/PartsSearch';
import { Login } from './pages/Login';
import { Vision } from './pages/Vision';
import { POS } from './pages/POS'; // <--- Importação do Módulo PDV
import { Logistics } from './pages/Logistics';
import { Cashier } from './pages/Cashier';
import { Fiscal } from './pages/Fiscal';
import { Inventory } from './pages/Inventory';
import { Purchases } from './pages/Purchases';
import { CRM } from './pages/CRM';
import { AIChat } from './pages/AIChat';
import { TeamChat } from './pages/TeamChat';
import { ProductRegistration } from './pages/ProductRegistration'; // Importe Novo

// Componente que protege a rota
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  // Verifica ambas as chaves para garantir compatibilidade
  const user = localStorage.getItem('technobolt_user') || localStorage.getItem('user');
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota Pública */}
        <Route path="/login" element={<Login />} />
        
        {/* Rota Protegida - Modo Imersivo (Sem Layout Padrão) */}
        {/* O Vision fica aqui para ocupar a tela toda do celular sem a Sidebar */}
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
          <Route path="pos" element={<POS />} /> {/* <--- Rota do PDV Adicionada */}
          <Route path="logistics" element={<Logistics />} />
          <Route path="cashier" element={<Cashier />} />
          <Route path="products/new" element={<ProductRegistration />} /> {/* Rota Nova */}
          <Route path="fiscal" element={<Fiscal />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="purchases" element={<Purchases />} />
          <Route path="crm" element={<CRM />} />
          <Route path="ai-chat" element={<AIChat />} />
          <Route path="team-chat" element={<TeamChat />} />
          
          {/* Rotas Placeholder para links que ainda não existem */}
          <Route path="*" element={<div className="p-10 text-slate-500">Módulo em desenvolvimento...</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
