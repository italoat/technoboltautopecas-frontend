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
  LogOut
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

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
  return (
    <aside className="w-64 bg-dark-surface border-r border-slate-700 flex flex-col h-screen fixed left-0 top-0 overflow-y-auto custom-scrollbar z-50">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold text-white tracking-tighter flex items-center gap-2">
          <div className="w-8 h-8 bg-bolt-500 rounded-lg flex items-center justify-center shadow-lg shadow-bolt-500/20">
            <span className="text-white font-bold text-sm">TB</span>
          </div>
          TechnoBolt
        </h1>
        
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 bg-slate-800 p-2 rounded-lg border border-slate-700">
          <Store size={14} className="text-bolt-500" />
          <select className="bg-transparent outline-none w-full cursor-pointer text-slate-300 font-medium">
            <option>Loja 01 - Matriz</option>
            <option>Loja 02 - Centro</option>
            <option>Loja 03 - Taguatinga</option>
          </select>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {modules.map((mod) => (
          <NavLink
            key={mod.path}
            to={mod.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-sm font-medium group relative
              ${isActive 
                ? 'bg-bolt-500 text-white shadow-lg shadow-bolt-500/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
              ${mod.highlight ? 'border border-bolt-500/30 bg-bolt-500/10 text-bolt-500 hover:bg-bolt-500 hover:text-white' : ''}
            `}
          >
            <mod.icon size={18} className={mod.highlight ? "animate-pulse" : ""} />
            <span>{mod.name}</span>
            {mod.new && (
              <span className="ml-auto text-[10px] bg-industrial-500 text-black px-1.5 py-0.5 rounded font-bold">
                NOVO
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <button className="flex items-center gap-3 w-full px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-sm">
            <LogOut size={18} />
            <span>Sair do Sistema</span>
        </button>
      </div>
    </aside>
  );
};
