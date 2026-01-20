import { useEffect, useState } from 'react';
import api from '../services/api'; 
import { AlertTriangle, TrendingUp, Trophy, Package, Clock } from 'lucide-react';

export const Dashboard = () => {
  const [status, setStatus] = useState('Conectando...');

  useEffect(() => {
    api.get('/') // Ajustei para '/' pois é a rota raiz do backend que retorna status
      .then(res => setStatus(res.data.status || 'Online'))
      .catch(() => setStatus('Backend Offline'));
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Cabeçalho da Página */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Centro de Comando</h2>
          <p className="text-slate-400">TechnoBolt Autopeças - Operacional</p>
        </div>
        <div className="flex gap-2">
           <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${status.includes('Online') ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
              <span className={`w-2 h-2 rounded-full ${status.includes('Online') ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
              {status}
           </span>
        </div>
      </div>
        
      {/* Alertas Críticos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-500/10 border border-red-500/30 p-5 rounded-xl flex items-center gap-4 shadow-lg shadow-red-500/5 group hover:border-red-500/60 transition-colors cursor-pointer">
            <div className="bg-red-500 p-3 rounded-lg text-white shadow-lg group-hover:scale-110 transition-transform"><AlertTriangle size={24} /></div>
            <div>
                <h3 className="font-bold text-red-400 text-lg">12 Notas Pendentes</h3>
                <p className="text-sm text-red-300/60">Aguardando entrada fiscal</p>
            </div>
        </div>
        
        <div className="bg-industrial-500/10 border border-industrial-500/30 p-5 rounded-xl flex items-center gap-4 shadow-lg shadow-industrial-500/5 group hover:border-industrial-500/60 transition-colors cursor-pointer">
            <div className="bg-industrial-500 p-3 rounded-lg text-black shadow-lg group-hover:scale-110 transition-transform"><Package size={24} /></div>
            <div>
                <h3 className="font-bold text-industrial-500 text-lg">5 Itens Críticos</h3>
                <p className="text-sm text-industrial-300/60">Curva A com estoque zero</p>
            </div>
        </div>
        
        <div className="bg-bolt-500/10 border border-bolt-500/30 p-5 rounded-xl flex items-center gap-4 shadow-lg shadow-bolt-500/5 group hover:border-bolt-500/60 transition-colors cursor-pointer">
            <div className="bg-bolt-500 p-3 rounded-lg text-white shadow-lg group-hover:scale-110 transition-transform"><TrendingUp size={24} /></div>
            <div>
                <h3 className="font-bold text-bolt-400 text-lg">85% da Meta</h3>
                <p className="text-sm text-bolt-300/60">Faltam R$ 2.450,00 hoje</p>
            </div>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Curva Horária */}
        <div className="lg:col-span-2 bg-dark-surface p-6 rounded-2xl border border-slate-700 shadow-xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Clock className="text-bolt-500" size={20} />
                    Fluxo de Loja (Curva Horária)
                </h3>
                <select className="bg-dark-bg border border-slate-700 text-xs rounded px-2 py-1 text-slate-400">
                    <option>Hoje</option>
                    <option>Ontem</option>
                </select>
            </div>
            
            <div className="h-64 flex items-end justify-between gap-2 px-2 relative border-b border-slate-700/50 pb-2">
                {[20, 35, 60, 80, 50, 90, 100, 70, 40, 30].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end group cursor-help">
                        <div 
                            className="w-full bg-slate-700 hover:bg-bolt-500 transition-all duration-300 rounded-t-sm relative" 
                            style={{ height: `${h}%` }}
                        >
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black border border-slate-700 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-xl">
                                {8 + i}:00h <br/> <span className="font-bold text-bolt-400">{h} Atendimentos</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-between text-slate-500 text-xs mt-3 px-1 font-mono">
                <span>08:00</span>
                <span>10:00</span>
                <span>12:00</span>
                <span>14:00</span>
                <span>16:00</span>
                <span>18:00</span>
            </div>
        </div>

        {/* Ranking Gamificado */}
        <div className="bg-dark-surface p-6 rounded-2xl border border-slate-700 shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Trophy className="text-industrial-500" size={20} />
                    Top Vendedores
                </h3>
                <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">Tempo Real</span>
            </div>
            
            <div className="space-y-4 flex-1">
                {[
                    { name: 'Carlos Silva', val: 'R$ 12.500', pos: 1 },
                    { name: 'Ana Souza', val: 'R$ 10.200', pos: 2 },
                    { name: 'Roberto Jr', val: 'R$ 8.100', pos: 3 },
                    { name: 'Fernanda L.', val: 'R$ 6.400', pos: 4 },
                ].map((vendedor) => (
                    <div key={vendedor.pos} className="flex items-center gap-3 p-3 rounded-lg bg-dark-bg border border-slate-700 hover:border-bolt-500/50 hover:bg-slate-800 transition-all cursor-pointer group">
                        <div className={`
                            w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-lg
                            ${vendedor.pos === 1 ? 'bg-industrial-500 text-black' : 
                              vendedor.pos === 2 ? 'bg-slate-400 text-black' :
                              vendedor.pos === 3 ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-500'}
                        `}>
                            {vendedor.pos}º
                        </div>
                        
                        <div className="flex-1">
                            <div className="flex justify-between">
                                <p className="text-sm font-medium text-white group-hover:text-bolt-400 transition-colors">{vendedor.name}</p>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                                <div 
                                    className={`h-full ${vendedor.pos === 1 ? 'bg-industrial-500' : 'bg-bolt-500'}`} 
                                    style={{ width: `${100 - (vendedor.pos * 15)}%` }}
                                ></div>
                            </div>
                        </div>
                        <span className="text-sm font-bold text-slate-200">{vendedor.val}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};
