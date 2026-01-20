import { useState } from 'react';
import { PackagePlus, Upload, FileSpreadsheet, Save, Download, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';

export const ProductRegistration = () => {
  const [activeTab, setActiveTab] = useState<'manual' | 'import'>('manual');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Estado Manual
  const [formData, setFormData] = useState({
    SKU_ID: '',
    PRODUTO_NOME: '',
    MARCA: '',
    COD_FABRICANTE: '',
    EAN_BARRAS: '',
    CATEGORIA: 'Geral',
    APLICACAO_VEICULOS: '',
    NCM: '',
    PRECO_CUSTO: 0,
    PRECO_VENDA: 0
  });

  // Estado Importação
  const [importedItems, setImportedItems] = useState<any[]>([]);
  const [importStatus, setImportStatus] = useState('');

  // --- MANUAL ---
  const handleManualSubmit = async () => {
    if (!formData.SKU_ID || !formData.PRODUTO_NOME) return alert("SKU e Nome são obrigatórios");
    
    setIsProcessing(true);
    try {
      await api.post('/api/products', formData);
      alert("Produto cadastrado com sucesso!");
      setFormData({
        SKU_ID: '', PRODUTO_NOME: '', MARCA: '', COD_FABRICANTE: '', EAN_BARRAS: '',
        CATEGORIA: 'Geral', APLICACAO_VEICULOS: '', NCM: '', PRECO_CUSTO: 0, PRECO_VENDA: 0
      });
    } catch (e) {
      alert("Erro ao cadastrar. Verifique se o SKU já existe.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- IMPORTAÇÃO ---
  const downloadTemplate = () => {
    // Cabeçalhos para o usuário saber o que preencher
    const headers = "SKU_ID;PRODUTO_NOME;MARCA;COD_FABRICANTE;EAN_BARRAS;CATEGORIA;APLICACAO_VEICULOS;NCM;PRECO_CUSTO;PRECO_VENDA";
    const example = "OLE002;Oleo 15W40;Lubrax;LBX-1540;789123456;Lubrificantes;Motores Flex;27101932;20.00;45.00";
    
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + example;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "modelo_importacao_technobolt.csv");
    document.body.appendChild(link);
    link.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].trim().split(';');
      
      const items = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = lines[i].trim().split(';');
        const obj: any = {};
        
        // Mapeia colunas baseado na ordem ou nome
        headers.forEach((h, index) => {
          let val: any = values[index];
          // Converte números
          if (h.includes('PRECO')) val = parseFloat(val) || 0;
          obj[h] = val;
        });
        
        // Validação mínima
        if (obj.SKU_ID && obj.PRODUTO_NOME) {
            obj.COD_EQUIVALENTES = []; // Inicializa vazio
            obj.TAGS_IA = "";
            items.push(obj);
        }
      }
      setImportedItems(items);
    };
    reader.readAsText(file);
  };

  const confirmImport = async () => {
    if (importedItems.length === 0) return;
    setIsProcessing(true);
    setImportStatus('Enviando dados...');
    
    try {
      const res = await api.post('/api/products', importedItems);
      setImportStatus(`Sucesso! ${res.data.count} itens importados.`);
      setImportedItems([]);
    } catch (e) {
      setImportStatus('Erro na importação. Verifique SKUs duplicados.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 animate-in fade-in duration-500">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <PackagePlus className="text-emerald-500" /> Cadastro de Produtos
          </h1>
          <p className="text-slate-400 text-sm">Insira novos itens manualmente ou via planilha.</p>
        </div>
        
        <div className="flex bg-slate-800 p-1 rounded-lg">
          <button onClick={() => setActiveTab('manual')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'manual' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
            Manual
          </button>
          <button onClick={() => setActiveTab('import')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'import' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
            Carga em Massa (CSV)
          </button>
        </div>
      </div>

      {/* --- ABA MANUAL --- */}
      {activeTab === 'manual' && (
        <div className="bg-dark-surface p-6 rounded-xl border border-slate-700 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            
            <div className="space-y-4">
                <div>
                    <label className="text-xs text-slate-400 uppercase font-bold block mb-1">SKU (Código Interno)</label>
                    <input type="text" className="w-full bg-dark-bg border border-slate-600 rounded p-2 text-white outline-none focus:border-emerald-500"
                        value={formData.SKU_ID} onChange={e => setFormData({...formData, SKU_ID: e.target.value})} placeholder="Ex: OLE001" />
                </div>
                <div>
                    <label className="text-xs text-slate-400 uppercase font-bold block mb-1">Nome do Produto</label>
                    <input type="text" className="w-full bg-dark-bg border border-slate-600 rounded p-2 text-white outline-none focus:border-emerald-500"
                        value={formData.PRODUTO_NOME} onChange={e => setFormData({...formData, PRODUTO_NOME: e.target.value})} placeholder="Ex: Óleo Motor 5W30" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-slate-400 uppercase font-bold block mb-1">Marca</label>
                        <input type="text" className="w-full bg-dark-bg border border-slate-600 rounded p-2 text-white outline-none focus:border-emerald-500"
                            value={formData.MARCA} onChange={e => setFormData({...formData, MARCA: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 uppercase font-bold block mb-1">Cod. Fabricante</label>
                        <input type="text" className="w-full bg-dark-bg border border-slate-600 rounded p-2 text-white outline-none focus:border-emerald-500"
                            value={formData.COD_FABRICANTE} onChange={e => setFormData({...formData, COD_FABRICANTE: e.target.value})} />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-slate-400 uppercase font-bold block mb-1">Preço Custo</label>
                        <input type="number" className="w-full bg-dark-bg border border-slate-600 rounded p-2 text-white outline-none focus:border-emerald-500"
                            value={formData.PRECO_CUSTO} onChange={e => setFormData({...formData, PRECO_CUSTO: parseFloat(e.target.value)})} />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 uppercase font-bold block mb-1">Preço Venda</label>
                        <input type="number" className="w-full bg-dark-bg border border-slate-600 rounded p-2 text-white outline-none focus:border-emerald-500"
                            value={formData.PRECO_VENDA} onChange={e => setFormData({...formData, PRECO_VENDA: parseFloat(e.target.value)})} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-slate-400 uppercase font-bold block mb-1">NCM (Fiscal)</label>
                        <input type="text" className="w-full bg-dark-bg border border-slate-600 rounded p-2 text-white outline-none focus:border-emerald-500"
                            value={formData.NCM} onChange={e => setFormData({...formData, NCM: e.target.value})} placeholder="8 dígitos" />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 uppercase font-bold block mb-1">Categoria</label>
                        <input type="text" className="w-full bg-dark-bg border border-slate-600 rounded p-2 text-white outline-none focus:border-emerald-500"
                            value={formData.CATEGORIA} onChange={e => setFormData({...formData, CATEGORIA: e.target.value})} />
                    </div>
                </div>
                <div>
                    <label className="text-xs text-slate-400 uppercase font-bold block mb-1">Aplicação (Veículos)</label>
                    <input type="text" className="w-full bg-dark-bg border border-slate-600 rounded p-2 text-white outline-none focus:border-emerald-500"
                        value={formData.APLICACAO_VEICULOS} onChange={e => setFormData({...formData, APLICACAO_VEICULOS: e.target.value})} placeholder="Ex: Gol G5, Fox..." />
                </div>
            </div>

          </div>
          <button onClick={handleManualSubmit} disabled={isProcessing} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
            {isProcessing ? 'Salvando...' : <><Save size={20}/> Cadastrar Produto</>}
          </button>
        </div>
      )}

      {/* --- ABA IMPORTAÇÃO --- */}
      {activeTab === 'import' && (
        <div className="bg-dark-surface p-6 rounded-xl border border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                    <h3 className="text-white font-bold flex items-center gap-2"><Download size={18}/> 1. Baixe o Modelo</h3>
                    <p className="text-sm text-slate-400">Utilize nossa planilha padrão para preencher os dados corretamente. As colunas devem ser separadas por ponto e vírgula (;).</p>
                    <button onClick={downloadTemplate} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded flex items-center gap-2 text-sm">
                        Baixar Planilha Modelo (.csv)
                    </button>
                </div>

                <div className="space-y-4">
                    <h3 className="text-white font-bold flex items-center gap-2"><Upload size={18}/> 2. Faça o Upload</h3>
                    <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-800/50 transition-colors cursor-pointer relative">
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} accept=".csv" />
                        <FileSpreadsheet size={32} className="mb-2 text-blue-500" />
                        <p className="text-sm font-medium">Arraste seu CSV aqui</p>
                    </div>
                </div>
            </div>

            {/* Pré-visualização e Ação */}
            {importedItems.length > 0 && (
                <div className="animate-in fade-in">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-white font-bold flex items-center gap-2"><CheckCircle className="text-green-500" size={18}/> {importedItems.length} Itens lidos</h3>
                        <button onClick={confirmImport} disabled={isProcessing} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded font-bold shadow-lg shadow-blue-500/20">
                            {isProcessing ? 'Importando...' : 'Confirmar Importação'}
                        </button>
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto border border-slate-700 rounded-lg">
                        <table className="w-full text-left text-xs text-slate-400">
                            <thead className="bg-slate-900 text-slate-200 sticky top-0">
                                <tr>
                                    <th className="p-2">SKU</th>
                                    <th className="p-2">Nome</th>
                                    <th className="p-2">Marca</th>
                                    <th className="p-2">Preço Venda</th>
                                    <th className="p-2">NCM</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {importedItems.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="p-2 font-mono text-white">{item.SKU_ID}</td>
                                        <td className="p-2">{item.PRODUTO_NOME}</td>
                                        <td className="p-2">{item.MARCA}</td>
                                        <td className="p-2 text-green-400">R$ {item.PRECO_VENDA}</td>
                                        <td className="p-2">{item.NCM || <span className="text-red-500">Pendente</span>}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {importStatus && (
                <div className="mt-4 p-4 bg-slate-800 rounded-lg border border-slate-600 text-white flex items-center gap-2">
                    <AlertCircle size={20} className="text-yellow-500"/>
                    {importStatus}
                </div>
            )}
        </div>
      )}
    </div>
  );
};
