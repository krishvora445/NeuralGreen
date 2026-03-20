import { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Camera, Loader2, AlertCircle, Video, VideoOff, Zap } from 'lucide-react';
import type { WasteData } from '../lib/wasteData';
import { getMockPrediction } from '../lib/wasteData';
import type { Lang } from '../lib/i18n';
import { pick, speak as speakFn } from '../lib/utils';
import ResultCard from './ResultCard';

interface ScannerProps {
  lang: Lang;
  t: (key: string) => string;
  onResult: (data: WasteData) => void;
}

type ScanState = 'empty' | 'loading' | 'result' | 'error';

export default function Scanner({ lang, t, onResult }: ScannerProps) {
  const [tab, setTab] = useState<'upload' | 'camera'>('upload');
  const [base64, setBase64] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [state, setState] = useState<ScanState>('empty');
  const [result, setResult] = useState<WasteData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [dragover, setDragover] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [liveMode, setLiveMode] = useState(false);
  const [liveScanCount, setLiveScanCount] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const liveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      stopLiveMode();
    };
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreviewUrl(dataUrl);
      setBase64(dataUrl.split(',')[1]);
      setState('empty');
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      setErrorMsg('Camera access denied. Please allow camera permissions.');
      setState('error');
    }
  };

  const stopCamera = () => {
    stopLiveMode();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    return dataUrl;
  }, []);

  const captureSnapshot = () => {
    const dataUrl = captureFrame();
    if (!dataUrl) return;
    setPreviewUrl(dataUrl);
    setBase64(dataUrl.split(',')[1]);
    setState('empty');
    setResult(null);
  };

  const analyse = useCallback(async (imageBase64?: string) => {
    const img = imageBase64 || base64;
    if (!img) return;
    setState('loading');
    try {
      // Try Flask server first (proxied through Vite /api)
      let data: WasteData | null = null;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const res = await fetch('/api/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: img }),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (res.ok) {
          data = await res.json();
        }
      } catch {
        // Flask offline, use mock
      }

      if (!data) {
        // Simulate a small delay for mock
        await new Promise(r => setTimeout(r, 800));
        data = getMockPrediction();
      }

      setResult(data);
      setState('result');
      onResult(data);

      // Speak result
      speakFn(pick(data.voice, lang), lang);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Analysis failed';
      setErrorMsg(msg);
      setState('error');
    }
  }, [base64, lang, onResult]);

  // Live scanning mode - captures frame and analyses every 5 seconds
  const startLiveMode = useCallback(() => {
    if (!cameraActive) return;
    setLiveMode(true);
    setLiveScanCount(0);

    // Immediately do first scan
    const dataUrl = captureFrame();
    if (dataUrl) {
      const b64 = dataUrl.split(',')[1];
      setPreviewUrl(dataUrl);
      setBase64(b64);
      analyse(b64);
    }

    liveIntervalRef.current = setInterval(() => {
      if (!videoRef.current || !streamRef.current) {
        stopLiveMode();
        return;
      }
      const dataUrl = captureFrame();
      if (dataUrl) {
        const b64 = dataUrl.split(',')[1];
        setPreviewUrl(dataUrl);
        setBase64(b64);
        setLiveScanCount(prev => prev + 1);
        // Direct analyse with the captured base64
        (async () => {
          try {
            let data: WasteData | null = null;
            try {
              const controller = new AbortController();
              const timeout = setTimeout(() => controller.abort(), 5000);
              const res = await fetch('/api/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: b64 }),
                signal: controller.signal,
              });
              clearTimeout(timeout);
              if (res.ok) data = await res.json();
            } catch {}

            if (!data) {
              await new Promise(r => setTimeout(r, 500));
              data = getMockPrediction();
            }
            setResult(data);
            setState('result');
            onResult(data);
          } catch {}
        })();
      }
    }, 5000);
  }, [cameraActive, captureFrame, analyse, onResult]);

  const stopLiveMode = () => {
    setLiveMode(false);
    if (liveIntervalRef.current) {
      clearInterval(liveIntervalRef.current);
      liveIntervalRef.current = null;
    }
  };

  const scanAgain = () => {
    setState('empty');
    setResult(null);
    setBase64(null);
    setPreviewUrl(null);
    setErrorMsg('');
  };

  return (
    <section id="scanner" className="max-w-4xl mx-auto px-4">
      {/* Hero */}
      <div className="text-center mb-8 pt-8">
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-3" style={{ color: 'var(--text)' }}>
          {t('heroTitle').replace(t('heroTitleEm'), '')}
          <em style={{ color: 'var(--accent)' }}>{t('heroTitleEm')}</em>
        </h1>
        <p className="text-sm md:text-base max-w-xl mx-auto" style={{ color: 'var(--text2)' }}>
          {t('heroDesc')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Input */}
        <div className="glass-card p-5 space-y-4">
          {/* Tab switcher */}
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bg3)' }}>
            <button
              onClick={() => { setTab('upload'); stopCamera(); }}
              className={`tab-btn flex-1 flex items-center justify-center gap-2 ${tab === 'upload' ? 'active' : ''}`}
            >
              <Upload className="w-4 h-4" />
              {t('uploadTab')}
            </button>
            <button
              onClick={() => setTab('camera')}
              className={`tab-btn flex-1 flex items-center justify-center gap-2 ${tab === 'camera' ? 'active' : ''}`}
            >
              <Camera className="w-4 h-4" />
              {t('cameraTab')}
            </button>
          </div>

          {/* Upload tab */}
          {tab === 'upload' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
              <div
                className={`drop-zone p-8 text-center ${dragover ? 'dragover' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
                onDragLeave={() => setDragover(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragover(false);
                  const file = e.dataTransfer.files[0];
                  if (file) handleFile(file);
                }}
              >
                {previewUrl && tab === 'upload' ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-56 mx-auto rounded-lg object-contain"
                  />
                ) : (
                  <div className="space-y-3">
                    <Upload className="w-10 h-10 mx-auto" style={{ color: 'var(--text3)' }} />
                    <div className="font-medium" style={{ color: 'var(--text2)' }}>
                      {t('dropTitle')}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text3)' }}>
                      {t('dropSub')}
                    </div>
                    <button className="btn-ghost text-xs">
                      {t('chooseFile')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Camera tab */}
          {tab === 'camera' && (
            <div className="space-y-3">
              <div
                className="relative rounded-xl overflow-hidden"
                style={{ background: '#000', minHeight: '240px' }}
              >
                <video
                  ref={videoRef}
                  className="w-full rounded-xl"
                  autoPlay
                  playsInline
                  muted
                  style={{ display: cameraActive ? 'block' : 'none' }}
                />
                {!cameraActive && (
                  <div className="flex flex-col items-center justify-center h-60 gap-3">
                    <Camera className="w-10 h-10" style={{ color: 'var(--text3)' }} />
                    <span className="text-sm" style={{ color: 'var(--text3)' }}>
                      {t('startCamera')}
                    </span>
                  </div>
                )}
                {/* Live mode indicator */}
                {liveMode && (
                  <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full"
                    style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid var(--accent)' }}>
                    <div className="w-2.5 h-2.5 rounded-full live-dot" style={{ background: 'var(--accent)' }} />
                    <span className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
                      {t('liveScanning')}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text3)' }}>
                      #{liveScanCount}
                    </span>
                  </div>
                )}
                {/* Scan overlay border when live */}
                {liveMode && (
                  <div className="absolute inset-3 rounded-lg pointer-events-none pulse-live"
                    style={{ border: '2px solid var(--accent)' }} />
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" />

              <div className="flex gap-2">
                {!cameraActive ? (
                  <button onClick={startCamera} className="btn-accent flex-1 justify-center">
                    <Video className="w-4 h-4" />
                    {t('startCamera')}
                  </button>
                ) : (
                  <>
                    <button onClick={captureSnapshot} className="btn-accent flex-1 justify-center">
                      <Camera className="w-4 h-4" />
                      {t('capture')}
                    </button>
                    <button
                      onClick={() => liveMode ? stopLiveMode() : startLiveMode()}
                      className={`btn-ghost flex-1 justify-center ${liveMode ? 'pulse-live' : ''}`}
                      style={liveMode ? { borderColor: 'var(--accent)', color: 'var(--accent)' } : {}}
                    >
                      <Zap className="w-4 h-4" />
                      {liveMode ? t('liveModeOn') : t('liveModeOff')}
                    </button>
                    <button onClick={stopCamera} className="btn-ghost justify-center">
                      <VideoOff className="w-4 h-4" />
                      {t('stop')}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Preview from camera capture */}
          {tab === 'camera' && previewUrl && !liveMode && (
            <div className="rounded-xl overflow-hidden">
              <img src={previewUrl} alt="Captured" className="w-full rounded-xl object-contain max-h-40" />
            </div>
          )}

          {/* Analyse button */}
          {base64 && state !== 'result' && !liveMode && (
            <button
              onClick={() => analyse()}
              disabled={state === 'loading'}
              className="btn-accent w-full justify-center"
            >
              {state === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('analysing')}
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  {t('analyse')}
                </>
              )}
            </button>
          )}
        </div>

        {/* Right: Result */}
        <div>
          {state === 'empty' && !result && (
            <div className="glass-card p-8 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'var(--accent-bg)', border: '1px solid var(--border)' }}>
                <Zap className="w-8 h-8" style={{ color: 'var(--accent)' }} />
              </div>
              <h3 className="font-semibold text-lg mb-1" style={{ color: 'var(--text)' }}>
                {t('ready')}
              </h3>
              <p className="text-sm" style={{ color: 'var(--text3)' }}>
                {t('readySub')}
              </p>
            </div>
          )}

          {state === 'loading' && !result && (
            <div className="glass-card p-8 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
              <div className="spinner mb-4" />
              <p className="text-sm font-medium" style={{ color: 'var(--text2)' }}>
                {t('analysing')}
              </p>
            </div>
          )}

          {state === 'error' && (
            <div className="glass-card p-8 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
              <AlertCircle className="w-12 h-12 mb-3" style={{ color: 'var(--danger)' }} />
              <p className="text-sm" style={{ color: 'var(--danger)' }}>{errorMsg}</p>
              <button onClick={scanAgain} className="btn-ghost mt-4">
                {t('scanAgain')}
              </button>
            </div>
          )}

          {result && (
            <ResultCard
              result={result}
              lang={lang}
              t={t}
              onScanAgain={scanAgain}
            />
          )}
        </div>
      </div>
    </section>
  );
}
