import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Search, 
  Camera, 
  ShoppingCart, 
  Loader2, 
  AlertCircle, 
  Package, 
  Store 
} from 'lucide-react';

// Definição da interface baseada no seu banco de dados 'estoque'
interface Part {
  id: string;
  name: string;
  code: string;
  brand: string;
  price: number;
  image?: string;
  category?: string;
  stock_quantity?: number;
}

export const PartsSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // Recupera a loja selecionada para dar contexto à busca
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const currentStore = user?.currentStore || { name: 'Loja Padrão' };

  // Busca inicial ao carregar a página
  useEffect(() => {
    handleSearch("");
  }, []);

  const handleSearch = async (term = searchTerm) => {
    setLoading(true);
    try {
      // Faz a chamada para o backend no Render
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
      // Envia para o rodízio de chaves Gemini no Backend
      const response = await api.post('/api/ai/identify', formData);
      const aiData = response.data;
      
      // Preenche o campo de busca com o que a IA identificou
      setSearchTerm(aiData.name);
      handleSearch(aiData.name);
      
      // Feedback visual para o usuário
      console.log(`IA Identificou: ${aiData.name} (${aiData.confidence})`);
    } catch (error) {
      alert("A IA não conseguiu identificar esta imagem. Tente uma foto mais nítida.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Cabeçalho de Contexto */}
      <div className="flex items-center justify-between px-2">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Package className="text-bolt-500" />
          Consulta de Estoque
        </h2>
        <div className="flex items-center gap-2 text-slate-400 text-sm bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700">
          <Store size={14} />
          <span>Buscando em: <strong>{currentStore.name}</strong></span>
        </div>
      </div>

      {/* Barra de Busca e Vision IA */}
      <div className="bg-dark-surface p-6 rounded-2xl border border-slate-700 shadow-xl">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="text"
              placeholder="Pesquise por nome, código original ou fabricante..."
              className="w-full bg-dark-bg border border-slate-600 rounded-xl py-4 pl-14 pr-4 text-white text-lg focus:border-bolt-500 focus:ring-1 focus:ring-bolt-500 outline-none transition-all placeholder:text-slate-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          
          <div className="relative">
            <input 
              type="file" 
              id="vision-upload" 
              className="hidden" 
              accept="image/*"
              onChange={handleImageUpload}
              disabled={analyzing}
            />
            <label 
              htmlFor="vision-upload"
              className={`
                h-full bg-industrial-500 hover:bg-industrial-600 text-black font-bold px-8 py-4 rounded-xl 
                flex items-center gap-3 transition-all active:scale-95 cursor-pointer shadow-lg shadow-industrial-500/10
                ${analyzing ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {analyzing ? <Loader2 className="animate-spin" /> : <Camera size={22} />}
              <span>{analyzing ? 'Analisando...' : 'Vision IA'}</span>
            </label>
          </div>
        </div>
      </div>

      {/* Listagem de Peças */}
      <div className="space-y-4">
        {loading ? (
           <div className="text-center py-20 text-slate-400 flex flex-col items-center">
             <Loader2 className="animate-spin mb-4 text-bolt-500" size={40} />
             <p className="font-medium">Sincronizando com banco de dados...</p>
           </div>
        ) : parts.length === 0 ? (
           <div className="text-center py-20 bg-dark-surface/30 border border-dashed border-slate-700 rounded-2xl">
             <AlertCircle className="mx-auto mb-4 text-slate-600" size={48} />
             <p className="text-slate-400 text-lg">Nenhuma peça encontrada.</p>
             <p className="text-slate-600 text-sm mt-1">Tente ajustar os filtros ou use a busca por foto.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {parts.map((part) => (
              <div 
                key={part.id} 
                className="bg-dark-surface rounded-xl border border-slate-700 p-5 flex flex-col md:flex-row gap-6 hover:border-bolt-500/50 hover:bg-slate-800/40 transition-all group"
              >
                {/* Preview da Peça */}
                <div className="w-full md:w-32 h-32 bg-dark-bg rounded-lg flex items-center justify-center text-slate-700 border border-slate-700 overflow-hidden shrink-0">
                  {part.image ? (
                    <img src={part.image} alt={part.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package size={40} className="opacity-20" />
                  )}
                </div>

                {/* Detalhes Técnicos */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-2">
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-bolt-400 transition-colors truncate">
                        {part.name}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md text-xs font-bold border border-slate-700 uppercase tracking-tighter">
                          {part.brand || 'Genérica'}
                        </span>
                        <span className="bg-slate-900/50 text-slate-500 px-2.5 py-1 rounded-md text-xs font-mono border border-slate-800">
                          REF: {part.code}
                        </span>
                        {part.category && (
                          <span className="bg-bolt-500/10 text-bolt-500 px-2.5 py-1 rounded-md text-xs font-medium border border-bolt-500/20">
                            {part.category}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right w-full md:w-auto mt-2 md:mt-0">
                      <p className="text-2xl font-black text-white">
                        R$ {part.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className={`text-xs font-bold mt-1 ${part.stock_quantity && part.stock_quantity > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {part.stock_quantity && part.stock_quantity > 0 
                          ? `${part.stock_quantity} unidades em estoque` 
                          : 'Sem estoque físico'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botão de Ação */}
                <div className="flex md:flex-col justify-end gap-2 shrink-0">
                  <button className="flex-1 md:flex-none bg-bolt-500 hover:bg-bolt-600 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-bolt-500/10 active:scale-95">
                    <ShoppingCart size={18} />
                    Vender
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
