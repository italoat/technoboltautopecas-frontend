import { useState, useEffect } from 'react';
import { Box, RefreshCw, Check, AlertCircle } from 'lucide-react';
import api from '../services/api';

export const Inventory = () => {
  const [items, setItems] = useState<any[]>([]);
  const [counts, setCounts] = useState<{[key: string]: number}>({});

  useEffect(() => {
    api.get('/api/parts').then(res => setItems(res.data));
  }, []);

  const handleAudit = (id: string, systemQty: number) => {
    const counted = counts[id];
    if (counted === undefined) return;
    
    const diff = counted - systemQty;
    const status = diff === 0 ? 'Correto' : diff > 0 ? `Sobra (+${diff})` : `Falta (${diff})`;
    
    alert(`Auditoria Registrada:\nItem ID: ${id}\nSistema: ${systemQty}\nContagem: ${counted}\nStatus: ${status}`);
    // Aqui chamaria a API de ajuste de estoque
  };

  return (
    <div className="p-6 animate-in fade-in duration-500">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Box className="text-purple-500" /> Auditoria de Estoque (Balanço)
          </h1>
          <p className="text-slate-400 text-sm">Confronto de estoque físico vs. sistema.</p>
        </div>
        <button className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
          <RefreshCw size={16} /> Novo Inventário
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {items.map(item => (
          <div key={item.id} className="bg-dark-surface p-4 rounded-xl border border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded flex items-center justify-center">
                <img src={item.image} className="w-full h-full object-contain p-1" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">{item.name}</p>
                <p className="text-slate-500 text-xs">{item.code}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right hidden md:block">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Estoque Sistema</p>
                <p className="text-white font-mono font-bold text-lg">{item.quantity}</p>
              </div>

              <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-lg border border-slate-600">
                <input 
                  type="number" 
                  placeholder="Qtd Física"
                  className="bg-transparent text-white text-center w-20 outline-none font-bold"
                  onChange={(e) => setCounts({...counts, [item.id]: Number(e.target.value)})}
                />
                <button 
                  onClick={() => handleAudit(item.id, item.quantity)}
                  className="bg-green-600 hover:bg-green-500 text-white p-2 rounded transition-colors"
                >
                  <Check size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
