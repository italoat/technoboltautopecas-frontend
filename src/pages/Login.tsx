import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Lock, User, Activity } from 'lucide-react';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/login', { username, password });
      // Salva usuário no navegador
      localStorage.setItem('user', JSON.stringify(res.data));
      navigate('/'); // Vai para o Dashboard
    } catch (err) {
      setError('Usuário ou senha incorretos');
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="bg-dark-surface border border-slate-700 p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-bolt-500 rounded-2xl flex items-center justify-center shadow-lg shadow-bolt-500/20">
             <Activity className="text-white w-10 h-10" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-white text-center mb-2">TechnoBolt Acesso</h2>
        <p className="text-slate-400 text-center mb-6">Entre com suas credenciais corporativas</p>

        {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-4 text-sm text-center">
                {error}
            </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-slate-400 text-sm mb-1">Usuário</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                className="w-full bg-dark-bg border border-slate-700 rounded-lg py-3 pl-10 text-white focus:border-bolt-500 focus:outline-none"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Ex: admin"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-slate-400 text-sm mb-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="password" 
                className="w-full bg-dark-bg border border-slate-700 rounded-lg py-3 pl-10 text-white focus:border-bolt-500 focus:outline-none"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••"
              />
            </div>
          </div>

          <button className="w-full bg-bolt-500 hover:bg-bolt-600 text-white font-bold py-3 rounded-lg transition-all mt-2">
            Entrar no Sistema
          </button>
        </form>
        
        <div className="mt-6 text-center text-xs text-slate-500">
            Login padrão: <strong>admin</strong> / <strong>123</strong>
        </div>
      </div>
    </div>
  );
};
