import { useState, useEffect } from 'react';
import { ShoppingBag, TrendingDown, ArrowRight } from 'lucide-react';
import api from '../services/api';

export const Purchases = () => {
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    // Filtra itens com estoque baixo (Mock: < 50 unidades para exemplo)
    api.get('/api/parts').then(res => {
      const lowStock = res.data.filter((p: any) => p.quantity < 100);
      setSuggestions(lowStock);
    });
  }, []);

  return (
    <div className="p-6 animate-in fade-in duration-500">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShoppingBag className="text-orange-500" /> Compras Inteligentes
        </h1>
        <p className="text-slate-400 text-sm">Sugestões de reposição baseadas em giro e estoque mínimo.</p>
      </div>

      <div className="space-y-4">
        {suggestions.length === 0 ? (
          <p className="text-slate-500">Estoque saudável. Nenhuma sugestão de compra.</p>
        ) : (
          suggestions.map(item => (
            <div key={item.id} className="bg-dark-surface p-5 rounded-xl border border-slate-700 flex justify-between items-center relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>
              
              <div className="flex gap-4 items-center">
                <div className="bg-orange-500/10 p-3 rounded-full text-orange-500">
                  <TrendingDown size={24} />
                </div>
                <div>
                  <h3 className="text-white font-bold">{item.name}</h3>
                  <p className="text-slate-400 text-sm">Estoque Atual: <span className="text-red-400 font-bold">{item.quantity}</span> / Ideal: 150</p>
                </div>
              </div>

              <button className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-orange-500/20">
                Gerar Pedido <ArrowRight size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
