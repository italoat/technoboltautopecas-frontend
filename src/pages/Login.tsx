import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Lock, User, Activity, Store, ArrowRight, Check } from 'lucide-react';

interface StoreType {
  id: string;
  name: string;
}

export const Login = () => {
  const [step, setStep] = useState(1); // 1 = Credenciais, 2 = Escolher Loja
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [selectedStore, setSelectedStore] = useState<StoreType | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/api/login', { username, password });
      const user = res.data;
      
      setUserData(user);
      
      // Se tiver só uma loja, entra direto. Se tiver mais, vai pro passo 2
      if (user.allowed_stores.length === 1) {
        completeLogin(user, user.allowed_stores[0]);
      } else {
        setStep(2);
        // Pré-seleciona a primeira
        setSelectedStore(user.allowed_stores[0]);
      }
    } catch (err) {
      setError('Credenciais inválidas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const completeLogin = (user: any, store: StoreType) => {
    // Salva tudo que precisamos
    localStorage.setItem('user', JSON.stringify({
      ...user,
      currentStore: store // Salva a loja escolhida no contexto do usuário
    }));
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="bg-dark-surface border border-slate-700 p-8 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
        
        {/* Header Visual */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-bolt-500 rounded-2xl flex items-center justify-center shadow-lg shadow-bolt-500/20">
             <Activity className="text-white w-10 h-10" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-white text-center mb-1">
          {step === 1 ? 'TechnoBolt Acesso' : 'Selecione a Loja'}
        </h2>
        <p className="text-slate-400 text-center mb-8">
          {step === 1 ? 'Sistema de Gestão Integrada' : `Olá, ${userData?.name}. Onde vamos trabalhar hoje?`}
        </p>

        {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm text-center">
                {error}
            </div>
        )}

        {/* PASSO 1: LOGIN */}
        {step === 1 && (
          <form onSubmit={handleAuth} className="space-y-5 animate-in fade-in slide-in-from-right-8 duration-300">
            <div>
              <label className="block text-slate-400 text-sm mb-1.5 font-medium">Usuário Corporativo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  className="w-full bg-dark-bg border border-slate-700 rounded-lg py-3 pl-10 text-white focus:border-bolt-500 focus:outline-none transition-all focus:ring-1 focus:ring-bolt-500"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Ex: admin"
                  autoFocus
                />
              </div>
            </div>
            
            <div>
              <label className="block text-slate-400 text-sm mb-1.5 font-medium">Senha de Acesso</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="password" 
                  className="w-full bg-dark-bg border border-slate-700 rounded-lg py-3 pl-10 text-white focus:border-bolt-500 focus:outline-none transition-all focus:ring-1 focus:ring-bolt-500"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••"
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-bolt-500 hover:bg-bolt-600 disabled:opacity-70 text-white font-bold py-3.5 rounded-lg transition-all mt-4 flex items-center justify-center gap-2"
            >
              {loading ? 'Validando...' : (
                <>
                  Continuar <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        )}

        {/* PASSO 2: SELEÇÃO DE LOJA */}
        {step === 2 && userData && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
            <div className="grid gap-3">
              {userData.allowed_stores.map((store: StoreType) => (
                <button
                  key={store.id}
                  onClick={() => setSelectedStore(store)}
                  className={`
                    flex items-center gap-4 p-4 rounded-xl border transition-all text-left group
                    ${selectedStore?.id === store.id 
                      ? 'bg-bolt-500/10 border-bolt-500 shadow-[0_0_15px_rgba(14,165,233,0.15)]' 
                      : 'bg-dark-bg border-slate-700 hover:border-slate-500'}
                  `}
                >
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors
                    ${selectedStore?.id === store.id ? 'bg-bolt-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'}
                  `}>
                    <Store size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${selectedStore?.id === store.id ? 'text-bolt-400' : 'text-white'}`}>
                      {store.name}
                    </h3>
                    <p className="text-xs text-slate-500">ID: {store.id}</p>
                  </div>
                  {selectedStore?.id === store.id && (
                    <div className="w-6 h-6 bg-bolt-500 rounded-full flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <button 
              onClick={() => selectedStore && completeLogin(userData, selectedStore)}
              className="w-full bg-bolt-500 hover:bg-bolt-600 text-white font-bold py-3.5 rounded-lg transition-all mt-6 shadow-lg shadow-bolt-500/20"
            >
              Acessar Painel
            </button>
            
            <button 
              onClick={() => { setStep(1); setPassword(''); }}
              className="w-full text-slate-500 text-sm hover:text-white py-2"
            >
              Voltar / Trocar Usuário
            </button>
          </div>
        )}
        
        {step === 1 && (
          <div className="mt-8 text-center text-xs text-slate-500">
             &copy; 2026 TechnoBolt Systems. Acesso Restrito.
          </div>
        )}
      </div>
    </div>
  );
};
