import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, Camera, ShoppingCart, Loader2, AlertCircle } from 'lucide-react';

interface Part {
  id: string;
  name: string;
  code: string;
  brand: string;
  price: number;
  image?: string;
  stock?: any;
}

export const PartsSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // Busca inicial
  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async (term = searchTerm) => {
    setLoading(true);
    try {
      const response = await api.get(`/api/parts?q=${term}`);
      setParts(response.data);
    } catch (error) {
      console.error("Erro ao buscar peças", error);
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
      
      // Preenche a busca com o nome identificado pela IA
      setSearchTerm(aiData.name);
      handleSearch(aiData.name);
      alert(`Peça identificada: ${aiData.name}\nConfiança: ${aiData.confidence}`);
    } catch (error) {
      alert("Erro ao analisar imagem. Tente novamente.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Barra de Busca e Upload */}
      <div className="bg-dark-surface p-8 rounded-2xl border border-slate-700 shadow-xl relative">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
            <input 
              type="text"
              placeholder="Digite nome, código ou marca..."
              className="w-full bg-dark-bg border border-slate-600 rounded-xl py-4 pl-14 pr-4 text-white text-lg focus:border-bolt-500 focus:outline-none focus:ring-1 focus:ring-bolt-500 transition-all"
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
              className={`bg-industrial-500 hover:bg-industrial-600 text-black font-bold px-8 py-4 rounded-xl flex items-center gap-3 transition-transform active:scale-95 cursor-pointer ${analyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {analyzing ? <Loader2 className="animate-spin" /> : <Camera size={22} />}
              <span>{analyzing ? 'Analisando...' : 'Vision IA'}</span>
            </label>
          </div>
        </div>
      </div>

      {/* Lista de Resultados */}
      <div className="space-y-4">
        {loading ? (
           <div className="text-center py-10 text-slate-400 flex flex-col items-center">
             <Loader2 className="animate-spin mb-2" size={30} />
             Carregando estoque...
           </div>
        ) : parts.length === 0 ? (
           <div className="text-center py-10 text-slate-500 border border-dashed border-slate-700 rounded-xl">
             <AlertCircle className="mx-auto mb-2 opacity-50" size={40} />
             Nenhuma peça encontrada no banco de dados.
           </div>
        ) : (
          parts.map((part) => (
            <div key={part.id} className="bg-dark-surface rounded-xl border border-slate-700 p-5 flex flex-col md:flex-row gap-6 hover:border-bolt-500 transition-colors">
              <div className="w-full md:w-32 h-32 bg-white/5 rounded-lg flex items-center justify-center text-slate-500 text-xs">
                {part.image ? <img src={part.image} className="w-full h-full object-cover rounded-lg"/> : "Sem Foto"}
              </div>

              <div className="flex-1">
                <div className="flex justify-between">
                    <h3 className="text-xl font-bold text-white">{part.name}</h3>
                    <span className="text-2xl font-bold text-bolt-400">R$ {part.price?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex gap-2 mt-2">
                    <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs border border-slate-700">Marca: {part.brand || 'Genérica'}</span>
                    <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs border border-slate-700">Cód: {part.code}</span>
                </div>
              </div>

              <button className="bg-bolt-500 hover:bg-bolt-600 text-white px-6 rounded-lg font-medium self-end md:self-center py-3 flex items-center gap-2">
                <ShoppingCart size={18} /> Adicionar
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
