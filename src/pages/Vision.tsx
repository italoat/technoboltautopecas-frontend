import { useRef, useState, useEffect } from 'react';
import { XCircle, Loader2, ScanFace, MapPin, Car, Hash, ArrowLeft, AlertCircle, PackageX } from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

interface StockLocation {
  loja: string;
  qtd: number;
}

interface PartData {
  id: string;
  name: string;
  code: string;
  brand: string;
  image: string;
  application: string;
  stock_locations: StockLocation[];
  total_stock: number;
  isAiEstimation?: boolean; // Flag para saber se é um dado real ou estimado pela IA
}

export const Vision = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [analyzingStep, setAnalyzingStep] = useState<string>(''); 
  const [dbResult, setDbResult] = useState<PartData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // --- CONFIGURAÇÃO DA CÂMERA (Igual ao anterior) ---
  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { exact: "environment" } } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsStreaming(true);
        }
      } catch (err) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setIsStreaming(true);
          }
        } catch (e) {
          console.error("Erro ao iniciar câmera", e);
          setError("Câmera não disponível.");
        }
      }
    };
    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
      setIsStreaming(false);
    };
  }, []);

  // --- LÓGICA DE CAPTURA E ANÁLISE ---
  const takePhotoAndAnalyze = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const context = canvasRef.current.getContext('2d');
    if (context && videoRef.current.videoWidth) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);

        canvasRef.current.toBlob(async (blob) => {
          if (!blob) return;
          
          setAnalyzingStep('Consultando IA...');
          const formData = new FormData();
          formData.append('file', blob, 'scan.jpg');

          try {
              // 1. Identificação Visual (IA)
              const aiResponse = await api.post('/api/ai/identify', formData);
              const aiData = aiResponse.data;

              setAnalyzingStep(`Verificando estoque...`);
              
              // 2. Busca no Banco de Dados
              const searchTerm = aiData.part_number || aiData.name;
              const dbResponse = await api.get(`/api/parts?q=${searchTerm}`);

              if (dbResponse.data && dbResponse.data.length > 0) {
                  // CASO 1: ENCONTROU NO ESTOQUE
                  setDbResult(dbResponse.data[0]);
              } else {
                  // CASO 2: NÃO ENCONTROU (Cria objeto virtual com dados da IA)
                  const notFoundPart: PartData = {
                    id: 'not-found',
                    name: aiData.name, // Nome que a IA achou
                    code: 'N/A',
                    brand: 'Não Identificada',
                    // Usa a própria foto que o usuário tirou para ilustrar
                    image: URL.createObjectURL(blob), 
                    application: aiData.possible_vehicles ? aiData.possible_vehicles.join(', ') : 'Aplicação Sugerida pela IA',
                    stock_locations: [],
                    total_stock: 0,
                    isAiEstimation: true // Marca como estimativa
                  };
                  setDbResult(notFoundPart);
              }
              setAnalyzingStep('done');

          } catch (err) {
              setError('Falha na conexão com a IA.');
              setAnalyzingStep('');
          }
        }, 'image/jpeg', 0.8);
    }
  };

  // --- TELA DE RESULTADOS ---
  if (dbResult && analyzingStep === 'done') {
    const isOutOfStock = dbResult.total_stock === 0;

    return (
      <div className="min-h-screen bg-slate-900 text-white p-4 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header Resultado */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => { setDbResult(null); setAnalyzingStep(''); }} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors">
            <ArrowLeft />
          </button>
          <div>
            <h2 className="text-xl font-bold text-bolt-500">Resultado da Análise</h2>
            {dbResult.isAiEstimation && <span className="text-xs text-slate-400">Identificado via Inteligência Artificial</span>}
          </div>
        </div>

        <div className={`bg-slate-800 rounded-2xl p-6 shadow-xl border flex-1 overflow-y-auto ${isOutOfStock ? 'border-red-500/50' : 'border-slate-700'}`}>
          
          {/* Alerta de Não Encontrado */}
          {isOutOfStock && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-6 flex items-center gap-3">
              <PackageX className="text-red-500 w-8 h-8" />
              <div>
                <h3 className="font-bold text-red-400 leading-tight">Produto Indisponível</h3>
                <p className="text-xs text-red-300/70">Item não localizado no seu estoque atual.</p>
              </div>
            </div>
          )}

          {/* Imagem e Nome */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-40 h-40 bg-white rounded-xl mb-4 overflow-hidden p-1 shadow-lg">
              <img src={dbResult.image || 'https://via.placeholder.com/150'} alt={dbResult.name} className="w-full h-full object-contain rounded-lg" />
            </div>
            <h1 className="text-2xl font-bold text-center leading-tight">{dbResult.name}</h1>
            <span className="text-slate-400 mt-1 uppercase tracking-wider text-sm">{dbResult.brand}</span>
          </div>

          {/* Dados Técnicos */}
          <div className="space-y-4 mb-8">
            <div className="bg-slate-700/30 p-4 rounded-xl flex items-center gap-3 border border-slate-700/50">
              <Hash className="text-bolt-500" />
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold">Código Referência</p>
                <p className="font-mono text-lg text-white">{dbResult.code}</p>
              </div>
            </div>
            
            <div className="bg-slate-700/30 p-4 rounded-xl flex items-start gap-3 border border-slate-700/50">
              <Car className="text-industrial-500 mt-1" />
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold">Aplicação / Veículos</p>
                <p className="text-sm leading-relaxed text-slate-200">{dbResult.application}</p>
              </div>
            </div>
          </div>

          {/* Estoque por Loja */}
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
            <MapPin size={18} className="text-bolt-500" /> 
            Disponibilidade na Rede
          </h3>
          
          <div className="space-y-2 pb-4">
            {dbResult.stock_locations && dbResult.stock_locations.length > 0 ? (
              dbResult.stock_locations.map((loc, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                  <span className="font-medium text-slate-300">{loc.loja}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${loc.qtd > 0 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/10 text-red-500/50 border border-red-500/20'}`}>
                    {loc.qtd} unid.
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 px-4 border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/50">
                <p className="text-slate-400 font-medium mb-1">Nenhum estoque registrado</p>
                <p className="text-xs text-slate-500">Realize o cadastro ou verifique o código.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- TELA DE CÂMERA (Mantida idêntica para não quebrar fluxo) ---
  return (
    <div className="h-screen bg-black flex flex-col relative overflow-hidden">
      <button onClick={() => navigate('/')} className="absolute top-4 right-4 z-50 text-white/80 p-2 bg-black/40 rounded-full hover:bg-black/60 transition-colors">
        <XCircle size={32} />
      </button>

      <div className="flex-1 relative bg-slate-900">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-90" />
        
        {/* Overlay Industrial */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-72 h-72 border-2 border-bolt-500/80 rounded-3xl relative shadow-[0_0_50px_rgba(14,165,233,0.2)]">
             <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-bolt-500 -mt-1 -ml-1 rounded-tl-lg"></div>
             <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-bolt-500 -mt-1 -mr-1 rounded-tr-lg"></div>
             <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-bolt-500 -mb-1 -ml-1 rounded-bl-lg"></div>
             <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-bolt-500 -mb-1 -mr-1 rounded-br-lg"></div>
             {/* Mira central */}
             <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-bolt-500/50 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
          </div>
          <p className="absolute bottom-32 text-white/80 text-sm font-medium bg-black/50 px-3 py-1 rounded-full backdrop-blur-md">
            Enquadre a peça no centro
          </p>
        </div>

        {analyzingStep && (
           <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-40 backdrop-blur-sm">
             <div className="relative">
               <div className="absolute inset-0 bg-bolt-500/20 blur-xl rounded-full animate-pulse"></div>
               <Loader2 className="text-bolt-500 w-16 h-16 animate-spin relative z-10" />
             </div>
             <p className="text-white font-bold text-xl mt-6 animate-pulse tracking-wide">{analyzingStep}</p>
             <p className="text-slate-400 text-sm mt-2">Isso pode levar alguns segundos...</p>
           </div>
        )}

        {error && (
           <div className="absolute top-24 left-6 right-6 bg-red-500/90 text-white p-4 rounded-xl text-center z-50 shadow-xl flex flex-col items-center gap-2 animate-in slide-in-from-top-4">
             <AlertCircle size={32} className="mb-1" />
             <p className="font-bold">{error}</p>
             <button onClick={() => setError(null)} className="mt-2 text-xs font-bold bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition-colors uppercase tracking-wider">
               Tentar novamente
             </button>
           </div>
        )}
      </div>

      <div className="h-36 bg-black flex items-center justify-center relative z-20 pb-4">
        <button 
          onClick={takePhotoAndAnalyze}
          disabled={!isStreaming || !!analyzingStep} 
          className="group relative"
        >
          <div className="absolute inset-0 bg-bolt-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
          <div className="w-20 h-20 bg-white rounded-full border-[6px] border-slate-800 flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50 disabled:scale-100 relative z-10 shadow-2xl">
            <ScanFace className="text-slate-900 w-8 h-8 group-hover:text-bolt-600 transition-colors" />
          </div>
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
