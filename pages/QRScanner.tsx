
import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle, AlertTriangle, ArrowRight, CameraOff, Settings, Loader2, Volume2, VolumeX, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../store/useStore';
import { UserRole, Promotion } from '../types';

const QRScanner: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { promotions, registerScan } = useStore();
  const [scanning, setScanning] = useState(true);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [validatedPromo, setValidatedPromo] = useState<Promotion | null>(null);
  
  // Permission states
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [permissionError, setPermissionError] = useState<string>('');
  
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showFlash, setShowFlash] = useState(false);

  // Audio Feedback Utility
  const playAudioFeedback = async (type: 'success' | 'error') => {
    if (!soundEnabled) return;
    
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      
      // Resume context if suspended (browser policy)
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);

      const startTime = ctx.currentTime;

      if (type === 'success') {
        // Pleasant rising chime (Success)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, startTime);
        osc.frequency.exponentialRampToValueAtTime(1000, startTime + 0.1);
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
        
        osc.start(startTime);
        osc.stop(startTime + 0.3);
      } else {
        // Low double buzz (Error)
        osc.type = 'sawtooth';
        
        // First buzz
        osc.frequency.setValueAtTime(100, startTime);
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.linearRampToValueAtTime(0, startTime + 0.15);
        
        osc.start(startTime);
        osc.stop(startTime + 0.15);

        // Second buzz
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(100, startTime + 0.2);
        
        gain2.gain.setValueAtTime(0.15, startTime + 0.2);
        gain2.gain.linearRampToValueAtTime(0, startTime + 0.35);
        
        osc2.start(startTime + 0.2);
        osc2.stop(startTime + 0.35);
      }

      // Clean up context after sound plays to avoid running out of contexts
      setTimeout(() => {
        if (ctx.state !== 'closed') {
          ctx.close();
        }
      }, 1000);

    } catch (e) {
      console.error("Audio feedback failed", e);
    }
  };

  const triggerHaptic = (type: 'success' | 'error') => {
    if (navigator.vibrate) {
      try {
        if (type === 'success') {
          navigator.vibrate(200); // Single sharp vibration
        } else {
          navigator.vibrate([100, 50, 100]); // Double buzz
        }
      } catch (e) {
        // Ignore vibrate errors
      }
    }
  };

  useEffect(() => {
    // Request camera access
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCameraPermission(false);
        setPermissionError('Seu navegador não suporta acesso à câmera ou o contexto não é seguro (HTTPS).');
        return;
      }

      try {
        setHasCameraPermission(null); // Resetting status (Pending)
        setPermissionError('');
        
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err: any) {
        console.error("Camera access denied or not available", err);
        setHasCameraPermission(false);
        
        // Handle specific error types
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setPermissionError('O acesso à câmera foi negado. Por favor, permita o acesso nas configurações do navegador.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setPermissionError('Nenhuma câmera encontrada neste dispositivo.');
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setPermissionError('A câmera está sendo usada por outro aplicativo.');
        } else {
          setPermissionError('Erro ao acessar a câmera: ' + (err.message || 'Erro desconhecido'));
        }
      }
    };

    if (scanning) {
      startCamera();
    }

    return () => {
      // Cleanup stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current && videoRef.current.srcObject) {
         const currentStream = videoRef.current.srcObject as MediaStream;
         currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [scanning]);

  const processCode = (code: string) => {
    // Visual Flash Effect
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 300);

    const normalizedCode = code.trim().toUpperCase();
    setScanResult(normalizedCode);
    setScanning(false);
    
    if (user?.role === UserRole.BUSINESS) {
      // --- MERCHANT LOGIC: VALIDATE & UPDATE STOCK ---
      const result = registerScan(normalizedCode);

      if (result.success && result.promotion) {
        setValidatedPromo(result.promotion);
        setStatus('success');
        setFeedbackMessage(result.message);
        playAudioFeedback('success');
        triggerHaptic('success');
      } else {
        setStatus('error');
        setFeedbackMessage(result.message);
        playAudioFeedback('error');
        triggerHaptic('error');
      }

    } else {
      // --- CONSUMER LOGIC: FIND & REDIRECT ---
      const promotion = promotions.find(p => p.qr_code === normalizedCode);
      
      if (promotion) {
        setStatus('success');
        setFeedbackMessage(`Redirecionando para ${promotion.product_name}...`);
        playAudioFeedback('success');
        triggerHaptic('success');
        setTimeout(() => navigate(`/promo/${promotion.id}`), 1500);
      } else {
        setStatus('error');
        setFeedbackMessage('Não encontramos nenhuma oferta com este código.');
        playAudioFeedback('error');
        triggerHaptic('error');
      }
    }
  };

  const handleSimulateScan = () => {
    // Simulate finding a valid promotion from the store
    const validCodes = promotions.map(p => p.qr_code);
    const codes = [...validCodes, 'INVALID-CODE-123'];
    
    const randomCode = codes[Math.floor(Math.random() * codes.length)];
    processCode(randomCode);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode) {
      processCode(manualCode);
    }
  };

  const resetScan = () => {
    setScanning(true);
    setScanResult(null);
    setStatus('idle');
    setFeedbackMessage('');
    setValidatedPromo(null);
    setManualCode('');
    setHasCameraPermission(null); // Will trigger camera restart
  };

  const handleClose = () => {
    navigate(-1);
  };

  const handleRetryPermission = () => {
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col overflow-hidden">
      <style>{`
        @keyframes scan-line {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .scan-laser {
          animation: scan-line 2s linear infinite;
        }
      `}</style>

      {/* Flash Overlay */}
      <div className={`absolute inset-0 bg-white z-[60] pointer-events-none transition-opacity duration-300 ${showFlash ? 'opacity-80' : 'opacity-0'}`} />

      <div className="relative flex-1 bg-black">
        {scanning ? (
          <>
            {/* 1. Permission Pending UI */}
            {hasCameraPermission === null && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-white animate-in fade-in">
                <Loader2 size={48} className="text-primary-500 animate-spin mb-6" />
                <h2 className="text-xl font-bold mb-3 text-center">Iniciando Câmera</h2>
                <p className="text-gray-400 text-center max-w-xs leading-relaxed">
                  Solicitando permissão de acesso...<br/>
                  Por favor, clique em <strong>Permitir</strong> se o navegador solicitar.
                </p>
              </div>
            )}

            {/* 2. Permission Denied UI */}
            {hasCameraPermission === false && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-gray-900 text-white animate-in fade-in duration-300">
                <div className="bg-gray-800 p-6 rounded-full mb-6">
                  <CameraOff size={48} className="text-red-400" />
                </div>
                <h2 className="text-xl font-bold mb-3 text-center">Acesso à Câmera Bloqueado</h2>
                <p className="text-gray-400 text-center mb-4 max-w-xs leading-relaxed">
                  {permissionError || 'Para escanear QR Codes, precisamos de acesso à câmera.'}
                </p>
                <button 
                  onClick={handleRetryPermission}
                  className="bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-white/20 transition-colors"
                >
                  <Settings size={18} />
                  Tentar Novamente
                </button>

                {/* Merchant Fallback in Error State */}
                {user?.role === UserRole.BUSINESS && (
                  <div className="w-full max-w-sm mt-10 pt-8 border-t border-gray-800 animate-in slide-in-from-bottom-5">
                    <p className="text-gray-500 text-xs uppercase font-bold mb-3 text-center tracking-wider">Ou digite o código</p>
                    <form onSubmit={handleManualSubmit} className="relative">
                      <input
                        type="text"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        placeholder="Digite o código (ex: PROMO-123)"
                        className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                        autoFocus
                      />
                      <button 
                        type="submit"
                        disabled={!manualCode}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-600 p-1.5 rounded-lg text-white hover:bg-primary-500 disabled:opacity-30 disabled:hover:bg-primary-600 transition-colors"
                      >
                        <ArrowRight size={18} />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* 3. Active Camera Feed */}
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className={`w-full h-full object-cover transition-opacity duration-500 ${hasCameraPermission === true ? 'opacity-100' : 'opacity-0'}`}
            />

            {/* Scanning Overlay */}
            {hasCameraPermission === true && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                
                <div className="w-72 h-72 relative mb-8">
                  {/* Pulsing Frame Animation */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary-500 rounded-tl-xl drop-shadow-lg animate-pulse"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary-500 rounded-tr-xl drop-shadow-lg animate-pulse"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary-500 rounded-bl-xl drop-shadow-lg animate-pulse"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary-500 rounded-br-xl drop-shadow-lg animate-pulse"></div>
                  
                  {/* Laser Scanner Animation */}
                  <div className="absolute left-2 right-2 h-1 bg-primary-500/80 shadow-[0_0_20px_rgba(16,185,129,0.8)] rounded-full scan-laser"></div>
                </div>
                
                <p className="text-white font-medium bg-black/40 px-4 py-2 rounded-full backdrop-blur-md mb-6 shadow-sm border border-white/10">
                  {user?.role === UserRole.BUSINESS ? 'Validar Código do Cliente' : 'Aponte para o QR Code'}
                </p>
                
                <div className="flex gap-4">
                  <button 
                    onClick={handleSimulateScan}
                    className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-6 py-3 rounded-full font-bold text-sm hover:bg-white/20 transition-colors"
                  >
                    Simular Leitura
                  </button>

                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`bg-white/10 backdrop-blur-md text-white border border-white/20 p-3 rounded-full hover:bg-white/20 transition-colors ${!soundEnabled ? 'opacity-50' : ''}`}
                    title={soundEnabled ? 'Desativar Som' : 'Ativar Som'}
                  >
                    {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                  </button>
                </div>

                {user?.role === UserRole.BUSINESS && (
                  <form onSubmit={handleManualSubmit} className="absolute bottom-8 w-full max-w-sm px-4">
                    <div className="relative">
                      <input
                        type="text"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        placeholder="Digite o código manualmente..."
                        className="w-full bg-black/40 backdrop-blur-md text-white placeholder-gray-400 border border-white/20 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:border-primary-500 transition-colors"
                      />
                      <button 
                        type="submit"
                        disabled={!manualCode}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 p-1.5 rounded-lg text-white hover:bg-primary-500 disabled:opacity-30 disabled:hover:bg-white/20 transition-colors"
                      >
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white animate-in slide-in-from-bottom-10 duration-300">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-lg animate-in zoom-in duration-300 ${
              status === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}>
              {status === 'success' ? <CheckCircle size={48} /> : <AlertTriangle size={48} />}
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {status === 'success' ? 'Código Validado!' : 'Erro na Validação'}
            </h2>
            
            {status === 'success' && validatedPromo ? (
               <div className="w-full max-w-xs bg-white border border-gray-100 rounded-2xl p-4 my-4 shadow-xl transform transition-all">
                 <div className="relative">
                   <img src={validatedPromo.photo_url} alt="" className="w-full h-32 object-cover rounded-xl mb-3" />
                   <div className="absolute top-2 right-2 bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm">
                     {validatedPromo.discount_percent}% OFF
                   </div>
                 </div>
                 <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2">{validatedPromo.product_name}</h3>
                 <div className="flex items-center justify-center gap-3 mb-4 p-2 bg-gray-50 rounded-lg">
                   <span className="text-gray-400 line-through text-sm">R$ {validatedPromo.price_before.toFixed(2)}</span>
                   <span className="text-2xl font-bold text-primary-600">R$ {validatedPromo.price_now.toFixed(2)}</span>
                 </div>

                 {/* Stock Indicator */}
                 {validatedPromo.quantity === 'limited' && (
                   <div className={`flex items-center justify-center gap-2 mb-3 text-sm font-medium ${
                     validatedPromo.stock_count === 0 ? 'text-red-600' : 'text-gray-600'
                   }`}>
                     <Package size={16} />
                     <span>
                       {validatedPromo.stock_count === 0 ? 'Estoque Esgotado' : `Estoque Restante: ${validatedPromo.stock_count}`}
                     </span>
                   </div>
                 )}

                 <div className="bg-green-50 text-green-700 text-sm font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-2">
                   <CheckCircle size={16} />
                   {validatedPromo.stock_count === 0 && validatedPromo.quantity === 'limited' ? 'Última Unidade Vendida' : 'Desconto Aplicado'}
                 </div>
               </div>
            ) : (
              <p className="text-gray-500 mb-6 max-w-xs mx-auto">{feedbackMessage}</p>
            )}

            {scanResult && <p className="font-mono text-xs text-gray-300 mb-8 bg-gray-800 px-2 py-1 rounded">REF: {scanResult}</p>}
            
            <div className="flex flex-col gap-3 w-full max-w-xs">
              {status === 'success' && user?.role === UserRole.BUSINESS && (
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition-colors"
                >
                  Confirmar e Voltar
                </button>
              )}
               <button 
                onClick={resetScan}
                className="w-full py-3.5 rounded-xl border border-gray-200 font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Validar Outro Código
              </button>
            </div>
          </div>
        )}

        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 bg-black/40 backdrop-blur-md text-white p-2 rounded-full z-30 hover:bg-black/60 transition-colors"
        >
          <X size={24} />
        </button>
      </div>
    </div>
  );
};

export default QRScanner;
