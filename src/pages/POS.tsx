import { useState, useEffect, useRef } from 'react';
import { Search, ShoppingCart, Trash2, CreditCard, DollarSign, Smartphone, CheckCircle, Package } from 'lucide-react';
import api from '../services/api';
// useNavigate removido pois não estava sendo usado

// Tipos
interface Product {
  id: string;
  name: string;
  code: string;
  brand: string;
  price: number;
  quantity: number; // Estoque total
  image: string;    // <--- CORREÇÃO: Adicionado campo imagem
}

interface CartItem extends Product {
  cartQty: number;
}

export const POS = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Recupera Loja Atual
  const userStr = localStorage.getItem('technobolt_user') || localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const currentStoreId = user?.currentStore?.id || 1; 

  // Busca em tempo real (Debounce simples)
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

  // Adicionar ao Carrinho
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id 
          ? { ...item, cartQty: item.cartQty + 1 } 
          : item
        );
      }
      return [...prev, { ...product, cartQty: 1 }];
    });
    setQuery(''); // Limpa busca para o próximo item
    setResults([]);
    searchInputRef.current?.focus();
  };

  // Remover do Carrinho
  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Cálculos
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.cartQty), 0);
  const discount = paymentMethod === 'pix' || paymentMethod === 'cash' ? subtotal * 0.05 : 0; // 5% desconto à vista
  const total = subtotal - discount;

  // Finalizar Venda
  const handleCheckout = async () => {
    if (!paymentMethod) return alert('Selecione uma forma de pagamento');
    if (cart.length === 0) return alert('Carrinho vazio');
    
    setIsProcessing(true);
    try {
      const payload = {
        store_id: typeof currentStoreId === 'string' ? parseInt(currentStoreId) : currentStoreId,
        items: cart.map(i => ({ part_id: i.id, quantity: i.cartQty, unit_price: i.price })),
        payment_method: paymentMethod,
        total: total
      };

      await api.post('/api/sales/checkout', payload);
      
      setSuccess(true);
      setTimeout(() => {
        setCart([]);
        setPaymentMethod('');
        setSuccess(false);
        setQuery('');
      }, 3000); // 3 segundos de tela de sucesso
      
    } catch (err) {
      alert('Erro ao processar venda. Verifique a conexão.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Tela de Sucesso (Pós Venda)
  if (success) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-dark-bg animate-in fade-in zoom-in duration-300">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_#22c55e]">
          <CheckCircle className="text-white w-12 h-12" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">Venda Realizada!</h1>
        <p className="text-slate-400 text-lg">Estoque atualizado e nota emitida.</p>
        <div className="mt-8 bg-slate-800 p-4 rounded-xl border border-slate-700">
            <p className="text-slate-300">Troco / Valor Final</p>
            <p className="text-3xl font-mono font-bold text-green-400">R$ {total.toFixed(2)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-2rem)] flex gap-6 overflow-hidden">
      
      {/* COLUNA ESQUERDA: Busca e Catálogo */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Barra de Busca Industrial */}
        <div className="bg-dark-surface p-6 rounded-2xl border border-slate-700 shadow-lg">
          <label className="text-xs font-bold text-bolt-500 uppercase tracking-widest mb-2 block">
            Pesquisar Produto (Nome, Código ou Barras)
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
              <p>Aguardando busca...</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-3">
            {results.map(product => (
              <div 
                key={product.id} 
                onClick={() => addToCart(product)}
                className="group flex items-center justify-between p-4 bg-slate-800/50 hover:bg-bolt-500/10 border border-slate-700 hover:border-bolt-500/50 rounded-xl cursor-pointer transition-all"
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
                  <p className="text-xs text-slate-500">{product.quantity} em estoque</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* COLUNA DIREITA: Cupom e Pagamento */}
      <div className="w-[400px] flex flex-col bg-dark-surface border border-slate-700 rounded-2xl shadow-2xl h-full">
        {/* Cabeçalho do Cupom */}
        <div className="p-5 border-b border-slate-700 bg-slate-800/50 rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center gap-2 text-white font-bold">
            <ShoppingCart className="text-bolt-500" />
            <span>CUPOM FISCAL</span>
          </div>
          <span className="text-xs text-slate-500 font-mono">#{Math.floor(Math.random() * 99999)}</span>
        </div>

        {/* Lista de Itens do Carrinho */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {cart.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-slate-600 text-sm italic">
              Seu carrinho está vazio
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg border border-slate-800 text-sm">
                <div className="flex-1">
                   <p className="text-white truncate w-48 font-medium">{item.name}</p>
                   <p className="text-xs text-slate-500 font-mono">
                     {item.cartQty}x R$ {item.price.toFixed(2)}
                   </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white font-bold">R$ {(item.price * item.cartQty).toFixed(2)}</span>
                  <button onClick={() => removeFromCart(item.id)} className="text-slate-600 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Resumo e Pagamento */}
        <div className="bg-slate-900 p-6 border-t-4 border-slate-700">
          <div className="space-y-2 mb-6 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span>R$ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-green-400">
              <span>Descontos</span>
              <span>- R$ {discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white text-3xl font-bold pt-2 border-t border-slate-700">
              <span>Total</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
          </div>

          <p className="text-xs font-bold text-slate-500 uppercase mb-2">Método de Pagamento</p>
          <div className="grid grid-cols-3 gap-2 mb-6">
            <button 
              onClick={() => setPaymentMethod('credit')}
              className={`p-3 rounded-lg border flex flex-col items-center gap-1 transition-all ${paymentMethod === 'credit' ? 'bg-bolt-500 text-white border-bolt-500' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}
            >
              <CreditCard size={20} /> <span className="text-[10px]">Crédito</span>
            </button>
            <button 
              onClick={() => setPaymentMethod('pix')}
              className={`p-3 rounded-lg border flex flex-col items-center gap-1 transition-all ${paymentMethod === 'pix' ? 'bg-green-600 text-white border-green-600' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}
            >
              <Smartphone size={20} /> <span className="text-[10px]">PIX (-5%)</span>
            </button>
            <button 
              onClick={() => setPaymentMethod('cash')}
              className={`p-3 rounded-lg border flex flex-col items-center gap-1 transition-all ${paymentMethod === 'cash' ? 'bg-green-600 text-white border-green-600' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}
            >
              <DollarSign size={20} /> <span className="text-[10px]">Dinheiro</span>
            </button>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={isProcessing}
            className="w-full bg-bolt-500 hover:bg-bolt-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-bolt-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg tracking-wide uppercase"
          >
            {isProcessing ? 'Processando...' : 'Finalizar Venda (F9)'}
          </button>
        </div>
      </div>
    </div>
  );
};
