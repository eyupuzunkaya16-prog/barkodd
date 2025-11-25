import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { XCircle, Camera } from 'lucide-react';

interface ScannerProps {
  onScan: (decodedText: string, decodedResult: any) => void;
  isActive: boolean;
  flashOn?: boolean;
  soundEnabled?: boolean;
  vibrateEnabled?: boolean;
  hideOverlay?: boolean;
}

export interface ScannerHandle {
  toggleFlash: () => Promise<void>;
  scanImage: (file: File) => Promise<void>;
}

export const Scanner = forwardRef<ScannerHandle, ScannerProps>(({ 
  onScan, 
  isActive, 
  flashOn = false,
  soundEnabled = true,
  vibrateEnabled = true,
  hideOverlay = false
}, ref) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const playBeep = () => {
    if (!soundEnabled) return;
    try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.value = 800; // Hz
        gainNode.gain.value = 0.1;

        oscillator.start();
        setTimeout(() => {
        oscillator.stop();
        }, 100);
    } catch (e) {
        console.error("Audio play failed", e);
    }
  };

  useImperativeHandle(ref, () => ({
    toggleFlash: async () => {
        // Controlled via props
    },
    scanImage: async (file: File) => {
        // Create a unique temporary ID for file scanning to avoid conflicts with live camera
        const tempId = `file-scanner-${Date.now()}`;
        const tempDiv = document.createElement("div");
        tempDiv.id = tempId;
        // IMPORTANT: 'display: none' prevents scanning in some rendering engines.
        // Using off-screen absolute positioning is safer.
        tempDiv.style.position = "absolute";
        tempDiv.style.left = "-9999px";
        tempDiv.style.top = "0";
        document.body.appendChild(tempDiv);

        try {
            // Instantiate a fresh scanner specifically for this file
            const fileScanner = new Html5Qrcode(tempId, false);
            
            // Scan the file
            const result = await fileScanner.scanFileV2(file, true);
            
            if (result && result.decodedText) {
                playBeep();
                if(vibrateEnabled && navigator.vibrate) navigator.vibrate(50);
                onScan(result.decodedText, result);
            }
            
            // Clean up scanner instance
            await fileScanner.clear();
        } catch (err) {
            console.error("File scan error", err);
            alert("Görselde barkod bulunamadı. Lütfen barkodun net ve aydınlık olduğundan emin olun.");
        } finally {
            // Remove temp element from DOM
            const node = document.getElementById(tempId);
            if (node) {
                document.body.removeChild(node);
            }
        }
    }
  }));

  // Toggle Flash Logic
  useEffect(() => {
    if (!scannerRef.current || !isActive) return;
    
    const applyTorch = async () => {
        try {
            const settings = scannerRef.current?.getRunningTrackCameraCapabilities();
            // @ts-ignore
            if (settings && settings.torchFeature().isSupported()) {
                 await scannerRef.current?.applyVideoConstraints({
                    advanced: [{ torch: flashOn }]
                } as any);
            }
        } catch (err) {
            console.log("Torch operation failed", err);
        }
    };
    applyTorch();
  }, [flashOn, isActive]);

  // Manuel Retry Fonksiyonu
  const handleRetry = async () => {
    setHasPermission(null);
    try {
        // Doğrudan izin istemeyi dene
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: { ideal: "environment" } 
            } 
        });
        // İzin alındı, stream'i kapat ve scanner'ı yeniden tetikle
        stream.getTracks().forEach(track => track.stop());
        setRetryCount(prev => prev + 1);
    } catch (e) {
        console.error("Manuel izin isteği başarısız", e);
        // İzin başarısız olsa bile retryCount artırarak scanner başlatmayı deniyoruz
        setRetryCount(prev => prev + 1);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (!isActive) {
      if (scannerRef.current) {
        scannerRef.current.stop().then(() => {
            if (scannerRef.current) {
                scannerRef.current.clear();
                scannerRef.current = null;
            }
        }).catch(err => console.error("Failed to stop scanner", err));
      }
      return;
    }

    const startScanner = async () => {
      if (!mountRef.current || !isMounted) return;

      const scannerId = "reader";
      let div = document.getElementById(scannerId);
      if (!div) {
        div = document.createElement('div');
        div.id = scannerId;
        div.style.width = "100%";
        div.style.height = "100%";
        div.style.overflow = "hidden";
        mountRef.current.appendChild(div);
      }

      try {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
                scannerRef.current.clear();
            } catch (e) { /* ignore */ }
        }

        const html5QrCode = new Html5Qrcode(scannerId);
        scannerRef.current = html5QrCode;

        // Configuration
        const config = {
            fps: 15,
            qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
                const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                return {
                    width: Math.floor(viewfinderWidth * 0.8),
                    height: Math.floor(minEdge * 0.4)
                };
            },
            aspectRatio: undefined,
            experimentalFeatures: {
                useBarCodeDetectorIfSupported: true
            },
            videoConstraints: {
                facingMode: { ideal: "environment" },
                // Android WebView için daha esnek çözünürlük ayarları
                // width/height zorlaması bazen başlatma hatasına neden olabilir
                width: { min: 480, ideal: 1280 }, 
                height: { min: 480, ideal: 720 },
                focusMode: "continuous"
            },
            formatsToSupport: [
                Html5QrcodeSupportedFormats.QR_CODE,
                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.EAN_8,
                Html5QrcodeSupportedFormats.CODE_128,
                Html5QrcodeSupportedFormats.CODE_39,
                Html5QrcodeSupportedFormats.UPC_A,
                Html5QrcodeSupportedFormats.UPC_E,
                Html5QrcodeSupportedFormats.CODABAR,
                Html5QrcodeSupportedFormats.ITF,
                Html5QrcodeSupportedFormats.CODE_93,
                Html5QrcodeSupportedFormats.DATA_MATRIX
            ]
        };

        // Gelişmiş Kamera Tespiti (APK için Kritik)
        let cameraIdOrConfig: any = { facingMode: "environment" };
        try {
            const devices = await Html5Qrcode.getCameras();
            if (devices && devices.length > 0) {
                const backCamera = devices.find(d => 
                    d.label.toLowerCase().includes('back') || 
                    d.label.toLowerCase().includes('arka') ||
                    d.label.toLowerCase().includes('environment')
                );
                
                if (backCamera) {
                    cameraIdOrConfig = backCamera.id;
                }
            }
        } catch (e) {
            console.warn("Kamera listesi alınamadı, varsayılan moda geçiliyor", e);
        }

        await html5QrCode.start(
          cameraIdOrConfig,
          config as any,
          (decodedText, decodedResult) => {
            if (!isMounted) return;
            playBeep();
            if(vibrateEnabled && navigator.vibrate) navigator.vibrate(50);
            onScan(decodedText, decodedResult);
          },
          (errorMessage) => {
            // parse error
          }
        );
        if (isMounted) setHasPermission(true);
      } catch (err: any) {
        console.error("Error starting scanner", err);
        // Eğer HD başlatılamazsa, basit konfigürasyonla tekrar dene (Fallback)
        if (isMounted) {
            setHasPermission(false);
        }
      }
    };

    const timer = setTimeout(() => {
        startScanner();
    }, 300);

    return () => {
        isMounted = false;
        clearTimeout(timer);
        if (scannerRef.current && scannerRef.current.isScanning) {
            scannerRef.current.stop().then(() => {
                scannerRef.current?.clear();
                scannerRef.current = null;
            }).catch(console.error);
        }
    };
  }, [isActive, onScan, retryCount]);

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 bg-black overflow-hidden z-10">
        <style>
            {`
            #reader {
                width: 100% !important;
                height: 100% !important;
                border: none !important;
                overflow: hidden !important;
            }
            #reader video {
                width: 100% !important;
                height: 100% !important;
                object-fit: cover !important;
                border-radius: 0 !important;
            }
            `}
        </style>
        <div ref={mountRef} className="w-full h-full" />
        
        {/* Visual Overlay for Framing */}
        {!hideOverlay && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                 {/* Responsive Rectangular Box */}
                <div className="relative w-[80%] h-[30%] max-w-sm">
                    <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-white/50 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-white/50 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-white/50 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-white/50 rounded-br-lg"></div>
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                </div>
            </div>
        )}

        {hasPermission === false && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/95 text-white p-6 text-center z-50 animate-in fade-in">
                <div className="bg-gray-800 p-4 rounded-full mb-6 relative">
                    <Camera className="w-12 h-12 text-blue-500" />
                    <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-1 border-2 border-gray-800">
                        <XCircle className="w-4 h-4 text-white" />
                    </div>
                </div>
                
                <h3 className="text-xl font-bold mb-2">Kamera Başlatılamadı</h3>
                <p className="text-gray-400 mb-8 max-w-xs mx-auto text-sm leading-relaxed">
                    Uygulama izinlerini ayarlardan kontrol edin veya tekrar deneyin.
                </p>
                
                <button 
                    onClick={handleRetry}
                    className="w-full max-w-xs bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold active:scale-95 transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                >
                    <Camera className="w-5 h-5" />
                    Tekrar Dene (Zorla)
                </button>
            </div>
        )}
    </div>
  );
});