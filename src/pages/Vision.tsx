import { useRef, useState, useEffect } from 'react';
// Removido 'Camera' que não estava sendo usado
import { XCircle, Loader2, ScanFace, MapPin, Car, Hash, ArrowLeft } from 'lucide-react';
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
}

export const Vision = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [analyzingStep, setAnalyzingStep] = useState<string>(''); 
  const [dbResult, setDbResult] = useState<PartData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Iniciar Câmera
  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { exact: "environment" } } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsStreaming(true); // Variável sendo setada
        }
      } catch (err) {
        // Fallback
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setIsStreaming(true); // Variável sendo setada
          }
        } catch (e) {
          console.error("Erro ao iniciar câmera", e);
          setError("Câmera não disponível.");
        }
      }
    };
    startCamera();

    // Cleanup function para desligar a câmera ao sair da tela
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setIsStreaming(false);
    };
  }, []);

  const takePhotoAndAnalyze = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const context = canvasRef.current.getContext('2d');
    if (context && videoRef.current.videoWidth) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);

        canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        
        setAnalyzingStep('Identificando peça...');
        const formData = new FormData();
        formData.append('file', blob, 'scan.jpg');

        try {
            const aiResponse = await api.post('/api/ai/identify', formData);
            const aiData = aiResponse.data;

            setAnalyzingStep(`Buscando "${aiData.name}"...`);
            
            const searchTerm = aiData.part_number || aiData.name;
            const dbResponse = await api.get(`/api/parts?q=${searchTerm}`);

            if (dbResponse.data && dbResponse.data.length > 0) {
                setDbResult(dbResponse.data[0]);
                setAnalyzingStep('done');
            } else {
                setError(`A peça "${aiData.name}" foi identificada, mas não encontrada no estoque.`);
                setAnalyzingStep('');
            }

        } catch (err) {
            setError('Não foi possível identificar a peça.');
            setAnalyzingStep('');
        }
        }, 'image/jpeg', 0.8);
    }
  };

  // TELA DE RESULTADOS
  if (dbResult && analyzingStep === 'done') {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-4 flex flex-col">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => { setDbResult(null); setAnalyzingStep(''); }} className="p-2 bg-slate-800 rounded-full">
            <ArrowLeft />
          </button>
          <h2 className="text-xl font-bold text-bolt-500">Resultado Vision</h2>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700 flex-1 overflow-y-auto">
          <div className="flex flex-col items-center mb-6">
            <div className="w-32 h-32 bg-white rounded-xl mb-4 overflow-hidden p-2">
              <img src={dbResult.image || 'https://via.placeholder.com/150'} alt={dbResult.name} className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-center leading-tight">{dbResult.name}</h1>
            <span className="text-slate-400 mt-1">{dbResult.brand}</span>
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-slate-700/50 p-4 rounded-xl flex items-center gap-3">
              <Hash className="text-bolt-500" />
              <div>
                <p className="text-xs text-slate-400 uppercase">Código</p>
                <p className="font-mono text-lg">{dbResult.code}</p>
              </div>
            </div>
            
            <div className="bg-slate-700/50 p-4 rounded-xl flex items-start gap-3">
              <Car className="text-industrial-500 mt-1" />
              <div>
                <p className="text-xs text-slate-400 uppercase">Aplicação</p>
                <p className="text-sm leading-relaxed">{dbResult.application}</p>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
            <MapPin size={18} /> Disponibilidade na Rede
          </h3>
          <div className="space-y-2">
            {dbResult.stock_locations && dbResult.stock_locations.length > 0 ? (
              dbResult.stock_locations.map((loc, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-700">
                  <span className="font-medium text-slate-300">{loc.loja}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${loc.qtd > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {loc.qtd} unid.
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center p-4 text-slate-500">Nenhum estoque registrado.</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // TELA DE CÂMERA
  return (
    <div className="h-screen bg-black flex flex-col relative overflow-hidden">
      <button onClick={() => navigate('/')} className="absolute top-4 right-4 z-50 text-white/80 p-2 bg-black/40 rounded-full">
        <XCircle size={32} />
      </button>

      <div className="flex-1 relative bg-slate-900">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 border-2 border-bolt-500/80 rounded-3xl relative">
             <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-bolt-500 -mt-1 -ml-1"></div>
             <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-bolt-500 -mt-1 -mr-1"></div>
             <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-bolt-500 -mb-1 -ml-1"></div>
             <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-bolt-500 -mb-1 -mr-1"></div>
          </div>
        </div>

        {analyzingStep && (
           <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-40">
             <Loader2 className="text-bolt-500 w-12 h-12 animate-spin mb-4" />
             <p className="text-white font-bold text-lg animate-pulse">{analyzingStep}</p>
           </div>
        )}

        {error && (
           <div className="absolute top-20 left-4 right-4 bg-red-500/90 text-white p-3 rounded-xl text-center z-50">
             {error}
             <button onClick={() => setError(null)} className="block w-full mt-2 text-sm font-bold underline">Tentar novamente</button>
           </div>
        )}
      </div>

      <div className="h-32 bg-black flex items-center justify-center relative z-20">
        <button 
          onClick={takePhotoAndAnalyze}
          // CORREÇÃO AQUI: Usando 'isStreaming' para só habilitar o botão quando a câmera estiver pronta
          disabled={!isStreaming || !!analyzingStep} 
          className="w-20 h-20 bg-white rounded-full border-4 border-slate-300 flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50 disabled:scale-100"
        >
          <ScanFace className="text-black w-8 h-8" />
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
