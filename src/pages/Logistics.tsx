import { useState, useEffect } from 'react';
import { Truck, ArrowRightLeft, MapPin, Package, Search, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import api from '../services/api';

interface StockLocation {
  loja_id: number;
  nome: string;
  qtd: number;
}

interface Part {
  id: string;
  name: string;
  code: string;
  stock_locations: StockLocation[];
  image: string;
}

export const Logistics = () => {
  // Estados
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [searchResults, setSearchResults] = useState<Part[]>([]);
  
  // Formulário de Transferência
  const [originStore, setOriginStore] = useState<number | null>(null);
  const [destStore, setDestStore] = useState<number | null>(null);
  const [qty, setQty] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Dados do Usuário (Para pré-selecionar destino como loja atual)
  const userStr = localStorage.getItem('technobolt_user') || localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const currentStoreId = user?.currentStore?.id ? Number(user.currentStore.id) : null;

  // Efeito de Busca
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length > 2) {
        try {
          const res = await api.get(`/api/parts?q=${searchTerm}`);
          setSearchResults(res.data);
        } catch (e) { console.error(e); }
      } else {
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Ao selecionar uma peça
  const handleSelectPart = (part: Part) => {
    setSelectedPart(part);
    setSearchTerm(''); // Limpa busca visual
    setSearchResults([]);
    setDestStore(currentStoreId); // Sugere loja atual como destino
    setOriginStore(null);
    setQty(1);
  };

  // Executar Transferência
  const handleTransfer = async () => {
    if (!selectedPart || !originStore || !destStore) return;
    
    setIsProcessing(true);
    try {
      await api.post('/api/logistics/transfer', {
        part_id: selectedPart.id,
        from_store_id: originStore,
        to_store_id: destStore,
        quantity: qty,
        user_id: user?.name || 'Sistema'
      });

      setSuccessMsg(`Transferência de ${qty} itens realizada com sucesso!`);
      
      // Reseta após sucesso
      setTimeout(() => {
        setSuccessMsg('');
        setSelectedPart(null);
      }, 3000);

    } catch (err: any) {
      alert(err.response?.data?.detail || "Erro na transferência");
    } finally {
      setIsProcessing(false);
    }
  };

  // Encontrar nome da loja pelo ID
  const getStoreName = (id: number) => {
    return selectedPart?.stock_locations.find(l => Number(l.loja_id) === id)?.nome || `Loja ${id}`;
  };

  // Máximo permitido na origem selecionada
  const maxQty = originStore && selectedPart 
    ? selectedPart.stock_locations.find(l => Number(l.loja_id) === originStore)?.qtd || 0
    : 0;

  return (
    <div className="p-8 animate-in fade-in duration-500">
      
      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Truck className="text-industrial-500" size={32} />
          Hub de Transferência
        </h1>
        <p className="text-slate-400 mt-1">Movimentação de estoque entre filiais (CD ↔ Loja)</p>
      </div>

      {successMsg ? (
        <div className="bg-green-500/10 border border-green-500 text-green-400 p-8 rounded-2xl flex flex-col items-center justify-center animate-in zoom-in">
          <CheckCircle size={48} className="mb-4" />
          <h2 className="text-2xl font-bold">{successMsg}</h2>
          <p className="text-sm mt-2 opacity-80">O estoque foi atualizado em tempo real.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUNA 1: Seleção de Peça */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-dark-surface p-6 rounded-2xl border border-slate-700 shadow-lg">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 block">1. Selecionar Produto</label>
              
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Nome, código ou SKU..."
                  className="w-full bg-dark-bg border border-slate-600 rounded-xl py-3 pl-12 text-white focus:border-industrial-500 outline-none transition-all"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Lista de Resultados */}
              {searchResults.length > 0 && (
                <div className="mt-4 bg-dark-bg border border-slate-700 rounded-xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
                  {searchResults.map(part => (
                    <div 
                      key={part.id} 
                      onClick={() => handleSelectPart(part)}
                      className="p-3 border-b border-slate-800 hover:bg-slate-800 cursor-pointer flex items-center gap-3 transition-colors"
                    >
                      <img src={part.image} className="w-10 h-10 object-contain bg-white rounded" />
                      <div>
                        <p className="text-sm font-bold text-white truncate w-40">{part.name}</p>
                        <p className="text-xs text-slate-500">{part.code}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Preview da Peça Selecionada */}
            {selectedPart && (
              <div className="bg-industrial-500/10 border border-industrial-500/30 p-4 rounded-2xl flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-lg p-1">
                  <img src={selectedPart.image} className="w-full h-full object-contain" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{selectedPart.name}</p>
                  <p className="text-industrial-500 text-xs font-mono mt-1">{selectedPart.code}</p>
                </div>
              </div>
            )}
          </div>

          {/* COLUNA 2: Configuração da Transferência */}
          <div className="lg:col-span-2">
            {selectedPart ? (
              <div className="bg-dark-surface p-8 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <ArrowRightLeft size={120} className="text-white" />
                </div>

                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <ArrowRightLeft className="text-industrial-500" /> Configurar Movimentação
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center mb-8">
                  
                  {/* ORIGEM */}
                  <div className="bg-dark-bg p-4 rounded-xl border border-slate-700">
                    <label className="text-xs text-slate-500 font-bold uppercase mb-2 block flex items-center gap-2"><MapPin size={12}/> Origem</label>
                    <select 
                      className="w-full bg-transparent text-white outline-none font-medium"
                      value={originStore || ''}
                      onChange={e => setOriginStore(Number(e.target.value))}
                    >
                      <option value="" disabled>Selecione...</option>
                      {selectedPart.stock_locations
                        .filter(l => Number(l.qtd) > 0) // Só mostra lojas com estoque
                        .map(loc => (
                        <option key={loc.loja_id} value={loc.loja_id}>
                          {loc.nome} ({loc.qtd} un.)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* SETA */}
                  <div className="flex justify-center">
                    <div className="bg-slate-700 p-2 rounded-full">
                       <ArrowRight className="text-slate-400" />
                    </div>
                  </div>

                  {/* DESTINO */}
                  <div className="bg-dark-bg p-4 rounded-xl border border-slate-700">
                    <label className="text-xs text-slate-500 font-bold uppercase mb-2 block flex items-center gap-2"><MapPin size={12}/> Destino</label>
                    <select 
                      className="w-full bg-transparent text-white outline-none font-medium"
                      value={destStore || ''}
                      onChange={e => setDestStore(Number(e.target.value))}
                    >
                      <option value="" disabled>Selecione...</option>
                      {/* Lista todas as lojas possíveis (mockado ou extraído da peça) */}
                      {/* Para simplificar, usamos as mesmas da peça, mas idealmente seria uma lista global de lojas */}
                      {selectedPart.stock_locations.map(loc => (
                        <option key={loc.loja_id} value={loc.loja_id} disabled={Number(loc.loja_id) === originStore}>
                          {loc.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Quantidade */}
                <div className="bg-dark-bg p-6 rounded-xl border border-slate-700 mb-8 flex items-center justify-between">
                   <div>
                     <label className="text-xs text-slate-500 font-bold uppercase block">Quantidade a transferir</label>
                     <p className="text-xs text-slate-600 mt-1">Disponível na origem: {maxQty}</p>
                   </div>
                   <div className="flex items-center gap-4">
                      <input 
                        type="range" 
                        min="1" 
                        max={maxQty} 
                        value={qty} 
                        onChange={e => setQty(Number(e.target.value))}
                        className="w-40 accent-industrial-500"
                        disabled={!originStore}
                      />
                      <div className="bg-slate-800 border border-slate-600 px-4 py-2 rounded-lg text-white font-mono font-bold text-xl w-20 text-center">
                        {qty}
                      </div>
                   </div>
                </div>

                {/* Botão Ação */}
                <button 
                  onClick={handleTransfer}
                  disabled={!originStore || !destStore || qty > maxQty || isProcessing}
                  className="w-full bg-industrial-500 hover:bg-industrial-600 text-black font-bold py-4 rounded-xl shadow-lg shadow-industrial-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? 'Processando...' : 'Confirmar Transferência'}
                </button>

              </div>
            ) : (
              <div className="h-full bg-dark-surface/30 border border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center text-slate-500">
                <Package size={64} className="mb-4 opacity-50" />
                <p>Selecione um produto ao lado para iniciar</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
