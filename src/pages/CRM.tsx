import { useState, useEffect } from 'react';
import { Mail, Phone, User, Calendar, Star, FileSpreadsheet, Send, MessageCircle, Mic } from 'lucide-react';
import api from '../services/api';

export const CRM = () => {
  const [activeTab, setActiveTab] = useState<'clients' | 'suppliers' | 'whatsapp'>('clients');
  const [clients, setClients] = useState<any[]>([]);
  
  // Estados para Fornecedores
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  
  // Estados para Whatsapp
  const [selectedClientPhone, setSelectedClientPhone] = useState('');
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    // Busca clientes reais do backend
    api.get('/api/crm/clients').then(res => setClients(res.data)).catch(console.error);
  }, []);

  // --- LÓGICA DE E-MAIL ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachmentName(file.name);
      // Simulação: Transforma CSV/Excel em Tabela HTML
      const tableMock = `
        <br>
        <table style="border-collapse: collapse; width: 100%; border: 1px solid #ddd;">
          <tr style="background-color: #f2f2f2;"><th>Código</th><th>Produto</th><th>Qtd</th></tr>
          <tr><td>102030</td><td>Amortecedor Diant.</td><td>50</td></tr>
          <tr><td>405060</td><td>Pastilha Freio</td><td>100</td></tr>
        </table>
        <br>
      `;
      setEmailBody(prev => prev + tableMock);
    }
  };

  const sendEmail = () => {
    alert(`E-mail enviado para o fornecedor!\nAssunto: ${emailSubject}\nAnexo: ${attachmentName}`);
    setEmailSubject('');
    setEmailBody('');
    setAttachmentName('');
  };

  // --- LÓGICA DE WHATSAPP ---
  const handleMicClick = () => {
    // Simula ativação do microfone (Web Speech API seria usada aqui em prod)
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setWhatsappMessage(prev => prev + " Olá, gostaria de informar que seu pedido já chegou na loja e está pronto para retirada.");
        setIsRecording(false);
      }, 2000);
    }
  };

  const sendWhatsapp = () => {
    if (!selectedClientPhone) return alert("Selecione um cliente");
    const text = encodeURIComponent(whatsappMessage);
    window.open(`https://wa.me/55${selectedClientPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="p-6 animate-in fade-in duration-500">
      
      {/* Header e Abas */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Mail className="text-pink-500" /> CRM Automático
          </h1>
          <p className="text-slate-400 text-sm">Gestão de relacionamento 360°.</p>
        </div>
        
        <div className="flex bg-slate-800 p-1 rounded-lg">
          <button onClick={() => setActiveTab('clients')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'clients' ? 'bg-pink-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
            Clientes
          </button>
          <button onClick={() => setActiveTab('suppliers')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'suppliers' ? 'bg-pink-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
            Fornecedores (Email)
          </button>
          <button onClick={() => setActiveTab('whatsapp')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'whatsapp' ? 'bg-green-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
            Whatsapp Rápido
          </button>
        </div>
      </div>

      {/* --- ABA 1: CLIENTES (Existente) --- */}
      {activeTab === 'clients' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.length === 0 && <p className="text-slate-500 col-span-3 text-center">Nenhum histórico de vendas encontrado.</p>}
          {clients.map((client, i) => (
            <div key={i} className="bg-dark-surface p-5 rounded-xl border border-slate-700 hover:border-pink-500/50 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-white font-bold truncate w-32">{client.name}</h3>
                    <div className="flex gap-1 text-yellow-500">
                      <Star size={10} fill="currentColor" />
                      <Star size={10} fill="currentColor" />
                      <Star size={10} fill="currentColor" />
                    </div>
                  </div>
                </div>
                <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-1 rounded border border-slate-700">VIP</span>
              </div>

              <div className="space-y-2 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <Calendar size={14} /> Última: {new Date(client.last_purchase).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <User size={14} /> Gasto Total: <span className="text-white font-bold">R$ {client.total_spent.toFixed(2)}</span>
                </div>
              </div>

              <button className="mt-4 w-full bg-slate-800 hover:bg-pink-600 hover:text-white text-slate-300 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 border border-slate-700 group-hover:border-pink-500">
                <Phone size={14} /> Ver Detalhes
              </button>
            </div>
          ))}
        </div>
      )}

      {/* --- ABA 2: FORNECEDORES (Email Automático) --- */}
      {activeTab === 'suppliers' && (
        <div className="bg-dark-surface p-6 rounded-xl border border-slate-700 max-w-3xl mx-auto">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Mail className="text-blue-400"/> Nova Cotação / Pedido
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 uppercase font-bold block mb-1">Fornecedor</label>
              <select className="w-full bg-dark-bg border border-slate-600 rounded-lg p-3 text-white outline-none focus:border-pink-500">
                <option>Selecione um fornecedor...</option>
                <option>Bosch Distribuidora</option>
                <option>Cofap Oficial</option>
                <option>Lubrax Center</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase font-bold block mb-1">Assunto</label>
              <input 
                type="text" 
                className="w-full bg-dark-bg border border-slate-600 rounded-lg p-3 text-white outline-none focus:border-pink-500"
                value={emailSubject}
                onChange={e => setEmailSubject(e.target.value)}
                placeholder="Ex: Cotação de Amortecedores - TechnoBolt"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase font-bold block mb-1">Corpo do Email</label>
              <textarea 
                className="w-full bg-dark-bg border border-slate-600 rounded-lg p-3 text-white outline-none focus:border-pink-500 h-32"
                value={emailBody}
                onChange={e => setEmailBody(e.target.value)}
                placeholder="Digite a mensagem aqui..."
              />
            </div>

            {/* Upload Inteligente */}
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-800/50 transition-colors cursor-pointer relative">
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} accept=".csv, .xlsx" />
              <FileSpreadsheet size={32} className="mb-2 text-green-500" />
              <p className="text-sm font-medium">{attachmentName || "Arraste uma planilha de pedido aqui"}</p>
              <p className="text-xs mt-1 opacity-70">O sistema converterá automaticamente em tabela no corpo do email.</p>
            </div>

            <button onClick={sendEmail} className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
              <Send size={18} /> Enviar Email
            </button>
          </div>
        </div>
      )}

      {/* --- ABA 3: WHATSAPP (Ditado) --- */}
      {activeTab === 'whatsapp' && (
        <div className="bg-dark-surface p-6 rounded-xl border border-slate-700 max-w-2xl mx-auto">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <MessageCircle className="text-green-500"/> Mensagem Rápida
          </h2>

          <div className="space-y-6">
            <div>
              <label className="text-xs text-slate-400 uppercase font-bold block mb-1">Cliente</label>
              <select 
                className="w-full bg-dark-bg border border-slate-600 rounded-lg p-3 text-white outline-none"
                onChange={(e) => setSelectedClientPhone(e.target.value)}
              >
                <option value="">Selecione para quem enviar...</option>
                {/* Mock de telefones - na real viria do banco */}
                <option value="11999999999">João da Silva (Oficina X)</option>
                <option value="11988888888">Maria Oliveira</option>
              </select>
            </div>

            <div className="relative">
              <label className="text-xs text-slate-400 uppercase font-bold block mb-1">Mensagem (Digite ou Dite)</label>
              <textarea 
                className="w-full bg-dark-bg border border-slate-600 rounded-lg p-3 text-white outline-none h-32 pr-12"
                value={whatsappMessage}
                onChange={e => setWhatsappMessage(e.target.value)}
                placeholder="Ex: Olá João, seu pedido de pastilhas chegou..."
              />
              {/* Botão de Microfone */}
              <button 
                onClick={handleMicClick}
                className={`absolute bottom-3 right-3 p-2 rounded-full transition-all ${isRecording ? 'bg-red-500 animate-pulse text-white' : 'bg-slate-700 text-slate-300 hover:text-white'}`}
                title="Ditar mensagem"
              >
                <Mic size={20} />
              </button>
            </div>

            <button onClick={sendWhatsapp} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
              <Send size={18} /> Abrir no WhatsApp Web
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
