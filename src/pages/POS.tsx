import { useState, useEffect, useRef } from 'react';
import { Search, ShoppingCart, Trash2, Package, Plus, Minus, User, Percent, Send } from 'lucide-react'; // Removido CheckCircle
import api from '../services/api';

// Interfaces
interface Product {
  id: string;
  name: string;
  code: string;
  brand: string;
  price: number;
  image: string;
  stock_locations?: { loja_id: number; nome: string; qtd: number }[]; 
}

interface CartItem extends Product {
  cartQty: number;
  maxLocalStock: number;
}

export const POS = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // --- NOVOS CAMPOS PARA O CAIXA ---
  const [clientName, setClientName] = useState('Consumidor Final');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // --- HELPER: Tratamento de ID da Loja ---
  const getStoreId = (id: any) => {
    if (typeof id === 'number') return id;
    if (typeof id === 'string') { 
        const match = id.match(/\d+/); 
        return match ? parseInt(match[0], 10) : 1; 
    }
    return 1;
  };

  const userStr = localStorage.getItem('technobolt_user') || localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const currentStoreId = user?.currentStore?.id ? getStoreId(user.currentStore.id) : 1;
  const currentStoreName = user?.currentStore?.name || '';

  // 1. CARREGAR CARRINHO
  useEffect(() => {
    const savedCart = localStorage.getItem('technobolt_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // 2. SALVAR CARRINHO
  useEffect(() => {
    localStorage.setItem('technobolt_cart', JSON.stringify(cart));
  }, [cart]);

  // Busca com Debounce
  useEffect(() => {
    const timeOutId = setTimeout(async () => {
      if (query.length > 2) {
        try {
          const res = await api.get(`/api/parts?q=${query}`);
          setResults(res.data);
        } catch (e) { console.error(e); }
      } else {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(timeOutId);
  }, [query]);

  // Verifica Estoque Local
  const getLocalStock = (product: Product) => {
    const storeStock = product.stock_locations?.find(
      loc => Number(loc.loja_id) === currentStoreId || loc.nome === currentStoreName
    );
    // Força conversão para garantir número
    return storeStock ? parseInt(String(storeStock.qtd), 10) : 0;
  };

  // Adicionar ao Carrinho
  const addToCart = (product: Product) => {
    const stock = getLocalStock(product);

    if (stock <= 0) {
      alert("Produto sem estoque nesta loja.");
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.cartQty < stock) {
          return prev.map(item => item.id === product.id ? { ...item, cartQty: item.cartQty + 1 } : item);
        } else {
          alert("Limite de estoque atingido.");
          return prev;
        }
      }
      return [...prev, { ...product, cartQty: 1, maxLocalStock: stock }];
    });
    setQuery('');
    setResults([]);
    searchInputRef.current?.focus();
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.cartQty + delta;
        if (newQty > 0 && newQty <= item.maxLocalStock) {
          return { ...item, cartQty: newQty };
        }
      }
      return item;
    }));
  };

  // --- CÁLCULOS FINANCEIROS ---
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.cartQty), 0);
  const discountValue = (subtotal * discountPercent) / 100;
  const total = subtotal - discountValue;

  // --- ENVIAR PARA O CAIXA (NOVO FLUXO) ---
  const handleSendToCashier = async () => {
    if (cart.length === 0) return alert('Carrinho vazio');
    
    setIsProcessing(true);
    try {
      const payload = {
        store_id: currentStoreId,
        seller_name: user?.name || "Vendedor",
        client_name: clientName,
        discount_percent: discountPercent,
        items: cart.map(i => ({ 
            part_id: i.id, 
            name: i.name, // Importante para o caixa ler sem consultar o banco de novo
            quantity: i.cartQty, 
            unit_price: i.price 
        })),
        subtotal: subtotal,
        total: total
      };

      await api.post('/api/sales/create', payload);
      
      setSuccess(true);
      setTimeout(() => {
        setCart([]); // Limpa memória
        localStorage.removeItem('technobolt_cart'); // Limpa persistência
        setClientName('Consumidor Final');
        setDiscountPercent(0);
        setSuccess(false);
        setQuery('');
      }, 2500);
      
    } catch (err) {
      alert('Erro ao enviar para o caixa. Verifique a conexão.');
    } finally {
      setIsProcessing(false);
    }
  };

  // TELA DE SUCESSO
  if (success) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-dark-bg animate-in zoom-in duration-300">
        <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_#3b82f6]">
          <Send className="text-white w-12 h-12 ml-1" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">Enviado para o Caixa!</h1>
        <p className="text-slate-400 text-lg">O cliente pode realizar o pagamento no balcão.</p>
        <div className="mt-8 bg-slate-800 p-4 rounded-xl border border-slate-700 min-w-[200px] text-center">
            <p className="text-slate-300 text-sm uppercase font-bold">Total a Receber</p>
            <p className="text-3xl font-mono font-bold text-blue-400">R$ {total.toFixed(2)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-2rem)] flex gap-6 overflow-hidden">
      
      {/* COLUNA ESQUERDA: Busca e Catálogo */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="bg-dark-surface p-6 rounded-2xl border border-slate-700 shadow-lg">
          <label className="text-xs font-bold text-bolt-500 uppercase tracking-widest mb-2 block">
            Adicionar Item (Busca Rápida)
          </label>
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              autoFocus
              className="w-full bg-slate-900 border-2 border-slate-700 focus:border-bolt-500 text-white text-xl p-4 pl-12 rounded-xl outline-none transition-all placeholder:text-slate-600 font-mono"
              placeholder="Digite para buscar..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={24} />
          </div>
        </div>

        {/* Lista de Resultados */}
        <div className="flex-1 bg-dark-surface rounded-2xl border border-slate-700 overflow-y-auto custom-scrollbar p-4">
          {results.length === 0 && !query && (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
              <Package size={64} className="mb-4" />
              <p>Utilize a busca acima para adicionar itens.</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-3">
            {results.map(product => {
               const localStock = getLocalStock(product);
               return (
                <div 
                  key={product.id} 
                  onClick={() => addToCart(product)}
                  className={`group flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-xl transition-all
                    ${localStock > 0 ? 'hover:bg-bolt-500/10 hover:border-bolt-500/50 cursor-pointer' : 'opacity-60 cursor-not-allowed'}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white p-1 rounded-lg">
                      <img src={product.image || 'placeholder.png'} className="w-full h-full object-contain" alt={product.name} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white group-hover:text-bolt-400">{product.name}</h3>
                      <div className="flex gap-3 text-xs text-slate-400">
                        <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded">{product.code}</span>
                        <span>{product.brand}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-400">R$ {product.price.toFixed(2)}</p>
                    <p className={`text-xs ${localStock > 0 ? 'text-slate-500' : 'text-red-500 font-bold'}`}>
                      {localStock > 0 ? `${localStock} em estoque` : 'Sem estoque local'}
                    </p>
                  </div>
                </div>
               );
            })}
          </div>
        </div>
      </div>

      {/* COLUNA DIREITA: PRÉ-VENDA */}
      <div className="w-[420px] flex flex-col bg-dark-surface border border-slate-700 rounded-2xl shadow-2xl h-full">
        <div className="p-5 border-b border-slate-700 bg-slate-800/50 rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center gap-2 text-white font-bold">
            <ShoppingCart className="text-bolt-500" />
            <span>PRÉ-VENDA</span>
          </div>
          <span className="text-xs text-slate-500 font-mono">#{cart.length} itens</span>
        </div>

        {/* INPUT DE CLIENTE */}
        <div className="p-4 border-b border-slate-700 bg-slate-900/30">
            <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1 flex items-center gap-1">
                <User size={10}/> Cliente Identificado
            </label>
            <input 
                type="text" 
                className="w-full bg-dark-bg border border-slate-700 rounded p-2 text-sm text-white focus:border-bolt-500 outline-none transition-colors"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                placeholder="Nome do Cliente (Opcional)"
            />
        </div>

        {/* Lista Editável */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
          {cart.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-slate-600 text-sm italic">
              Adicione itens na busca
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={idx} className="flex flex-col p-3 bg-slate-900/50 rounded-lg border border-slate-800 text-sm">
                <div className="flex justify-between items-start mb-2">
                   <p className="text-white font-medium line-clamp-2 w-48">{item.name}</p>
                   <button onClick={() => removeFromCart(item.id)} className="text-slate-600 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                   </button>
                </div>
                
                <div className="flex justify-between items-center bg-dark-bg p-2 rounded border border-slate-800">
                   <div className="flex items-center gap-3">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-6 h-6 rounded bg-slate-700 text-white flex items-center justify-center hover:bg-slate-600 active:scale-95"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-white font-mono font-bold w-4 text-center">{item.cartQty}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        disabled={item.cartQty >= item.maxLocalStock}
                        className="w-6 h-6 rounded bg-slate-700 text-white flex items-center justify-center hover:bg-slate-600 active:scale-95 disabled:opacity-50"
                      >
                        <Plus size={14} />
                      </button>
                   </div>
                   
                   <div className="text-right">
                      <p className="text-xs text-slate-500">un. R$ {item.price.toFixed(2)}</p>
                      <p className="text-white font-bold">R$ {(item.price * item.cartQty).toFixed(2)}</p>
                   </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totalizadores e Desconto */}
        <div className="bg-slate-900 p-6 border-t-4 border-slate-700">
          <div className="space-y-2 mb-6 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span>R$ {subtotal.toFixed(2)}</span>
            </div>
            
            {/* Campo Desconto (%) */}
            <div className="flex justify-between items-center text-green-400">
              <span className="flex items-center gap-1 font-bold">
                  <Percent size={14}/> Desconto (%)
              </span>
              <input 
                type="number" 
                min="0" 
                max="100" 
                className="w-20 bg-slate-800 border border-slate-600 rounded p-1 text-right text-white focus:border-green-500 outline-none"
                value={discountPercent} 
                onChange={e => setDiscountPercent(Number(e.target.value))} 
              />
            </div>
            
            <div className="flex justify-between text-white text-3xl font-bold pt-2 border-t border-slate-700">
              <span>Total</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
          </div>

          <button 
            onClick={handleSendToCashier}
            disabled={isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg tracking-wide uppercase flex items-center justify-center gap-2"
          >
            {isProcessing ? 'Enviando...' : (
                <>
                    <Send size={20}/> Enviar ao Caixa (F9)
                </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
