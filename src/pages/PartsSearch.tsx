import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Search, 
  Camera, 
  ShoppingCart, 
  Loader2, 
  AlertCircle, 
  Package, 
  Store,
  Plus,
  MapPin,
  Check,
  Info
} from 'lucide-react';

// Interface ajustada para o formato do MongoDB
interface StockLocation {
  loja_id: number;
  nome: string; // <--- O Banco usa 'nome', não 'loja'
  qtd: number;
}

interface Part {
  id: string;
  name: string;
  code: string;
  brand: string;
  price: number;
  image?: string;
  category?: string;
  total_stock: number;
  stock_locations: StockLocation[]; 
}

export const PartsSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [addedIds, setAddedIds] = useState<string[]>([]);

  const userStr = localStorage.getItem('technobolt_user') || localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  // Garante comparação numérica e fallback
  const currentStoreId = user?.currentStore?.id ? Number(user.currentStore.id) : 1; 
  const currentStoreName = user?.currentStore?.name || 'Matriz';

  useEffect(() => {
    handleSearch("");
  }, []);

  const handleSearch = async (term = searchTerm) => {
    setLoading(true);
    try {
      const response = await api.get(`/api/parts?q=${term}`);
      setParts(response.data);
    } catch (error) {
      console.error("Erro ao buscar peças:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/api/ai/identify', formData);
      const aiData = response.data;
      setSearchTerm(aiData.name);
      handleSearch(aiData.name);
    } catch (error) {
      alert("A IA não conseguiu identificar esta imagem.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAddToCart = (part: Part, currentStock: number) => {
    if (currentStock <= 0) return;

    const savedCart = localStorage.getItem('technobolt_cart');
    let cart = savedCart ? JSON.parse(savedCart) : [];

    const existingIndex = cart.findIndex((item: any) => item.id === part.id);

    if (existingIndex >= 0) {
      if (cart[existingIndex].cartQty < currentStock) {
        cart[existingIndex].cartQty += 1;
      } else {
        alert("Limite de estoque atingido para este item.");
        return;
      }
    } else {
      cart.push({ ...part, cartQty: 1, maxLocalStock: currentStock });
    }

    localStorage.setItem('technobolt_cart', JSON.stringify(cart));

    setAddedIds(prev => [...prev, part.id]);
    setTimeout(() => {
      setAddedIds(prev => prev.filter(id => id !== part.id));
    }, 2000);
  };

  // --- CORREÇÃO DE LEITURA DO ESTOQUE ---
  const getLocalStock = (part: Part) => {
    // Procura por ID ou pelo Nome da loja (campo 'nome' do banco)
    const storeStock = part.stock_locations?.find(
      loc => Number(loc.loja_id) === currentStoreId || loc.nome === currentStoreName
    );
    return storeStock ? Number(storeStock.qtd) : 0;
  };

  const getOtherStoreAvailability = (part: Part) => {
    const otherStores = part.stock_locations?.filter(
      loc => Number(loc.qtd) > 0 && Number(loc.loja_id) !== currentStoreId
    );
    return otherStores && otherStores.length > 0 ? otherStores[0] : null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      <div className="flex items-center justify-between px-2">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Package className="text-bolt-500" />
          Consulta de Estoque
        </h2>
        <div className="flex items-center gap-2 text-slate-400 text-sm bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700">
          <Store size={14} />
          <span>Loja: <strong>{currentStoreName}</strong> (ID: {currentStoreId})</span>
        </div>
      </div>

      <div className="bg-dark-surface p-6 rounded-2xl border border-slate-700 shadow-xl">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="text"
              placeholder="Pesquise por nome, código ou marca..."
              className="w-full bg-dark-bg border border-slate-600 rounded-xl py-4 pl-14 pr-4 text-white text-lg focus:border-bolt-500 focus:ring-1 focus:ring-bolt-500 outline-none transition-all placeholder:text-slate-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          
          <div className="relative">
            <input type="file" id="vision-upload" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={analyzing} />
            <label 
              htmlFor="vision-upload"
              className={`h-full bg-industrial-500 hover:bg-industrial-600 text-black font-bold px-8 py-4 rounded-xl flex items-center gap-3 transition-all active:scale-95 cursor-pointer shadow-lg shadow-industrial-500/10 ${analyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {analyzing ? <Loader2 className="animate-spin" /> : <Camera size={22} />}
              <span>{analyzing ? 'Analisando...' : 'Vision IA'}</span>
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
           <div className="text-center py-20 text-slate-400 flex flex-col items-center">
             <Loader2 className="animate-spin mb-4 text-bolt-500" size={40} />
             <p className="font-medium">Carregando catálogo...</p>
           </div>
        ) : parts.length === 0 ? (
           <div className="text-center py-20 bg-dark-surface/30 border border-dashed border-slate-700 rounded-2xl">
             <AlertCircle className="mx-auto mb-4 text-slate-600" size={48} />
             <p className="text-slate-400 text-lg">Nenhum item encontrado.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {parts.map((part) => {
              const localStock = getLocalStock(part);
              const totalRede = part.total_stock;
              const otherStore = localStock === 0 ? getOtherStoreAvailability(part) : null;
              const isAdded = addedIds.includes(part.id);

              return (
                <div key={part.id} className="bg-dark-surface rounded-xl border border-slate-700 p-5 flex flex-col md:flex-row gap-6 hover:border-bolt-500/50 transition-all group relative overflow-hidden">
                  
                  {isAdded && (
                    <div className="absolute inset-0 bg-green-500/10 z-10 flex items-center justify-center backdrop-blur-[1px] animate-in fade-in">
                       <div className="bg-green-500 text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2">
                         <Check size={20} /> Adicionado ao PDV
                       </div>
                    </div>
                  )}

                  <div className="w-full md:w-32 h-32 bg-white p-2 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                    <img src={part.image || 'https://via.placeholder.com/150'} alt={part.name} className="w-full h-full object-contain" />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold text-white truncate">{part.name}</h3>
                        <p className="text-2xl font-black text-white">R$ {part.price?.toFixed(2)}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-xs font-bold border border-slate-700 uppercase">{part.brand}</span>
                        <span className="bg-slate-900 text-slate-500 px-2 py-0.5 rounded text-xs font-mono border border-slate-800">{part.code}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
                      <div>
                        {localStock > 0 ? (
                          <div className="space-y-1">
                             <p className="text-emerald-400 font-bold text-sm flex items-center gap-1">
                               <Package size={16} /> {localStock} un. nesta loja
                             </p>
                             {totalRede > localStock && (
                               <p className="text-slate-500 text-xs">Total Rede: {totalRede} un.</p>
                             )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className="text-red-500 font-bold text-sm flex items-center gap-1">
                              <AlertCircle size={16} /> Sem estoque local
                            </p>
                            
                            {otherStore ? (
                              <p className="text-yellow-500 text-xs bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20 flex items-center gap-1">
                                <MapPin size={12} /> Tem na {otherStore.nome} ({otherStore.qtd} un.)
                              </p>
                            ) : totalRede > 0 ? (
                              <p className="text-slate-400 text-xs flex items-center gap-1">
                                <Info size={12} /> {totalRede} un. em outras filiais
                              </p>
                            ) : (
                              <p className="text-slate-600 text-xs">Indisponível em toda rede</p>
                            )}
                          </div>
                        )}
                      </div>

                      <button 
                        onClick={() => handleAddToCart(part, localStock)}
                        disabled={localStock === 0}
                        className={`
                          px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95
                          ${localStock > 0 
                            ? 'bg-bolt-500 hover:bg-bolt-600 text-white shadow-bolt-500/10' 
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'}
                        `}
                      >
                        {localStock > 0 ? (
                          <><Plus size={18} /> Adicionar</>
                        ) : (
                          <><ShoppingCart size={18} /> Indisponível</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
