import { useState, useEffect } from 'react';
import { Truck, ArrowRightLeft, MapPin, Package, Search, CheckCircle, ArrowRight, Clock, XCircle, Box, User, AlertCircle } from 'lucide-react';
import api from '../services/api';

// Tipos
interface Transfer {
  id: string;
  part_name: string;
  part_image: string;
  from_store_id: number;
  to_store_id: number;
  quantity: number;
  type: 'ENTREGA' | 'RETIRADA';
  status: 'PENDENTE' | 'SEPARACAO' | 'TRANSITO' | 'CONCLUIDO' | 'REJEITADO';
  created_at: string;
}

export const Logistics = () => {
  const [activeTab, setActiveTab] = useState<'request' | 'incoming' | 'outgoing'>('request');
  
  // Estado para Nova Solicitação
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPart, setSelectedPart] = useState<any | null>(null);
  const [originStore, setOriginStore] = useState<number | null>(null);
  const [reqType, setReqType] = useState<'ENTREGA' | 'RETIRADA'>('ENTREGA');
  const [qty, setQty] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Estado para Listas
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [refresh, setRefresh] = useState(0); // Trigger para recarregar

  // User Info
  const userStr = localStorage.getItem('technobolt_user') || localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const currentStoreId = user?.currentStore?.id ? Number(user.currentStore.id) : 1;

  // Carregar Listas
  useEffect(() => {
    if (activeTab !== 'request') {
      api.get(`/api/logistics/list?store_id=${currentStoreId}`)
        .then(res => setTransfers(res.data))
        .catch(console.error);
    }
  }, [activeTab, refresh, currentStoreId]);

  // Busca de Peças
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length > 2) {
        try {
          const res = await api.get(`/api/parts?q=${searchTerm}`);
          setSearchResults(res.data);
        } catch (e) { console.error(e); }
      } else { setSearchResults([]); }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // --- AÇÕES ---

  const handleCreateRequest = async () => {
    if (!selectedPart || !originStore) return;
    setIsProcessing(true);
    try {
      await api.post('/api/logistics/request', {
        part_id: selectedPart.id,
        from_store_id: originStore,
        to_store_id: currentStoreId,
        quantity: qty,
        type: reqType,
        user_id: user.name
      });
      setSuccessMsg('Solicitação enviada com sucesso!');
      setTimeout(() => {
        setSuccessMsg('');
        setSelectedPart(null);
        setSearchTerm('');
        setActiveTab('outgoing'); // Vai para aba de "Meus Pedidos"
      }, 2000);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Erro ao criar pedido");
    } finally { setIsProcessing(false); }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    if(!window.confirm(`Deseja alterar status para ${newStatus}?`)) return;
    try {
      await api.post('/api/logistics/update-status', {
        transfer_id: id,
        new_status: newStatus,
        user_id: user.name
      });
      setRefresh(prev => prev + 1);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Erro ao atualizar");
    }
  };

  // Filtros de Lista
  const myIncomingOrders = transfers.filter(t => t.to_store_id === currentStoreId); // O que eu pedi (Chegando)
  const myOutgoingTasks = transfers.filter(t => t.from_store_id === currentStoreId); // O que pediram de mim (Saindo)

  // Renderizadores de Status
  const renderStatus = (status: string) => {
    switch (status) {
      case 'PENDENTE': return <span className="bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><Clock size={12}/> Pendente Aprovação</span>;
      case 'SEPARACAO': return <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><Box size={12}/> Em Separação</span>;
      case 'TRANSITO': return <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><Truck size={12}/> Em Trânsito</span>;
      case 'CONCLUIDO': return <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><CheckCircle size={12}/> Recebido / Concluído</span>;
      case 'REJEITADO': return <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><XCircle size={12}/> Rejeitado</span>;
      default: return status;
    }
  };

  return (
    <div className="p-6 animate-in fade-in duration-500">
      
      {/* Header e Abas */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ArrowRightLeft className="text-industrial-500" /> Logística & Transferência
          </h1>
          <p className="text-slate-400 text-sm">Gerencie o fluxo de estoque entre filiais</p>
        </div>
        
        <div className="flex bg-slate-800 p-1 rounded-lg">
          <button onClick={() => setActiveTab('request')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'request' ? 'bg-bolt-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
            Nova Solicitação
          </button>
          <button onClick={() => setActiveTab('outgoing')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'outgoing' ? 'bg-bolt-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
             Meus Pedidos ({myIncomingOrders.filter(t => t.status !== 'CONCLUIDO' && t.status !== 'REJEITADO').length})
          </button>
          <button onClick={() => setActiveTab('incoming')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'incoming' ? 'bg-industrial-500 text-black shadow' : 'text-slate-400 hover:text-white'}`}>
             Pedidos de Outros ({myOutgoingTasks.filter(t => t.status === 'PENDENTE' || t.status === 'SEPARACAO').length})
          </button>
        </div>
      </div>

      {/* --- ABA 1: NOVA SOLICITAÇÃO --- */}
      {activeTab === 'request' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Busca */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-dark-surface p-5 rounded-xl border border-slate-700">
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Buscar Peça</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="text" 
                  placeholder="Nome ou código..."
                  className="w-full bg-dark-bg border border-slate-600 rounded-lg py-2 pl-10 text-white focus:border-industrial-500 outline-none"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              {searchResults.length > 0 && (
                <div className="mt-2 bg-dark-bg border border-slate-700 rounded-lg overflow-hidden max-h-48 overflow-y-auto custom-scrollbar">
                  {searchResults.map(part => (
                    <div key={part.id} onClick={() => { setSelectedPart(part); setSearchResults([]); setOriginStore(null); }} className="p-2 border-b border-slate-800 hover:bg-slate-800 cursor-pointer flex items-center gap-2">
                      <img src={part.image} className="w-8 h-8 object-contain bg-white rounded" />
                      <div className="truncate">
                        <p className="text-xs font-bold text-white">{part.name}</p>
                        <p className="text-[10px] text-slate-500">{part.code}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Preview Peça Selecionada */}
            {selectedPart && (
               <div className="bg-industrial-500/10 border border-industrial-500/30 p-4 rounded-xl flex gap-3 animate-in fade-in">
                 <img src={selectedPart.image} className="w-16 h-16 bg-white rounded object-contain" />
                 <div>
                   <p className="font-bold text-white text-sm line-clamp-2">{selectedPart.name}</p>
                   <p className="text-xs text-industrial-500 font-mono mt-1">{selectedPart.code}</p>
                 </div>
               </div>
            )}
          </div>

          {/* Configuração */}
          <div className="lg:col-span-2">
            {selectedPart ? (
               <div className="bg-dark-surface p-6 rounded-xl border border-slate-700">
                  <h2 className="text-lg font-bold text-white mb-4">Configurar Pedido</h2>
                  
                  {successMsg ? (
                    <div className="bg-green-500/20 text-green-400 p-4 rounded-lg text-center font-bold">{successMsg}</div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                           <label className="text-xs text-slate-500 font-bold uppercase block mb-1">Origem (Onde buscar)</label>
                           <select className="w-full bg-dark-bg border border-slate-600 text-white p-2 rounded" onChange={e => setOriginStore(Number(e.target.value))} value={originStore || ''}>
                              <option value="">Selecione a loja...</option>
                              {selectedPart.stock_locations.filter((l:any) => Number(l.qtd) > 0 && Number(l.loja_id) !== currentStoreId).map((l:any) => (
                                <option key={l.loja_id} value={l.loja_id}>{l.nome} (Qtd: {l.qtd})</option>
                              ))}
                           </select>
                        </div>
                        <div>
                           <label className="text-xs text-slate-500 font-bold uppercase block mb-1">Tipo de Pedido</label>
                           <div className="flex bg-dark-bg rounded p-1 border border-slate-600">
                             <button onClick={() => setReqType('ENTREGA')} className={`flex-1 text-xs py-1.5 rounded font-bold ${reqType === 'ENTREGA' ? 'bg-bolt-500 text-white' : 'text-slate-400'}`}>Solicitar Peça (Entrega)</button>
                             <button onClick={() => setReqType('RETIRADA')} className={`flex-1 text-xs py-1.5 rounded font-bold ${reqType === 'RETIRADA' ? 'bg-industrial-500 text-black' : 'text-slate-400'}`}>Retirar em Loja</button>
                           </div>
                        </div>
                      </div>

                      <div className="mb-6">
                         <label className="text-xs text-slate-500 font-bold uppercase block mb-1">Quantidade</label>
                         <div className="flex items-center gap-4">
                           <input type="range" min="1" max={originStore ? selectedPart.stock_locations.find((l:any) => Number(l.loja_id) === originStore)?.qtd : 1} value={qty} onChange={e => setQty(Number(e.target.value))} className="flex-1 accent-bolt-500" disabled={!originStore} />
                           <span className="text-2xl font-bold text-white w-12 text-center">{qty}</span>
                         </div>
                      </div>

                      <button onClick={handleCreateRequest} disabled={!originStore || isProcessing} className="w-full bg-bolt-500 hover:bg-bolt-600 text-white font-bold py-3 rounded-lg shadow-lg shadow-bolt-500/20 disabled:opacity-50 transition-all">
                        {isProcessing ? 'Processando...' : 'Confirmar Solicitação'}
                      </button>
                    </>
                  )}
               </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
                <Package size={48} className="opacity-30 mb-2"/>
                <p>Selecione um produto ao lado</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- ABA 2: MEUS PEDIDOS (OUTGOING) --- */}
      {activeTab === 'outgoing' && (
        <div className="space-y-3">
           {myIncomingOrders.length === 0 && <p className="text-slate-500 text-center py-10">Você não fez nenhum pedido ainda.</p>}
           
           {myIncomingOrders.map(t => (
             <div key={t.id} className="bg-dark-surface p-4 rounded-xl border border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src={t.part_image} className="w-12 h-12 bg-white rounded object-contain" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-bold">{t.part_name}</span>
                      <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-300">Qtd: {t.quantity}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                       <ArrowRight size={12}/> Pedido para Loja {t.from_store_id}
                       <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                       <span>Tipo: {t.type}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                   {renderStatus(t.status)}
                   
                   {/* Ação de Recebimento */}
                   {t.status === 'TRANSITO' && t.type === 'ENTREGA' && (
                      <button onClick={() => handleUpdateStatus(t.id, 'CONCLUIDO')} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg shadow-green-500/20 animate-pulse">
                         Confirmar Recebimento
                      </button>
                   )}
                </div>
             </div>
           ))}
        </div>
      )}

      {/* --- ABA 3: PEDIDOS DE OUTROS (INCOMING) --- */}
      {activeTab === 'incoming' && (
        <div className="space-y-3">
           {myOutgoingTasks.length === 0 && <p className="text-slate-500 text-center py-10">Nenhum pedido de outra loja para você.</p>}

           {myOutgoingTasks.map(t => (
             <div key={t.id} className="bg-dark-surface p-4 rounded-xl border border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src={t.part_image} className="w-12 h-12 bg-white rounded object-contain" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-bold">{t.part_name}</span>
                      <span className="text-xs bg-industrial-500 text-black font-bold px-2 py-0.5 rounded">Solicitado: {t.quantity}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                       <User size={12}/> Loja {t.to_store_id} solicitou
                       <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                       <span className={t.type === 'RETIRADA' ? 'text-industrial-400 font-bold' : ''}>Modo: {t.type}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                   {/* Botões de Ação para a Loja de Origem */}
                   
                   {t.status === 'PENDENTE' && (
                     <>
                       <button onClick={() => handleUpdateStatus(t.id, 'REJEITADO')} className="px-3 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-bold">
                         Rejeitar
                       </button>
                       <button onClick={() => handleUpdateStatus(t.id, 'APROVADO')} className="px-4 py-2 rounded-lg bg-bolt-500 hover:bg-bolt-600 text-white text-xs font-bold shadow-lg shadow-bolt-500/20">
                         {t.type === 'RETIRADA' ? 'Aprovar Retirada (Baixar Estoque)' : 'Aprovar & Separar'}
                       </button>
                     </>
                   )}

                   {t.status === 'SEPARACAO' && t.type === 'ENTREGA' && (
                     <button onClick={() => handleUpdateStatus(t.id, 'TRANSITO')} className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2">
                       <Truck size={14}/> Enviar para Trânsito
                     </button>
                   )}

                   {/* Status Estáticos */}
                   {(t.status === 'CONCLUIDO' || t.status === 'REJEITADO' || t.status === 'TRANSITO') && renderStatus(t.status)}
                </div>
             </div>
           ))}
        </div>
      )}
    </div>
  );
};
