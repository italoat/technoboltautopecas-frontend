import { useState, useEffect } from 'react';
import { Box, RefreshCw, History, Edit3, Save, X, Search, User } from 'lucide-react';
import api from '../services/api';

interface Product {
  id: string;
  name: string;
  code: string;
  image: string;
  stock_locations?: { loja_id: number; nome: string; qtd: number }[];
}

interface Log {
  id: string;
  product_name: string;
  user_name: string; // Campo novo
  old_quantity: number;
  new_quantity: number;
  reason: string;
  created_at: string;
}

export const Inventory = () => {
  const [activeTab, setActiveTab] = useState<'audit' | 'logs'>('audit');
  const [items, setItems] = useState<Product[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [query, setQuery] = useState('');
  
  // Controle do Modal de Edição
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [editQty, setEditQty] = useState<number>(0);
  const [editReason, setEditReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Recupera Usuário e Loja
  const userStr = localStorage.getItem('technobolt_user') || localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  // Tratamento de ID da loja
  const getStoreId = (id: any) => {
    if (!id) return 1;
    if (typeof id === 'number') return id;
    const match = id.match(/\d+/); 
    return match ? parseInt(match[0], 10) : 1; 
  };
  const currentStoreId = user?.currentStore?.id ? getStoreId(user.currentStore.id) : 1;

  // --- CARREGAMENTO DE DADOS ---
  useEffect(() => {
    if (activeTab === 'audit') loadInventory();
    if (activeTab === 'logs') loadLogs();
  }, [activeTab]);

  const loadInventory = async () => {
    try {
      const res = await api.get(`/api/parts?q=${query}`);
      setItems(res.data);
    } catch (e) { console.error(e); }
  };

  const loadLogs = async () => {
    try {
      const res = await api.get(`/api/inventory/logs?store_id=${currentStoreId}`);
      setLogs(res.data);
    } catch (e) { console.error(e); }
  };

  // --- FUNÇÕES AUXILIARES ---
  const getLocalQty = (item: Product) => {
    const loc = item.stock_locations?.find(l => Number(l.loja_id) === currentStoreId);
    return loc ? Number(loc.qtd) : 0;
  };

  const openEditModal = (item: Product) => {
    setEditingItem(item);
    setEditQty(getLocalQty(item));
    setEditReason('');
  };

  const closeEditModal = () => {
    setEditingItem(null);
  };

  const handleSaveAdjustment = async () => {
    if (!editingItem) return;
    if (!editReason.trim()) return alert("A justificativa é obrigatória para auditoria.");
    if (editQty < 0) return alert("Quantidade não pode ser negativa.");

    const oldQty = getLocalQty(editingItem);
    if (editQty === oldQty) return alert("A quantidade é a mesma. Nenhuma alteração necessária.");

    setIsSaving(true);
    try {
      await api.post('/api/inventory/adjust', {
        part_id: editingItem.id,
        store_id: currentStoreId,
        user_name: user?.name || 'Auditor Anônimo', // Envia o nome do usuário
        old_quantity: oldQty,
        new_quantity: editQty,
        reason: editReason
      });

      alert("Estoque atualizado com sucesso!");
      loadInventory(); // Recarrega para ver mudança
      closeEditModal();
    } catch (e) {
      alert("Erro ao salvar ajuste.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 animate-in fade-in duration-500 relative">
      
      {/* HEADER E ABAS */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Box className="text-purple-500" /> Auditoria de Estoque
          </h1>
          <p className="text-slate-400 text-sm">Balanço e ajustes da <strong>Loja {currentStoreId}</strong>.</p>
        </div>
        
        <div className="flex bg-slate-800 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('audit')} 
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'audit' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            <RefreshCw size={16}/> Balanço Atual
          </button>
          <button 
            onClick={() => setActiveTab('logs')} 
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'logs' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            <History size={16}/> Histórico de Logs
          </button>
        </div>
      </div>

      {/* --- ABA 1: BALANÇO (LISTA) --- */}
      {activeTab === 'audit' && (
        <>
          {/* Barra de Busca */}
          <div className="mb-4 relative">
            <input 
              type="text" 
              placeholder="Buscar produto para auditar..." 
              className="w-full bg-dark-surface border border-slate-700 rounded-xl p-3 pl-10 text-white outline-none focus:border-purple-500"
              value={query}
              onChange={e => { setQuery(e.target.value); loadInventory(); }}
            />
            <Search className="absolute left-3 top-3.5 text-slate-500" size={18} />
          </div>

          <div className="grid grid-cols-1 gap-3">
            {items.map(item => {
              const qtd = getLocalQty(item);
              return (
                <div key={item.id} className="bg-dark-surface p-4 rounded-xl border border-slate-700 flex items-center justify-between group hover:border-purple-500/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded flex items-center justify-center">
                      <img src={item.image || 'placeholder.png'} className="w-full h-full object-contain p-1" alt={item.name} />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{item.name}</p>
                      <p className="text-slate-500 text-xs font-mono">{item.code}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Qtd. Loja {currentStoreId}</p>
                      <p className={`font-mono font-bold text-2xl ${qtd === 0 ? 'text-red-500' : 'text-white'}`}>{qtd}</p>
                    </div>

                    <button 
                      onClick={() => openEditModal(item)}
                      className="bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white p-3 rounded-lg transition-all"
                      title="Realizar Ajuste Manual"
                    >
                      <Edit3 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* --- ABA 2: LOGS --- */}
      {activeTab === 'logs' && (
        <div className="bg-dark-surface rounded-xl border border-slate-700 overflow-hidden">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-900 text-slate-200 uppercase font-bold text-xs">
              <tr>
                <th className="p-4">Data/Hora</th>
                <th className="p-4">Usuário</th>
                <th className="p-4">Produto</th>
                <th className="p-4 text-center">De -> Para</th>
                <th className="p-4">Justificativa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {logs.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Nenhum registro de auditoria encontrado.</td></tr>
              )}
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/50">
                  <td className="p-4 font-mono text-xs text-slate-500">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="p-4 flex items-center gap-2 text-white">
                    <User size={14} className="text-purple-400"/>
                    {log.user_name}
                  </td>
                  <td className="p-4 font-medium">{log.product_name}</td>
                  <td className="p-4 text-center">
                    <span className="text-red-400 font-bold">{log.old_quantity}</span>
                    <span className="mx-2 text-slate-600">➔</span>
                    <span className="text-green-400 font-bold">{log.new_quantity}</span>
                  </td>
                  <td className="p-4 italic text-slate-300">"{log.reason}"</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- MODAL DE EDIÇÃO --- */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-dark-surface border border-slate-600 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-white">Ajuste Manual de Estoque</h2>
              <button onClick={closeEditModal} className="text-slate-400 hover:text-white"><X size={24}/></button>
            </div>

            <div className="mb-6 p-3 bg-slate-800/50 rounded-lg">
              <p className="text-sm text-slate-300 font-medium">{editingItem.name}</p>
              <p className="text-xs text-slate-500 font-mono mt-1">{editingItem.code}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 uppercase font-bold block mb-1">Nova Quantidade (Loja {currentStoreId})</label>
                <div className="flex items-center gap-3">
                    <button onClick={() => setEditQty(q => Math.max(0, q - 1))} className="p-2 bg-slate-700 rounded text-white hover:bg-slate-600">-</button>
                    <input 
                      type="number" 
                      className="flex-1 bg-dark-bg border border-slate-600 rounded p-2 text-center text-white font-bold text-lg outline-none focus:border-purple-500"
                      value={editQty}
                      onChange={e => setEditQty(Number(e.target.value))}
                    />
                    <button onClick={() => setEditQty(q => q + 1)} className="p-2 bg-slate-700 rounded text-white hover:bg-slate-600">+</button>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 uppercase font-bold block mb-1">Justificativa (Obrigatório)</label>
                <textarea 
                  className="w-full bg-dark-bg border border-slate-600 rounded p-2 text-white outline-none focus:border-purple-500 h-24 resize-none"
                  placeholder="Ex: Contagem física divergiu; Quebra no transporte; Ajuste de entrada..."
                  value={editReason}
                  onChange={e => setEditReason(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={closeEditModal} className="flex-1 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold">
                Cancelar
              </button>
              <button 
                onClick={handleSaveAdjustment} 
                disabled={isSaving}
                className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
              >
                {isSaving ? 'Salvando...' : <><Save size={18}/> Confirmar</>}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
