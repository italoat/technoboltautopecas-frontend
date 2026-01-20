import { useState, useEffect } from 'react';
import { FileText, AlertTriangle, CheckCircle, Search, Save } from 'lucide-react';
import api from '../services/api';

export const Fiscal = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Busca produtos (na prática, filtraria os com erro fiscal)
      const res = await api.get('/api/parts'); 
      setProducts(res.data);
    } catch (error) {
      console.error("Erro ao carregar fiscal", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 animate-in fade-in duration-500">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="text-blue-500" /> Revisor Fiscal & Tributário
        </h1>
        <p className="text-slate-400 text-sm">Monitore NCM, CST e regras fiscais dos produtos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 border-l-4 border-l-green-500">
          <p className="text-slate-400 text-xs uppercase font-bold">Cadastros OK</p>
          <p className="text-2xl font-bold text-white">{products.length - 2}</p>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 border-l-4 border-l-yellow-500">
          <p className="text-slate-400 text-xs uppercase font-bold">Sem NCM</p>
          <p className="text-2xl font-bold text-white">2</p>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 border-l-4 border-l-red-500">
          <p className="text-slate-400 text-xs uppercase font-bold">Erro de Alíquota</p>
          <p className="text-2xl font-bold text-white">0</p>
        </div>
      </div>

      <div className="bg-dark-surface rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-900 text-slate-200 uppercase font-bold text-xs">
              <tr>
                <th className="p-4">Produto</th>
                <th className="p-4">Código</th>
                <th className="p-4">NCM</th>
                <th className="p-4">Origem (CST)</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {products.map((p, i) => (
                <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-medium text-white">{p.name}</td>
                  <td className="p-4">{p.code}</td>
                  <td className="p-4">
                    {/* Simulação de NCM ausente em alguns itens */}
                    {i < 2 ? <span className="text-red-400 font-bold">PENDENTE</span> : '8708.99.90'}
                  </td>
                  <td className="p-4">0 - Nacional</td>
                  <td className="p-4 text-center">
                    {i < 2 ? (
                      <span className="bg-red-500/10 text-red-400 px-2 py-1 rounded text-[10px] font-bold border border-red-500/20">REVISAR</span>
                    ) : (
                      <span className="bg-green-500/10 text-green-400 px-2 py-1 rounded text-[10px] font-bold border border-green-500/20">OK</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-blue-400 hover:text-white transition-colors">
                      <Save size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
