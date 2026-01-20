import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Bell, Search } from 'lucide-react';

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-dark-bg text-slate-100 flex">
      {/* Sidebar Fixa */}
      <Sidebar />

      {/* Conteúdo Principal */}
      <div className="flex-1 ml-64 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-dark-bg/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-40 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4 w-96">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="Busca global (Cliente, Nota, Pedido...)" 
                className="w-full bg-slate-800/50 border border-slate-700 rounded-full pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:border-bolt-500 focus:ring-1 focus:ring-bolt-500 transition-all placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-industrial-500 rounded-full border border-dark-bg"></span>
            </button>
            <div className="h-8 w-px bg-slate-700 mx-2"></div>
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-white">Vendedor Carlos</p>
                <p className="text-xs text-slate-400">Matriz - ID: 4829</p>
              </div>
              <div className="w-9 h-9 bg-bolt-600 rounded-full flex items-center justify-center text-white font-bold border-2 border-slate-700">
                VC
              </div>
            </div>
          </div>
        </header>

        {/* Área de Conteúdo das Páginas */}
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
