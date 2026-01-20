import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Shield, Home, Settings, Menu } from 'lucide-react'; // Exemplo de ícones

const Sidebar = () => (
  <aside className="hidden md:flex flex-col w-64 h-screen bg-dark-surface border-r border-slate-700 text-white fixed left-0 top-0">
    <div className="p-6 flex items-center gap-3">
      <div className="w-8 h-8 bg-bolt-500 rounded-lg flex items-center justify-center">
        <Activity className="text-white w-5 h-5" />
      </div>
      <span className="text-xl font-bold tracking-tight">TechnoBolt</span>
    </div>
    
    <nav className="flex-1 px-4 py-4 space-y-2">
      <NavItem icon={<Home size={20} />} label="Dashboard" active />
      {/* Adapte estes itens dependendo se for Pets, Legal ou Gym */}
      <NavItem icon={<Shield size={20} />} label="Módulos" />
      <NavItem icon={<Settings size={20} />} label="Configurações" />
    </nav>

    <div className="p-4 border-t border-slate-700">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-600"></div>
        <div>
          <p className="text-sm font-medium">Usuário Admin</p>
          <p className="text-xs text-slate-400">admin@technobolt.com</p>
        </div>
      </div>
    </div>
  </aside>
);

const NavItem = ({ icon, label, active }: { icon: any, label: string, active?: boolean }) => (
  <a href="#" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active ? 'bg-bolt-500 shadow-lg shadow-bolt-500/20 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
    {icon}
    <span className="font-medium">{label}</span>
    {active && <motion.div layoutId="activeIndicator" className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
  </a>
);

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-dark-bg text-slate-100 pl-0 md:pl-64 transition-all">
      <header className="md:hidden h-16 bg-dark-surface border-b border-slate-700 flex items-center px-4 justify-between">
         <span className="font-bold text-lg">TechnoBolt</span>
         <button className="p-2"><Menu /></button>
      </header>
      
      <main className="p-6 md:p-10 max-w-7xl mx-auto">
        <Outlet /> 
      </main>
    </div>
  );
};
