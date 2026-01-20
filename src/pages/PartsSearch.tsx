import React, { useState } from 'react';
import { Search, Camera, Copy, ShoppingCart, CheckCircle, XCircle, ArrowRightLeft, Info } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock Data
const MOCK_RESULTS = [
  {
    id: 1,
    name: "Pastilha de Freio Dianteira Cerâmica",
    code_internal: "PD-4050",
    code_original: "5U0698151A",
    brand: "Bosch",
    price: 145.90,
    compatibility: ["Gol G5 1.0/1.6", "Voyage 2012+", "Saveiro Cross 2014"],
    cross_reference: [
      { brand: "Fras-le", code: "PD/58", available: true },
      { brand: "Cobreq", code: "N-252", available: false },
      { brand: "TRW", code: "RCPT02890", available: true }
    ],
    stock: {
      current_store: 4,
      network: { "Taguatinga": 0, "Asa Norte": 2, "Guará": 5 }
    },
    image: "https://placehold.co/400x400/222/white?text=Freio" // Placeholder
  },
  {
    id: 2,
    name: "Disco de Freio Ventilado",
    code_internal: "DF-2020",
    code_original: "5U0615301",
    brand: "Fremax",
    price: 189.50,
    compatibility: ["Gol G5", "Voyage", "Saveiro"],
    cross_reference: [
      { brand: "Hipper Freios", code: "HF-23", available: true }
    ],
    stock: {
      current_store: 0,
      network: { "Taguatinga": 8, "Asa Norte": 4, "Guará": 2 }
    },
    image: "https://placehold.co/400x400/222/white?text=Disco" 
  }
];

export const PartsSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Search Header */}
      <div className="bg-dark-surface p-8 rounded-2xl border border-slate-700 shadow-xl">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
            <input 
              type="text"
              placeholder="Digite: Código original, código fabricante, nome ou veículo..."
              className="w-full bg-dark-bg border border-slate-600 rounded-xl py-4 pl-14 pr-4 text-white text-lg focus:border-bolt-500 focus:ring-1 focus:ring-bolt-500 outline-none transition-all shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <button className="bg-industrial-500 hover:bg-industrial-600 text-black font-bold px-8 py-4 rounded-xl flex items-center gap-3 transition-transform active:scale-95 shadow-lg shadow-industrial-500/20">
            <Camera size={22} />
            <span>Vision IA</span>
          </button>
        </div>
        
        {/* Quick Filters */}
        <div className="flex gap-2 mt-6 overflow-x-auto pb-2 scrollbar-hide">
          <span className="text-sm text-slate-500 py-1.5 mr-2 self-center">Filtros Rápidos:</span>
          {['Freios', 'Suspensão', 'Motor', 'Elétrica', 'Arrefecimento', 'Acessórios'].map(tag => (
            <button key={tag} className="px-4 py-1.5 rounded-full bg-slate-800 text-slate-300 text-sm hover:bg-slate-700 hover:text-white border border-slate-700 transition-colors whitespace-nowrap">
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {MOCK_RESULTS.map((part) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={part.id}
            className={`
                bg-dark-surface rounded-xl border p-5 flex flex-col lg:flex-row gap-6 transition-all group hover:shadow-xl
                ${part.stock.current_store === 0 ? 'border-red-500/30' : 'border-slate-700 hover:border-bolt-500/50'}
            `}
          >
            {/* Image Section */}
            <div className="w-full lg:w-48 h-48 bg-white rounded-lg flex-shrink-0 relative overflow-hidden border border-slate-600">
                <img src={part.image} alt={part.name} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm">
                    Ref: {part.code_internal}
                </div>
            </div>

            {/* Info Section */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold text-white group-hover:text-bolt-400 transition-colors truncate">{part.name}</h3>
                            <div className="flex flex-wrap gap-2 text-sm mt-2">
                                <span className="text-slate-300 bg-slate-700/50 border border-slate-600 px-2 py-0.5 rounded flex items-center gap-1">
                                    <span className="text-slate-500">Fab:</span> {part.brand}
                                </span>
                                <span className="text-slate-300 bg-slate-700/50 border border-slate-600 px-2 py-0.5 rounded flex items-center gap-1">
                                    <span className="text-slate-500">Orig:</span> {part.code_original}
                                </span>
                            </div>
                        </div>
                        <div className="text-right ml-4">
                            <div className="text-3xl font-bold text-bolt-400">R$ {part.price.toFixed(2)}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wide">Preço Unitário</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                        {/* Compatibility Box */}
                        <div className="bg-dark-bg/50 p-3 rounded-lg border border-slate-700/50">
                            <div className="flex items-center gap-2 mb-2">
                                <Info size={14} className="text-bolt-500" />
                                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Aplicações Principais</p>
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed">{part.compatibility.join(', ')}</p>
                        </div>

                        {/* Stock Box */}
                        <div className="bg-dark-bg/50 p-3 rounded-lg border border-slate-700/50">
                             <div className="flex items-center gap-2 mb-2">
                                <ArrowRightLeft size={14} className="text-industrial-500" />
                                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Estoque Rede</p>
                            </div>
                             <div className="flex flex-wrap gap-2">
                                <span className={`text-sm px-2 py-1 rounded font-bold border ${part.stock.current_store > 0 ? 'border-success-500/30 bg-success-500/10 text-success-500' : 'border-red-500/30 bg-red-500/10 text-red-500'}`}>
                                    Loja Atual: {part.stock.current_store}
                                </span>
                                {Object.entries(part.stock.network).map(([loja, qtd]) => (
                                    <span key={loja} className="text-sm px-2 py-1 rounded border border-slate-700 text-slate-400 bg-slate-800">
                                        {loja}: {qtd as number}
                                    </span>
                                ))}
                             </div>
                        </div>
                    </div>
                </div>

                {/* Cross Reference Footer */}
                <div className="mt-4 pt-3 border-t border-slate-700/50 flex flex-wrap items-center gap-3">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Similares:</span>
                    {part.cross_reference.map((ref: any) => (
                        <div key={ref.code} className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded border ${ref.available ? 'border-green-900 bg-green-900/20 text-green-400' : 'border-slate-700 bg-slate-800/50 text-slate-500 opacity-60'}`}>
                            {ref.available ? <CheckCircle size={10} /> : <XCircle size={10}/>}
                            <span className="font-medium">{ref.brand}</span>
                            <span className="opacity-75">{ref.code}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Actions Column */}
            <div className="flex flex-col gap-3 justify-center border-l border-slate-700 pl-6 lg:w-48">
                <button className="bg-bolt-500 hover:bg-bolt-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-bolt-500/20 active:scale-95">
                    <ShoppingCart size={18} />
                    Adicionar
                </button>
                <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2.5 px-4 rounded-lg border border-slate-700 flex items-center justify-center gap-2 transition-colors">
                    <Copy size={16} />
                    Orçamento
                </button>
                <div className="text-center mt-1">
                   <a href="#" className="text-xs text-industrial-500 hover:text-industrial-400 underline transition-colors">Verificar Tributos (NCM)</a>
                </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
