import { useState, useEffect } from 'react';
import { Mail, Phone, User, Calendar, Star, FileSpreadsheet, Send, MessageCircle, Mic, Wand2 } from 'lucide-react';
import api from '../services/api';

export const CRM = () => {
  const [activeTab, setActiveTab] = useState<'clients' | 'suppliers' | 'whatsapp'>('clients');
  const [clients, setClients] = useState<any[]>([]);
  
  // Estados para Fornecedores
  const [supplierName, setSupplierName] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  
  // Estados para Whatsapp
  const [selectedClientPhone, setSelectedClientPhone] = useState('');
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [whatsappContext, setWhatsappContext] = useState(''); // O que o usuário quer dizer
  const [isRecording, setIsRecording] = useState(false);
  const [isGeneratingWhats, setIsGeneratingWhats] = useState(false);

  useEffect(() => {
    // Busca clientes reais do backend
    api.get('/api/crm/clients').then(res => setClients(res.data)).catch(console.error);
  }, []);

  // --- LÓGICA DE E-MAIL ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachmentName(file.name);
      const tableMock = `
        <br>
        <table style="border-collapse: collapse; width: 100%; border: 1px solid #ddd; font-family: sans-serif;">
          <tr style="background-color: #f2f2f2;"><th>Código</th><th>Produto</th><th>Qtd</th></tr>
          <tr><td>102030</td><td>Amortecedor Diant.</td><td>50</td></tr>
          <tr><td>405060</td><td>Pastilha Freio</td><td>100</td></tr>
        </table>
        <br>
      `;
      setEmailBody(prev => prev + tableMock);
    }
  };

  const generateEmailWithAI = async () => {
    if (!emailSubject || !supplierName) return alert("Preencha Fornecedor e Assunto primeiro.");
    setIsGeneratingEmail(true);
    try {
      // Simulação de chamada IA (poderia ser o endpoint /api/ai/consult)
      // Aqui estamos focando na estrutura do frontend pedida
      const prompt = `Escreva um email formal mas direto para o fornecedor ${supplierName} sobre: ${emailSubject}. Seja breve.`;
      const res = await api.post('/api/ai/consult', { prompt });
      setEmailBody(res.data.response + (attachmentName ? "\n\n(Segue planilha em anexo na tabela abaixo)" : ""));
    } catch (e) {
      setEmailBody("Olá, gostaria de solicitar uma cotação conforme os itens abaixo.");
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  const sendEmail = () => {
    alert(`E-mail enviado para ${supplierName}!\nAssunto: ${emailSubject}\nAnexo: ${attachmentName}`);
    setEmailSubject('');
    setEmailBody('');
    setAttachmentName('');
    setSupplierName('');
  };

  // --- LÓGICA DE WHATSAPP ---
  const handleMicClick = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setWhatsappContext("Avisa que a peça do motor chegou e pode buscar.");
        setIsRecording(false);
      }, 2000);
    }
  };

  const generateWhatsappWithAI = async () => {
    if (!whatsappContext) return;
    setIsGeneratingWhats(true);
    try {
      const prompt = `Crie uma mensagem curta de WhatsApp para um cliente de oficina. Contexto: "${whatsappContext}". Use tom amigável, sem termos técnicos difíceis, parecendo um humano falando.`;
      const res = await api.post('/api/ai/consult', { prompt });
      setWhatsappMessage(res.data.response.replace(/"/g, ''));
    } catch (e) {
      setWhatsappMessage(whatsappContext);
    } finally {
      setIsGeneratingWhats(false);
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
            Fornecedores
          </button>
          <button onClick={() => setActiveTab('whatsapp')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'whatsapp' ? 'bg-green-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
            Whatsapp IA
          </button>
        </div>
      </div>

      {/* --- ABA 1: CLIENTES --- */}
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

      {/* --- ABA 2: FORNECEDORES (Email Automático IA) --- */}
      {activeTab === 'suppliers' && (
        <div className="bg-dark-surface p-6 rounded-xl border border-slate-700 max-w-3xl mx-auto">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Mail className="text-blue-400"/> Nova Cotação / Pedido
          </h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs text-slate-400 uppercase font-bold block mb-1">Fornecedor</label>
                    <select 
                        className="w-full bg-dark-bg border border-slate-600 rounded-lg p-3 text-white outline-none focus:border-pink-500"
                        onChange={(e) => setSupplierName(e.target.value)}
                        value={supplierName}
                    >
                        <option value="">Selecione...</option>
                        <option value="Bosch Distribuidora">Bosch Distribuidora</option>
                        <option value="Cofap Oficial">Cofap Oficial</option>
                        <option value="Lubrax Center">Lubrax Center</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs text-slate-400 uppercase font-bold block mb-1">Assunto (Resumo)</label>
                    <input 
                        type="text" 
                        className="w-full bg-dark-bg border border-slate-600 rounded-lg p-3 text-white outline-none focus:border-pink-500"
                        value={emailSubject}
                        onChange={e => setEmailSubject(e.target.value)}
                        placeholder="Ex: Pedido Freios"
                    />
                </div>
            </div>

            <div className="relative">
              <label className="text-xs text-slate-400 uppercase font-bold block mb-1 flex justify-between">
                  Corpo do Email
                  <button 
                    onClick={generateEmailWithAI} 
                    disabled={isGeneratingEmail}
                    className="text-pink-400 hover:text-white flex items-center gap-1 text-[10px]"
                  >
                    <Wand2 size={12}/> {isGeneratingEmail ? 'Escrevendo...' : 'Gerar Texto com IA'}
                  </button>
              </label>
              <textarea 
                className="w-full bg-dark-bg border border-slate-600 rounded-lg p-3 text-white outline-none focus:border-pink-500 h-40 custom-scrollbar"
                value={emailBody}
                onChange={e => setEmailBody(e.target.value)}
                placeholder="A IA pode escrever isso para você..."
              />
            </div>

            {/* Upload Inteligente */}
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-4 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-800/50 transition-colors cursor-pointer relative">
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} accept=".csv, .xlsx" />
              <FileSpreadsheet size={24} className="mb-2 text-green-500" />
              <p className="text-sm font-medium">{attachmentName || "Anexar Planilha de Pedido"}</p>
            </div>

            <button onClick={sendEmail} className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
              <Send size={18} /> Enviar Email
            </button>
          </div>
        </div>
      )}

      {/* --- ABA 3: WHATSAPP (Ditado + IA) --- */}
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
                <option value="11999999999">João da Silva (Oficina X)</option>
                <option value="11988888888">Maria Oliveira</option>
              </select>
            </div>

            {/* Área de Ditado/Contexto */}
            <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                <label className="text-[10px] text-slate-500 uppercase font-bold mb-2 block flex justify-between">
                    O que você quer dizer? (Dite ou Escreva)
                    {isRecording && <span className="text-red-500 animate-pulse flex items-center gap-1"><Mic size={10}/> Gravando...</span>}
                </label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        className="flex-1 bg-transparent text-white outline-none placeholder:text-slate-600"
                        placeholder="Ex: Peça chegou, pode buscar..."
                        value={whatsappContext}
                        onChange={e => setWhatsappContext(e.target.value)}
                    />
                    <button onClick={handleMicClick} className="text-slate-400 hover:text-white"><Mic size={18}/></button>
                    <button onClick={generateWhatsappWithAI} disabled={isGeneratingWhats} className="bg-bolt-500 text-white px-3 py-1 rounded text-xs font-bold hover:bg-bolt-600 transition-all">
                        {isGeneratingWhats ? '...' : 'Gerar Msg'}
                    </button>
                </div>
            </div>

            {/* Resultado da IA */}
            <div className="relative">
              <label className="text-xs text-slate-400 uppercase font-bold block mb-1">Mensagem Final (Editável)</label>
              <textarea 
                className="w-full bg-dark-bg border border-slate-600 rounded-lg p-3 text-white outline-none h-24"
                value={whatsappMessage}
                onChange={e => setWhatsappMessage(e.target.value)}
              />
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
