import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, RefreshCcw, Users, Lock } from 'lucide-react';
import api from '../services/api';

export const TeamChat = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [recipient, setRecipient] = useState('Todos'); // Novo Estado
  
  const userStr = localStorage.getItem('technobolt_user') || localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { name: 'Anon' };
  const bottomRef = useRef<HTMLDivElement>(null);

  // Mock de Usuários do Time (na real viria do banco)
  const teamMembers = ["Todos", "Gerente", "Carlos (Vendas)", "Ana (Caixa)", "Estoque"];

  const loadMessages = async () => {
    try {
      const res = await api.get('/api/chat/messages');
      // Filtra mensagens privadas que não são para mim nem minhas
      const myMessages = res.data.filter((m: any) => 
        m.to === 'Todos' || m.to === user.name || m.user === user.name
      );
      setMessages(myMessages);
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
        to: recipient, // Envia destinatário
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
        
        {/* Header */}
        <div className="p-4 border-b border-slate-700 bg-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2 text-white font-bold">
            <MessageCircle className="text-bolt-500" /> Chat da Equipe
          </div>
          <div className="flex items-center gap-2">
             <select 
                className="bg-slate-900 border border-slate-600 text-white text-xs rounded p-1 outline-none focus:border-bolt-500"
                value={recipient}
                onChange={e => setRecipient(e.target.value)}
             >
                {teamMembers.map(member => <option key={member} value={member}>Para: {member}</option>)}
             </select>
             <button onClick={loadMessages} className="text-slate-400 hover:text-white ml-2"><RefreshCcw size={16}/></button>
          </div>
        </div>

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-900/50">
          {messages.map((msg, i) => {
            const isMe = msg.user === user.name;
            const isPrivate = msg.to !== 'Todos';
            return (
              <div key={i} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isMe ? 'bg-bolt-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                  {msg.user.charAt(0)}
                </div>
                <div className={`max-w-[70%] p-3 rounded-2xl text-sm relative ${isMe ? 'bg-bolt-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-300 rounded-tl-none'} ${isPrivate ? 'border border-yellow-500/50' : ''}`}>
                  <div className="flex justify-between items-center mb-1 gap-4">
                    <p className="font-bold text-[10px] opacity-70">{msg.user}</p>
                    {isPrivate && <span className="text-[9px] text-yellow-400 flex items-center gap-1"><Lock size={8}/> Privado</span>}
                  </div>
                  {msg.text}
                  <p className="text-[9px] opacity-50 text-right mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-slate-800 border-t border-slate-700 flex gap-2 items-center">
          <div className="bg-slate-900 px-3 py-2 rounded-l-full border border-r-0 border-slate-600 text-slate-400 text-xs flex items-center gap-1 whitespace-nowrap">
             {recipient === 'Todos' ? <Users size={12}/> : <Lock size={12}/>}
             {recipient === 'Todos' ? 'Todos' : recipient.split(' ')[0]}
          </div>
          <input 
            className="flex-1 bg-dark-bg border border-l-0 border-slate-600 rounded-r-full px-4 py-2 text-white text-sm outline-none focus:border-bolt-500"
            placeholder={`Enviar mensagem para ${recipient}...`}
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
