import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Box, 
  Mail, 
  ShoppingBag, 
  MessageSquare, 
  ScanEye, 
  Truck, 
  ArrowRightLeft, 
  ShoppingCart, 
  Store,
  LogOut,
  UserCircle
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

const modules = [
  { name: 'Comando (Dash)', path: '/', icon: LayoutDashboard },
  { name: 'PDV & Orçamento', path: '/pos', icon: ShoppingCart, highlight: true },
  { name: 'Busca Peças (Cross)', path: '/search', icon: ArrowRightLeft },
  { name: 'TechnoBolt Vision', path: '/vision', icon: ScanEye, new: true },
  { name: 'Revisor Fiscal', path: '/fiscal', icon: FileText },
  { name: 'Auditor Estoque', path: '/inventory', icon: Box },
  { name: 'Hub Transferência', path: '/logistics', icon: Truck },
  { name: 'Compras Inteligentes', path: '/purchases', icon: ShoppingBag },
  { name: 'CRM Automático', path: '/crm', icon: Mail },
  { name: 'Consultor IA', path: '/ai-chat', icon: MessageSquare },
];

export const Sidebar = () => {
  const navigate = useNavigate();
  
  // Recupera dados do usuário e da loja selecionada com tratamento de erro seguro
  const userStr = localStorage.getItem('user');
  let user = null;
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error("Erro ao ler usuário", e);
  }
  
  const currentStore = user?.currentStore || { name: 'Loja Não Selecionada', id: '---' };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-dark-surface border-r border-slate-700 flex flex-col h-screen fixed left-0 top-0 overflow-y-auto custom-scrollbar z-50 transition-all duration-300">
      
      {/* --- HEADER COM LOGO E LOJA --- */}
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold text-white tracking-tighter flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-bolt-500 rounded-lg flex items-center justify-center shadow-lg shadow-bolt-500/20">
            <span className="text-white font-bold text-sm">TB</span>
          </div>
          TechnoBolt
        </h1>
        
        {/* Card da Loja Atual */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-1.5 bg-bolt-500/10 rounded text-bolt-500">
              <Store size={14} />
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Unidade Operacional
            </span>
          </div>
          <div className="pl-1">
            <p className="font-semibold text-white text-sm truncate" title={currentStore.name}>
              {currentStore.name}
            </p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              ID: {currentStore.id}
            </p>
          </div>
        </div>
      </div>

      {/* --- NAVEGAÇÃO --- */}
      <nav className="flex-1 p-4 space-y-1.5">
        {modules.map((mod) => (
          <NavLink
            key={mod.path}
            to={mod.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-sm font-medium group relative
              ${isActive 
                ? 'bg-bolt-500 text-white shadow-lg shadow-bolt-500/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
              ${mod.highlight && !isActive ? 'border border-bolt-500/30 bg-bolt-500/5 text-bolt-500 hover:bg-bolt-500 hover:text-white' : ''}
            `}
          >
            {/* AQUI ESTAVA O ERRO: Agora usamos a função para envolver o conteúdo */}
            {({ isActive }) => (
              <>
                <mod.icon 
                  size={18} 
                  className={`${mod.highlight ? "text-inherit" : ""} group-hover:scale-110 transition-transform`} 
                />
                
                <span>{mod.name}</span>
                
                {/* Badge "NOVO" */}
                {mod.new && (
                  <span className="ml-auto text-[9px] bg-industrial-500 text-black px-1.5 py-0.5 rounded font-bold shadow-sm shadow-industrial-500/20">
                    NOVO
                  </span>
                )}
                
                {/* Indicador Ativo (Bolinha) - Agora funciona pois está dentro do escopo da função */}
                {isActive && (
                   <div className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* --- FOOTER COM USUÁRIO E LOGOUT --- */}
      <div className="p-4 border-t border-slate-700 bg-slate-800/30">
        <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 border border-slate-600">
                <UserCircle size={20} />
            </div>
            <div className="overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{user?.name || 'Visitante'}</p>
                <p className="text-xs text-slate-500 truncate capitalize">{user?.role || 'Guest'}</p>
            </div>
        </div>

        <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-3 py-2 text-red-400 hover:text-white hover:bg-red-500/80 rounded-lg transition-all text-sm border border-transparent hover:border-red-500/50"
        >
            <LogOut size={16} />
            <span>Sair / Trocar Loja</span>
        </button>
      </div>
    </aside>
  );
};
