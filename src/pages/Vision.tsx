import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCcw, XCircle, Loader2, ScanFace, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

// Interface para o resultado da IA (tipagem forte)
interface AIResult {
  name: string;
  possible_vehicles: string[];
  category: string;
  confidence: string;
}

export const Vision = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // --- FASE 1: Iniciar a Câmera ---
  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { exact: "environment" } // Tenta câmera traseira no mobile
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err: any) {
      // Fallback para câmera frontal se a traseira falhar (comum em desktops/emuladores)
      try {
        const streamFallback = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = streamFallback;
          setIsStreaming(true);
        }
      } catch (fallbackErr) {
        setError('Não foi possível acessar a câmera. Verifique as permissões.');
        console.error("Erro na câmera:", err);
      }
    }
  };

  // --- FASE 1: Parar a Câmera (Limpeza) ---
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  useEffect(() => {
    startCamera();
    // Limpa a câmera ao sair da página
    return () => stopCamera();
  }, []);

  // --- FASE 2: Capturar a Foto ---
  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Define o tamanho do canvas igual ao do vídeo
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Desenha o frame atual do vídeo no canvas
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Converte o canvas para uma URL de imagem (base64) para exibir
      const imageUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageUrl);
      stopCamera(); // Para o vídeo após capturar

      // Inicia a análise automaticamente
      analyzePhoto(canvas);
    }
  };

  // --- FASE 2: Enviar para IA e Analisar ---
  const analyzePhoto = async (canvas: HTMLCanvasElement) => {
    setIsAnalyzing(true);
    setError(null);

    // Converte o canvas para um arquivo Blob
    canvas.toBlob(async (blob) => {
      if (!blob) {
        setError("Falha ao processar a imagem.");
        setIsAnalyzing(false);
        return;
      }

      const formData = new FormData();
      formData.append('file', blob, 'vision_capture.jpg');

      try {
        // Chama sua API (motor já pronto!)
        const response = await api.post<AIResult>('/api/ai/identify', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setAiResult(response.data);
        // AQUI SERÁ O GATILHO PARA A FASE 3 (Busca no Estoque) - Futuramente
      } catch (err) {
        console.error("Erro na análise:", err);
        setError('A IA não conseguiu identificar a peça. Tente melhorar a iluminação ou o ângulo.');
      } finally {
        setIsAnalyzing(false);
      }
    }, 'image/jpeg', 0.9); // Qualidade 90%
  };

  const reset = () => {
    setCapturedImage(null);
    setAiResult(null);
    setError(null);
    startCamera();
  };

  // --- Renderização da Interface ---
  return (
    <div className="h-screen bg-black flex flex-col relative overflow-hidden">
      {/* Cabeçalho Simples */}
      <div className="absolute top-0 left-0 w-full p-4 z-20 flex justify-between items-center bg-gradient-to-b from-black/70 to-transparent">
        <h1 className="text-white font-bold text-lg flex items-center gap-2">
          <ScanFace className="text-bolt-500" />
          TechnoBolt Vision
        </h1>
        <button onClick={() => navigate('/dashboard')} className="text-white/70 hover:text-white">
          <XCircle size={28} />
        </button>
      </div>

      {/* Área Principal: Vídeo ou Imagem Capturada */}
      <div className="flex-1 relative flex items-center justify-center bg-dark-surface">
        {error && (
          <div className="absolute top-20 z-30 bg-red-500/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-4">
            <AlertTriangle size={20} />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {!capturedImage ? (
          // --- Modo Câmera ---
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className={`w-full h-full object-cover transition-opacity duration-500 ${isStreaming ? 'opacity-100' : 'opacity-0'}`}
            ></video>
            
            {/* Overlay Industrial (Moldura de Mira) */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-3/4 h-1/2 border-2 border-industrial-500/50 relative">
                {/* Cantos */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-industrial-500"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-industrial-500"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-industrial-500"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-industrial-500"></div>
                {/* Mira Central */}
                <div className="absolute top-1/2 left-1/2 w-12 h-0.5 bg-industrial-500/50 -translate-x-1/2"></div>
                <div className="absolute top-1/2 left-1/2 h-12 w-0.5 bg-industrial-500/50 -translate-y-1/2"></div>
              </div>
            </div>

            {/* Botão de Captura (Obturador) */}
            <div className="absolute bottom-8 left-0 w-full flex justify-center z-20">
              <button 
                onClick={takePhoto}
                disabled={!isStreaming}
                className="bg-white/20 border-4 border-white rounded-full p-2 backdrop-blur-sm disabled:opacity-50 hover:bg-white/30 transition-all active:scale-95"
              >
                <div className="bg-bolt-500 w-16 h-16 rounded-full flex items-center justify-center shadow-lg shadow-bolt-500/30">
                  <Camera size={32} className="text-white" />
                </div>
              </button>
            </div>
          </>
        ) : (
          // --- Modo Imagem Capturada & Análise ---
          <div className="relative w-full h-full">
            <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
            
            {/* Overlay de Análise (Efeito de Scanner) */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-10">
                <div className="w-full h-2 bg-bolt-500/50 absolute top-0 animate-scan-down shadow-[0_0_15px_#0ea5e9]"></div>
                <Loader2 className="text-bolt-500 w-12 h-12 animate-spin mb-4" />
                <p className="text-white font-bold text-lg animate-pulse">Analisando imagem...</p>
                <p className="text-slate-400 text-sm mt-2">Consultando IA Gemini</p>
              </div>
            )}

            {/* Resultado da IA ( Fase 2 - Temporário, para teste ) */}
            {aiResult && !isAnalyzing && (
              <div className="absolute bottom-0 left-0 w-full bg-dark-surface/95 border-t border-slate-700 p-6 rounded-t-3xl animate-slide-up z-20">
                <div className="w-12 h-1 bg-slate-700 mx-auto rounded-full mb-4"></div>
                <h2 className="text-2xl font-bold text-white mb-2">{aiResult.name}</h2>
                
                <div className="flex items-center gap-4 text-sm mb-4">
                  <span className={`px-2 py-0.5 rounded font-bold uppercase text-xs ${
                    aiResult.confidence === 'Alta' ? 'bg-green-500/20 text-green-400 border border-green-500/50' :
                    aiResult.confidence === 'Média' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' :
                    'bg-red-500/20 text-red-400 border border-red-500/50'
                  }`}>
                    Confiança: {aiResult.confidence}
                  </span>
                  <span className="text-slate-400">{aiResult.category}</span>
                </div>
                
                <p className="text-slate-300 text-sm mb-6">
                  <strong className="text-slate-400">Veículos Possíveis:</strong> {aiResult.possible_vehicles.join(", ")}
                </p>

                {/* Botões de Ação Temporários */}
                <div className="flex gap-3">
                  <button onClick={reset} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
                    <RefreshCcw size={20} /> Tentar Novamente
                  </button>
                  {/* O botão de "Buscar no Estoque" entrará na Fase 3 */}
                  <button disabled className="flex-1 bg-bolt-500/50 text-white/50 py-3 rounded-xl font-bold transition-all cursor-not-allowed">
                    Ver no Estoque (Em breve)
                  </button>
                </div>
              </div>
            )}
             {/* Botão de Reset se a IA falhar */}
             {error && !isAnalyzing && (
               <div className="absolute bottom-8 w-full flex justify-center z-20">
                  <button onClick={reset} className="bg-slate-700 hover:bg-slate-600 text-white py-3 px-6 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg">
                    <RefreshCcw size={20} /> Tentar Novamente
                  </button>
               </div>
             )}
          </div>
        )}
      </div>
      
      {/* Canvas Escondido para Captura */}
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};
