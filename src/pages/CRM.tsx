import { useState, useEffect } from 'react';
import { Mail, Phone, User, Calendar, Star } from 'lucide-react';
import api from '../services/api';

export const CRM = () => {
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    // Busca clientes da nova rota do backend
    api.get('/api/crm/clients').then(res => setClients(res.data)).catch(console.error);
  }, []);

  return (
    <div className="p-6 animate-in fade-in duration-500">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Mail className="text-pink-500" /> CRM Automático
        </h1>
        <p className="text-slate-400 text-sm">Gestão de relacionamento e histórico de clientes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((client, i) => (
          <div key={i} className="bg-dark-surface p-5 rounded-xl border border-slate-700 hover:border-pink-500/50 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {client.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-white font-bold">{client.name}</h3>
                  <div className="flex gap-1 text-yellow-500">
                    <Star size={10} fill="currentColor" />
                    <Star size={10} fill="currentColor" />
                    <Star size={10} fill="currentColor" />
                  </div>
                </div>
              </div>
              <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-1 rounded border border-slate-700">VIP</span>
            </div>

            <div className="space-y-2 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Calendar size={14} /> Última compra: {new Date(client.last_purchase).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2">
                <User size={14} /> Total gasto: <span className="text-white font-bold">R$ {client.total_spent.toFixed(2)}</span>
              </div>
            </div>

            <button className="mt-4 w-full bg-slate-800 hover:bg-pink-600 hover:text-white text-slate-300 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 border border-slate-700 group-hover:border-pink-500">
              <Phone size={14} /> Contatar Cliente
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
