import { useState, useEffect } from 'react';
import { ShoppingCart, CreditCard, DollarSign, Smartphone, CheckCircle, Clock, User } from 'lucide-react';
import api from '../services/api';

interface SaleItem {
  name: string;
  quantity: number;
  unit_price: number;
}

interface PendingSale {
  id: string;
  client_name: string;
  seller_name: string;
  total: number;
  created_at: string;
  items: SaleItem[];
}

export const Cashier = () => {
  const [pendingSales, setPendingSales] = useState<PendingSale[]>([]);
  const [selectedSale, setSelectedSale] = useState<PendingSale | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Recupera Loja (Tratamento de ID)
  const getStoreId = (id: any) => {
    if (!id) return 1;
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

  const loadPending = () => {
    api.get(`/api/sales/pending?store_id=${currentStoreId}`)
      .then(res => setPendingSales(res.data))
      .catch(console.error);
  };

  useEffect(() => {
    loadPending();
    const interval = setInterval(loadPending, 5000); // Auto-refresh a cada 5s
    return () => clearInterval(interval);
  }, []);

  const handleFinalize = async () => {
    if (!selectedSale || !paymentMethod) return alert("Selecione a forma de pagamento");
    setIsProcessing(true);
    try {
        await api.post('/api/sales/finalize', {
            sale_id: selectedSale.id,
            payment_method: paymentMethod
        });
        setSuccess(true);
        setTimeout(() => {
            setSuccess(false);
            setSelectedSale(null);
            setPaymentMethod('');
            loadPending();
        }, 3000);
    } catch (err) {
        alert("Erro ao finalizar venda");
    } finally {
        setIsProcessing(false);
    }
  };

  if (success) {
    return (
        <div className="h-full flex flex-col items-center justify-center bg-dark-bg animate-in zoom-in">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/50">
                <CheckCircle className="text-white w-12 h-12" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Pagamento Confirmado!</h1>
            <p className="text-slate-400 text-lg">Estoque atualizado e cupom emitido.</p>
        </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-6 p-2">
      {/* LISTA DE VENDAS PENDENTES */}
      <div className="flex-1 bg-dark-surface rounded-2xl border border-slate-700 p-6 flex flex-col">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="text-yellow-500" /> Aguardando Pagamento
        </h2>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
            {pendingSales.length === 0 && (
                <div className="text-center text-slate-500 py-10">Nenhuma venda pendente no momento.</div>
            )}
            {pendingSales.map(sale => (
                <div 
                    key={sale.id} 
                    onClick={() => { setSelectedSale(sale); setPaymentMethod(''); }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center
                        ${selectedSale?.id === sale.id 
                            ? 'bg-bolt-500/20 border-bolt-500' 
                            : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'}
                    `}
                >
                    <div>
                        <p className="text-white font-bold text-lg">{sale.client_name}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1"><User size={10}/> Vend: {sale.seller_name}</p>
                        <p className="text-xs text-slate-500 mt-1">{new Date(sale.created_at).toLocaleTimeString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xl font-bold text-green-400">R$ {sale.total.toFixed(2)}</p>
                        <p className="text-xs text-slate-500">{sale.items.length} itens</p>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* DETALHES E PAGAMENTO */}
      <div className="w-[450px] bg-dark-surface rounded-2xl border border-slate-700 p-6 flex flex-col shadow-2xl">
        {selectedSale ? (
            <>
                <div className="border-b border-slate-700 pb-4 mb-4">
                    <h3 className="text-lg font-bold text-white">Resumo do Pedido</h3>
                    <p className="text-sm text-slate-400">{selectedSale.client_name}</p>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 mb-4">
                    {selectedSale.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm text-slate-300">
                            <span>{item.quantity}x {item.name}</span>
                            <span className="font-mono">R$ {(item.quantity * item.unit_price).toFixed(2)}</span>
                        </div>
                    ))}
                </div>

                <div className="bg-slate-900 p-4 rounded-xl mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-slate-400">Total a Pagar</span>
                        <span className="text-3xl font-bold text-white">R$ {selectedSale.total.toFixed(2)}</span>
                    </div>
                    
                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Forma de Pagamento</p>
                    <div className="grid grid-cols-3 gap-2">
                        <button onClick={() => setPaymentMethod('CREDITO')} className={`p-2 rounded border flex flex-col items-center gap-1 text-xs font-bold transition-all ${paymentMethod === 'CREDITO' ? 'bg-bolt-500 text-white border-bolt-500' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                            <CreditCard size={18}/> Crédito
                        </button>
                        <button onClick={() => setPaymentMethod('PIX')} className={`p-2 rounded border flex flex-col items-center gap-1 text-xs font-bold transition-all ${paymentMethod === 'PIX' ? 'bg-green-600 text-white border-green-600' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                            <Smartphone size={18}/> PIX
                        </button>
                        <button onClick={() => setPaymentMethod('DINHEIRO')} className={`p-2 rounded border flex flex-col items-center gap-1 text-xs font-bold transition-all ${paymentMethod === 'DINHEIRO' ? 'bg-green-600 text-white border-green-600' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                            <DollarSign size={18}/> Dinheiro
                        </button>
                    </div>
                </div>

                <button 
                    onClick={handleFinalize}
                    disabled={isProcessing || !paymentMethod}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg tracking-wide uppercase flex items-center justify-center gap-2"
                >
                    {isProcessing ? 'Processando...' : <><ShoppingCart size={20}/> Finalizar Venda</>}
                </button>
            </>
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
                <ShoppingCart size={64} className="mb-4" />
                <p className="text-center">Selecione uma venda<br/>para receber o pagamento</p>
            </div>
        )}
      </div>
    </div>
  );
};
