import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, RefreshCcw } from 'lucide-react';
import api from '../services/api';

export const TeamChat = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  
  const userStr = localStorage.getItem('technobolt_user') || localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { name: 'Anon' };
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = async () => {
    try {
      const res = await api.get('/api/chat/messages');
      setMessages(res.data);
    } catch(e) { console.error(e); }
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    try {
      await api.post('/api/chat/messages', {
        user: user.name,
        text: input,
        timestamp: new Date().toISOString()
      });
      setInput('');
      loadMessages();
    } catch(e) { alert("Erro ao enviar"); }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col p-4 max-w-5xl mx-auto animate-in fade-in">
      <div className="bg-dark-surface rounded-2xl border border-slate-700 flex-1 flex flex-col shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-700 bg-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2 text-white font-bold">
            <MessageCircle className="text-bolt-500" /> Chat da Equipe
          </div>
          <button onClick={loadMessages} className="text-slate-400 hover:text-white"><RefreshCcw size={16}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-900/50">
          {messages.map((msg, i) => {
            const isMe = msg.user === user.name;
            return (
              <div key={i} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isMe ? 'bg-bolt-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                  {msg.user.charAt(0)}
                </div>
                <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${isMe ? 'bg-bolt-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-300 rounded-tl-none'}`}>
                  <p className="font-bold text-[10px] opacity-70 mb-1">{msg.user}</p>
                  {msg.text}
                  <p className="text-[9px] opacity-50 text-right mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div className="p-4 bg-slate-800 border-t border-slate-700 flex gap-2">
          <input 
            className="flex-1 bg-dark-bg border border-slate-600 rounded-full px-4 py-2 text-white text-sm outline-none focus:border-bolt-500"
            placeholder="Digite uma mensagem para a equipe..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend} className="bg-bolt-500 hover:bg-bolt-600 text-white p-2 rounded-full transition-colors">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
