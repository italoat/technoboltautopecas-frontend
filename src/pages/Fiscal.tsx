import { useState, useEffect } from 'react';
import { FileText, Save, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../services/api';

export const Fiscal = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado local para armazenar o que está sendo digitado antes de salvar
  const [edits, setEdits] = useState<{[key: string]: string}>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await api.get('/api/parts'); 
      // Mapeia para garantir que campos existam
      const data = res.data.map((p: any) => ({
        ...p,
        ncm: p.ncm || '', // Garante que não seja undefined
        cst: p.cst || '0'
      }));
      setProducts(data);
    } catch (error) {
      console.error("Erro ao carregar", error);
    } finally {
      setLoading(false);
    }
  };

  // Atualiza o estado local enquanto digita
  const handleInputChange = (id: string, field: string, value: string) => {
    setEdits(prev => ({
      ...prev,
      [`${id}-${field}`]: value
    }));
  };

  // Envia para o banco
  const handleSave = async (product: any) => {
    // Pega o valor editado OU o valor original se não mexeu
    const newNcm = edits[`${product.id}-ncm`] !== undefined ? edits[`${product.id}-ncm`] : product.ncm;
    const newCst = edits[`${product.id}-cst`] !== undefined ? edits[`${product.id}-cst`] : product.cst;

    if (!newNcm || newNcm.length < 8) {
      return alert("NCM inválido. Digite 8 números.");
    }

    try {
      await api.post('/api/fiscal/update', {
        part_id: product.id,
        ncm: newNcm,
        cst: newCst
      });
      
      alert("Cadastro fiscal atualizado!");
      
      // Atualiza a lista localmente para refletir a mudança sem recarregar tudo
      setProducts(prev => prev.map(p => 
        p.id === product.id ? { ...p, ncm: newNcm, cst: newCst } : p
      ));
      
      // Limpa os edits desse item
      const newEdits = { ...edits };
      delete newEdits[`${product.id}-ncm`];
      setEdits(newEdits);

    } catch (error) {
      alert("Erro ao salvar. Verifique a conexão.");
    }
  };

  // Contadores
  const pendingCount = products.filter(p => !p.ncm || p.ncm === 'PENDENTE').length;
  const okCount = products.length - pendingCount;

  if (loading) return <div className="flex h-full items-center justify-center text-slate-500 gap-2"><Loader2 className="animate-spin"/> Carregando...</div>;

  return (
    <div className="p-6 animate-in fade-in duration-500">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="text-blue-500" /> Revisor Fiscal & Tributário
        </h1>
        <p className="text-slate-400 text-sm">Corrija NCMs e CSTs para evitar bloqueios na emissão de nota.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 border-l-4 border-l-green-500">
          <p className="text-slate-400 text-xs uppercase font-bold">Cadastros OK</p>
          <p className="text-2xl font-bold text-white">{okCount}</p>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 border-l-4 border-l-yellow-500">
          <p className="text-slate-400 text-xs uppercase font-bold">Sem NCM (Ação Necessária)</p>
          <p className="text-2xl font-bold text-white">{pendingCount}</p>
        </div>
      </div>

      <div className="bg-dark-surface rounded-xl border border-slate-700 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-900 text-slate-200 uppercase font-bold text-xs">
              <tr>
                <th className="p-4">Produto</th>
                <th className="p-4 w-32">Código</th>
                <th className="p-4 w-40">NCM (Fiscal)</th>
                <th className="p-4 w-40">Origem (CST)</th>
                <th className="p-4 text-center w-24">Status</th>
                <th className="p-4 text-right w-20">Salvar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {products.map((p) => {
                const isPending = !p.ncm || p.ncm === 'PENDENTE';
                // Verifica se tem edição pendente neste campo
                const currentNcm = edits[`${p.id}-ncm`] !== undefined ? edits[`${p.id}-ncm`] : (p.ncm || '');
                const currentCst = edits[`${p.id}-cst`] !== undefined ? edits[`${p.id}-cst`] : (p.cst || '0');

                return (
                  <tr key={p.id} className={`transition-colors ${isPending ? 'bg-yellow-500/5 hover:bg-yellow-500/10' : 'hover:bg-slate-800/50'}`}>
                    <td className="p-4 font-medium text-white">
                      {p.name}
                      {isPending && <span className="block text-[10px] text-yellow-500 font-bold mt-1">⚠ Correção Necessária</span>}
                    </td>
                    <td className="p-4">{p.code}</td>
                    
                    {/* Campo NCM Editável */}
                    <td className="p-4">
                      <input 
                        type="text"
                        className={`bg-slate-900 border rounded px-2 py-1 w-full text-white outline-none focus:border-blue-500 font-mono 
                          ${isPending ? 'border-yellow-500/50' : 'border-slate-700'}`}
                        placeholder="0000.00.00"
                        value={currentNcm}
                        onChange={(e) => handleInputChange(p.id, 'ncm', e.target.value)}
                      />
                    </td>

                    {/* Campo CST Editável */}
                    <td className="p-4">
                      <select 
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 w-full text-white outline-none focus:border-blue-500"
                        value={currentCst}
                        onChange={(e) => handleInputChange(p.id, 'cst', e.target.value)}
                      >
                        <option value="0">0 - Nacional</option>
                        <option value="1">1 - Importado</option>
                        <option value="2">2 - Estrangeira (Int)</option>
                      </select>
                    </td>

                    <td className="p-4 text-center">
                      {isPending ? (
                        <span className="text-yellow-500 flex justify-center"><AlertTriangle size={18} /></span>
                      ) : (
                        <span className="text-green-500 flex justify-center"><CheckCircle size={18} /></span>
                      )}
                    </td>
                    
                    <td className="p-4 text-right">
                      {/* Botão Salvar só ativa se tiver alteração ou se estiver pendente */}
                      <button 
                        onClick={() => handleSave(p)}
                        className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                        title="Salvar Correção"
                      >
                        <Save size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
