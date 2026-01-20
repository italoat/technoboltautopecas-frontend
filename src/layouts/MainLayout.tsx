import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar'; // <--- CORREÇÃO: Importando da mesma pasta 'layouts'
import { Bell, Search } from 'lucide-react';

export const MainLayout = () => {
  // --- LÓGICA DO USUÁRIO DINÂMICO ---
  const userStr = localStorage.getItem('technobolt_user') || localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { name: 'Visitante', role: 'Convidado' };

  // Gera iniciais (Ex: Italo Trovão -> IT)
  const getInitials = (name: string) => {
    if (!name) return 'TB';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const currentStoreName = user.currentStore?.name || user.role;
  const currentStoreId = user.currentStore?.id || '---';

  return (
    <div className="min-h-screen bg-dark-bg text-slate-100 flex font-sans">
      {/* Sidebar Fixa */}
      <Sidebar />

      {/* Conteúdo Principal */}
      <div className="flex-1 ml-64 flex flex-col min-w-0 transition-all duration-300">
        
        {/* Top Header */}
        <header className="h-16 bg-dark-bg/95 backdrop-blur-md border-b border-slate-700 sticky top-0 z-40 px-8 flex items-center justify-between shadow-sm">
          
          {/* Barra de Busca Global */}
          <div className="flex items-center gap-4 w-96">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-bolt-500 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Busca global (Cliente, Nota, Pedido...)" 
                className="w-full bg-slate-800/50 border border-slate-700 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-bolt-500 focus:ring-1 focus:ring-bolt-500 transition-all placeholder:text-slate-500 text-white"
              />
            </div>
          </div>

          {/* Área do Usuário */}
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors hover:bg-slate-800 rounded-full">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-industrial-500 rounded-full border-2 border-dark-bg"></span>
            </button>
            
            <div className="h-8 w-px bg-slate-700 mx-2"></div>
            
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-white group-hover:text-bolt-400 transition-colors">
                  {user.name}
                </p>
                <p className="text-xs text-slate-400 font-mono">
                  {currentStoreName} <span className="text-slate-600">|</span> ID: {currentStoreId}
                </p>
              </div>
              
              <div className="w-10 h-10 bg-gradient-to-br from-bolt-600 to-bolt-800 rounded-full flex items-center justify-center text-white font-bold border-2 border-slate-700 shadow-lg shadow-bolt-500/20 group-hover:border-bolt-500 transition-all">
                {getInitials(user.name)}
              </div>
            </div>
          </div>
        </header>

        {/* Área de Conteúdo das Páginas */}
        <main className="p-8 flex-1 overflow-y-auto custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
