import { useState } from 'react';
import { Send, Bot, User } from 'lucide-react';
import api from '../services/api';

export const AIChat = () => {
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: 'Olá! Sou seu assistente técnico. Pode me perguntar qualquer coisa sobre peças ou manutenção que eu explico de um jeito fácil.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      // Modificamos a chamada para garantir que o prompt de sistema "humano" seja respeitado no backend
      const promptContext = `Responda como uma pessoa prestativa e amigável, sem usar muitos termos técnicos complicados e sem formatação Markdown excessiva (sem negritos ou listas complexas). Pergunta: ${userMsg}`;
      
      const res = await api.post('/api/ai/consult', { prompt: promptContext });
      setMessages(prev => [...prev, { role: 'ai', text: res.data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Ops, minha conexão falhou rapidinho. Pode perguntar de novo?' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col p-4 max-w-4xl mx-auto">
      <div className="bg-dark-surface rounded-2xl border border-slate-700 flex-1 flex flex-col overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex items-center gap-3">
          <div className="w-10 h-10 bg-industrial-500 rounded-lg flex items-center justify-center text-black">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="text-white font-bold">Consultor Técnico IA</h2>
            <p className="text-slate-400 text-xs">Simples, rápido e direto.</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'ai' ? 'bg-industrial-500 text-black' : 'bg-slate-600 text-white'}`}>
                {msg.role === 'ai' ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div className={`p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed shadow-sm ${msg.role === 'ai' ? 'bg-slate-800 text-slate-200 rounded-tl-none' : 'bg-bolt-600 text-white rounded-tr-none'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && <div className="text-slate-500 text-xs animate-pulse ml-14">Escrevendo...</div>}
        </div>

        <div className="p-4 bg-slate-900 border-t border-slate-700">
          <div className="flex gap-2">
            <input 
              type="text" 
              className="flex-1 bg-dark-bg border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-industrial-500 transition-all"
              placeholder="Ex: Qual óleo vai no Celta 2010?"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend}
              disabled={loading}
              className="bg-industrial-500 hover:bg-industrial-600 text-black p-3 rounded-xl transition-all disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
