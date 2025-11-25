import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Scan, List, FileSpreadsheet, Trash2, Settings, Package, Search, Globe, ShoppingCart, ExternalLink, X, Zap, ZapOff, Keyboard, Plus, ChevronRight, Lock, Palette, Smartphone, Bell, Volume2, History, Copy, User, Database, Star, Image as ImageIcon, Unlock, Check, MoreVertical, Calendar, ArrowLeft, Clock, ShieldCheck, PaintBucket, Ban, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Scanner, ScannerHandle } from './components/Scanner';
import { Button } from './components/Button';
import { ScannedItem, AppView, AppSettings } from './types';

// Helper for safe ID generation (Works on all Android WebViews)
const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

// Lock Screen Component
const LockScreen = ({ onUnlock, isSettingPin = false, onSetPin }: { onUnlock: (pin: string) => void, isSettingPin?: boolean, onSetPin?: (pin: string) => void }) => {
    const [pin, setPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [step, setStep] = useState<'enter' | 'create' | 'confirm'>(isSettingPin ? 'create' : 'enter');
    const [error, setError] = useState("");

    const handleNumClick = (num: string) => {
        if (pin.length < 4) {
            const newPin = pin + num;
            setPin(newPin);
            setError("");
        }
    };

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1));
        setError("");
    };

    const handleSubmit = () => {
        if (pin.length !== 4) return;

        if (step === 'enter') {
            onUnlock(pin);
            setPin("");
        } else if (step === 'create') {
            setConfirmPin(pin);
            setPin("");
            setStep('confirm');
        } else if (step === 'confirm') {
            if (pin === confirmPin) {
                if (onSetPin) onSetPin(pin);
            } else {
                setError("Pinler eşleşmedi, tekrar dene.");
                setPin("");
                setConfirmPin("");
                setStep('create');
            }
        }
    };

    // Auto submit when 4 digits reached
    useEffect(() => {
        if (pin.length === 4) {
             // Small delay for UX
             const timer = setTimeout(() => handleSubmit(), 200);
             return () => clearTimeout(timer);
        }
    }, [pin]);

    return (
        <div className="absolute inset-0 z-50 bg-gray-900/95 backdrop-blur-xl flex flex-col items-center justify-center text-white p-6 animate-in fade-in duration-300">
            <div className="mb-8 flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
                    <Lock className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold">
                    {step === 'enter' ? 'BarkodX Kilitli' : step === 'create' ? 'Yeni Pin Oluştur' : 'Pini Onayla'}
                </h2>
                <p className="text-gray-400 text-sm mt-2">
                    {error || (step === 'enter' ? 'Devam etmek için 4 haneli pini girin' : 'Güvenlik için 4 haneli bir pin belirleyin')}
                </p>
            </div>

            <div className="flex gap-4 mb-12">
                {[0, 1, 2, 3].map(i => (
                    <div key={i} className={`w-4 h-4 rounded-full transition-all duration-300 ${i < pin.length ? 'bg-blue-500 scale-110' : 'bg-gray-700'}`} />
                ))}
            </div>

            <div className="grid grid-cols-3 gap-6 w-full max-w-xs">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button
                        key={num}
                        onClick={() => handleNumClick(num.toString())}
                        className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 flex items-center justify-center text-2xl font-medium transition-all"
                    >
                        {num}
                    </button>
                ))}
                <div className="col-start-2">
                    <button
                        onClick={() => handleNumClick('0')}
                        className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 flex items-center justify-center text-2xl font-medium transition-all"
                    >
                        0
                    </button>
                </div>
                <div className="col-start-3">
                    <button
                        onClick={handleDelete}
                        className="w-16 h-16 rounded-full flex items-center justify-center text-red-400 hover:text-red-300 transition-all"
                    >
                        <X className="w-8 h-8" />
                    </button>
                </div>
            </div>
            {step === 'create' && (
                 <button onClick={() => window.location.reload()} className="mt-8 text-sm text-gray-500 hover:text-gray-300">
                    İptal Et
                 </button>
            )}
        </div>
    );
};

// Pro Sales Modal Component
const ProModal = ({ onClose, onUpgrade }: { onClose: () => void, onUpgrade: () => void }) => {
    return (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300 relative">
                {/* Header */}
                <div className="bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 p-8 text-white relative overflow-hidden">
                    <button 
                        onClick={onClose} 
                        className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors z-50"
                        aria-label="Kapat"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md">
                            <Star className="w-8 h-8 text-white fill-current" />
                        </div>
                        <h2 className="text-3xl font-bold mb-1">BarkodX Pro</h2>
                        <p className="text-amber-100 font-medium opacity-90">Sınırları kaldır, profesyonel ol.</p>
                    </div>
                    {/* Decorative circles */}
                    <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-orange-600/30 rounded-full blur-xl pointer-events-none"></div>
                </div>

                {/* Slogan */}
                <div className="bg-amber-50 px-6 py-3 border-b border-amber-100">
                    <p className="text-amber-800 text-center font-semibold text-sm">
                        ✨ Bütün profesyonel özellikler, reklamsız.
                    </p>
                </div>

                {/* Features List */}
                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Ban className="w-6 h-6" /></div>
                        <div>
                            <h3 className="font-bold text-gray-900">Reklamsız Deneyim</h3>
                            <p className="text-xs text-gray-500">Tamamen odaklanın, kesinti yok.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Smartphone className="w-6 h-6" /></div>
                        <div>
                            <h3 className="font-bold text-gray-900">Toplu Tarama Modu</h3>
                            <p className="text-xs text-gray-500">Listeye girmeden seri barkod okuyun.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Lock className="w-6 h-6" /></div>
                        <div>
                            <h3 className="font-bold text-gray-900">Uygulama Kilidi</h3>
                            <p className="text-xs text-gray-500">Verilerinizi PIN ile güvende tutun.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-pink-100 text-pink-600 rounded-lg"><Palette className="w-6 h-6" /></div>
                        <div>
                            <h3 className="font-bold text-gray-900">Tam Özelleştirme</h3>
                            <p className="text-xs text-gray-500">Size özel tema ve renkler.</p>
                        </div>
                    </div>
                </div>

                {/* Action */}
                <div className="p-6 pt-2 bg-gray-50">
                    <button 
                        onClick={onUpgrade}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        Pro'ya Geç
                        <ChevronRight className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={onClose} 
                        className="w-full py-3 mt-2 text-gray-400 text-sm font-medium hover:text-gray-600 transition-colors"
                    >
                        Hayır, teşekkürler
                    </button>
                </div>
            </div>
        </div>
    );
};

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.SCANNER);
  const [items, setItems] = useState<ScannedItem[]>([]);
  const [history, setHistory] = useState<ScannedItem[]>([]);
  const [flashOn, setFlashOn] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  
  // Premium & Lock State
  const [isPremium, setIsPremium] = useState(false); // Default free version
  const [showProModal, setShowProModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Initially true unless locked
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [wrongPinShake, setWrongPinShake] = useState(false);
  
  // List View States
  const [showListMenu, setShowListMenu] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const scannerRef = useRef<ScannerHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Settings State
  const [settings, setSettings] = useState<AppSettings>({
    batchScan: false, // Default false for free users
    vibration: true,
    sound: true,
    history: true,
    allowDuplicates: true,
    isAppLocked: false,
    pinCode: null,
    theme: {
        bg: '#f3f4f6', // Default Tailwind gray-50 equivalent
        primary: '#2563eb' // Default Tailwind blue-600 equivalent
    }
  });

  // Init Camera Permission on Mount
  useEffect(() => {
    const initCamera = async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                // Bu çağrı, tarayıcı/uygulama tarafından "Kamera izni verilsin mi?" sorusunu tetikler.
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                // İzin alındıysa, stream'i hemen durduruyoruz ki Scanner bileşeni kamerayı kullanabilsin.
                stream.getTracks().forEach(track => track.stop());
                console.log("Kamera izni başlangıçta alındı.");
            } catch (e) {
                console.error("Otomatik kamera izni isteği başarısız oldu veya reddedildi:", e);
            }
        }
    };
    initCamera();
  }, []);

  // Load History from LocalStorage
  useEffect(() => {
      const savedHistory = localStorage.getItem('barkodx_history');
      if (savedHistory) {
          try {
              setHistory(JSON.parse(savedHistory));
          } catch (e) {
              console.error("Failed to parse history", e);
          }
      }
  }, []);

  // Save History to LocalStorage
  useEffect(() => {
      if (settings.history) {
          localStorage.setItem('barkodx_history', JSON.stringify(history));
      }
  }, [history, settings.history]);

  // Check lock status on mount
  useEffect(() => {
      if (settings.isAppLocked) {
          setIsAuthenticated(false);
      }
  }, [settings.isAppLocked]);
  
  // Browser Mode State
  const [browserBarcode, setBrowserBarcode] = useState<string | null>(null);

  // Handle successful scan
  const handleScan = useCallback((barcode: string, result: any) => {
    try {
        // Handling for BROWSER mode
        if (view === AppView.BROWSER) {
            setBrowserBarcode(barcode);
            return;
        }

        // Handling for SCANNER (Inventory) mode
        const now = Date.now();
        // SAFE ID GENERATION REPLACEMENT
        const newId = generateId();

        const newItem: ScannedItem = {
            id: newId,
            barcode: barcode,
            format: result?.result?.format?.formatName || 'MANUAL/UNKNOWN',
            timestamp: now,
        };

        setItems(prev => {
            const lastItem = prev[prev.length - 1];
            
            // Anti-bounce for session items (Reduced to 1s for better feel)
            if (lastItem && lastItem.barcode === barcode && (now - lastItem.timestamp < 1000)) {
                return prev;
            }

            if (!settings.allowDuplicates) {
                const exists = prev.some(item => item.barcode === barcode);
                if (exists) {
                    // Visual feedback even if duplicate ignored
                    setLastScanned(barcode + " (Tekrar)");
                    if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
                    scanTimeoutRef.current = setTimeout(() => setLastScanned(null), 2000);
                    return prev;
                }
            }

            // Show visual feedback toast for successful scan
            setLastScanned(barcode);
            if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
            scanTimeoutRef.current = setTimeout(() => setLastScanned(null), 2000);
            
            return [...prev, newItem];
        });

        // Update History (Persistent)
        if (settings.history) {
            setHistory(prev => {
                const lastHistoryItem = prev[0];
                if (lastHistoryItem && lastHistoryItem.barcode === barcode && (now - lastHistoryItem.timestamp < 1000)) {
                    return prev;
                }
                return [newItem, ...prev];
            });
        }

        // Handle Batch Scan Setting
        if (!settings.batchScan && view === AppView.SCANNER) {
            // Slight delay to allow user to see the "Scanned" toast
            setTimeout(() => {
                setView(AppView.LIST);
            }, 500);
        }
    } catch (error) {
        console.error("Scan handling error:", error);
        alert("Barkod işlenirken bir hata oluştu.");
    }
  }, [view, settings.allowDuplicates, settings.batchScan, settings.history]);

  // Handle Manual Input
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleScan(manualCode.trim(), null);
    setManualCode("");
  };

  // Handle File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && scannerRef.current) {
        await scannerRef.current.scanImage(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Export to Excel
  const exportToExcel = (dataToExport: ScannedItem[], filenamePrefix: string) => {
    if (dataToExport.length === 0) return;
    const exportData = dataToExport.map(item => ({
        'Barkod': item.barcode,
        'Format': item.format,
        'Okuma Zamanı': new Date(item.timestamp).toLocaleString('tr-TR'),
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Barkod Listesi");
    XLSX.writeFile(wb, `${filenamePrefix}_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const clearList = () => {
    if (window.confirm("Anlık listeyi silmek istediğinize emin misiniz?")) setItems([]);
  };

  const clearHistory = () => {
    if (window.confirm("Tüm geçmişi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) {
        setHistory([]);
        localStorage.removeItem('barkodx_history');
    }
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const toggleSetting = (key: keyof AppSettings) => {
    // Premium Checks
    if (key === 'batchScan' && !isPremium) {
        setShowProModal(true);
        return;
    }

    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLockToggle = () => {
      if (!isPremium && !settings.isAppLocked) {
          setShowProModal(true);
          return;
      }

      if (settings.isAppLocked) {
          // Unlocking app setting
          setSettings(prev => ({ ...prev, isAppLocked: false, pinCode: null }));
      } else {
          // Locking app setting -> Show Pin Setup
          setShowPinSetup(true);
      }
  };

  const handlePinSet = (pin: string) => {
      setSettings(prev => ({ ...prev, isAppLocked: true, pinCode: pin }));
      setShowPinSetup(false);
  };

  const handleUnlockApp = (pin: string) => {
      if (pin === settings.pinCode) {
          setIsAuthenticated(true);
      } else {
          setWrongPinShake(true);
          setTimeout(() => setWrongPinShake(false), 500);
          alert("Hatalı Pin!");
      }
  };
  
  const updateTheme = (type: 'bg' | 'primary', color: string) => {
      if (!isPremium) {
          setShowProModal(true);
          return;
      }
      setSettings(prev => ({
          ...prev,
          theme: {
              ...prev.theme,
              [type]: color
          }
      }));
  };

  const handleUpgrade = () => {
      setIsPremium(true);
      setShowProModal(false);
  };

  const openSearch = (platform: 'google' | 'amazon' | 'trendyol' | 'hepsiburada') => {
    if (!browserBarcode) return;
    let url = '';
    switch(platform) {
        case 'google': url = `https://www.google.com/search?q=${browserBarcode}`; break;
        case 'amazon': url = `https://www.amazon.com.tr/s?k=${browserBarcode}`; break;
        case 'trendyol': url = `https://www.trendyol.com/sr?q=${browserBarcode}`; break;
        case 'hepsiburada': url = `https://www.hepsiburada.com/ara?q=${browserBarcode}`; break;
    }
    window.open(url, '_blank');
  };

  // Switch Component
  const Switch = ({ checked, onChange, disabled = false }: { checked: boolean; onChange: () => void, disabled?: boolean }) => (
    <button 
        onClick={onChange}
        disabled={disabled}
        className={`w-12 h-7 rounded-full transition-colors relative ${checked ? 'bg-current opacity-100' : 'bg-gray-200'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        style={{ color: checked ? settings.theme.primary : undefined }}
    >
        <div className={`w-5 h-5 bg-white rounded-full shadow-md absolute top-1 transition-transform ${checked ? 'left-6' : 'left-1'}`} />
    </button>
  );

  // Settings Row Component
  const SettingsRow = ({ icon, title, subtitle, action, isDanger = false, isPro = false, onClick }: any) => {
      const isLocked = isPro && !isPremium;
      return (
        <div 
            onClick={isLocked ? () => setShowProModal(true) : onClick}
            className={`flex items-center justify-between p-4 bg-white border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors ${isLocked ? 'cursor-pointer' : ''}`}
        >
            <div className={`flex items-center gap-3 ${isLocked ? 'opacity-60' : ''}`}>
                <div 
                    className={`p-2 rounded-lg ${isDanger ? 'bg-red-50 text-red-500' : 'bg-gray-100'}`}
                    style={!isDanger ? { color: settings.theme.primary, backgroundColor: `${settings.theme.primary}15` } : undefined}
                >
                    {icon}
                </div>
                <div>
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                        {title}
                        {isPro && !isPremium && <Lock className="w-3 h-3 text-amber-500" />}
                        {isPro && isPremium && <span className="text-[10px] font-bold bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded">PRO</span>}
                    </div>
                    {subtitle && <div className="text-xs text-gray-500 mt-0.5">{subtitle}</div>}
                </div>
            </div>
            <div className={isLocked ? 'pointer-events-none' : ''}>{action}</div>
        </div>
      );
  };

  // Dynamic Styles
  const primaryStyle = { backgroundColor: settings.theme.primary, color: 'white' };
  const textPrimaryStyle = { color: settings.theme.primary };
  const bgStyle = { backgroundColor: settings.theme.primary + '15' }; // 15 = low opacity hex

  // Lock Screen Check
  if (settings.isAppLocked && !isAuthenticated) {
      return <LockScreen onUnlock={handleUnlockApp} />;
  }

  // Pin Setup Modal
  if (showPinSetup) {
      return <LockScreen onUnlock={() => {}} isSettingPin={true} onSetPin={handlePinSet} />;
  }

  // Navigation Logic Rendering
  const renderContent = () => {
    switch(view) {
        case AppView.SCANNER:
            return (
                <div className="absolute inset-0 w-full h-full bg-black">
                     <Scanner 
                        ref={scannerRef}
                        isActive={view === AppView.SCANNER} 
                        onScan={handleScan} 
                        flashOn={flashOn}
                        soundEnabled={settings.sound}
                        vibrateEnabled={settings.vibration}
                        hideOverlay={true}
                     />
                     
                     <div className="absolute inset-0 pointer-events-none flex flex-col justify-between z-20">
                        {/* Top Bar with Count */}
                        <div className="p-6 pt-12 flex justify-between items-start">
                            <div>
                                <h1 className="text-white font-bold text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Sayım Modu</h1>
                                <p className="text-white/90 text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{items.length} ürün okundu</p>
                            </div>
                            <button onClick={() => setView(AppView.LIST)} className="pointer-events-auto bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/30 transition-colors shadow-lg">
                                <List className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Last Scanned Toast Notification */}
                        {lastScanned && (
                            <div className="absolute top-28 left-0 right-0 flex justify-center animate-in fade-in slide-in-from-top-4 duration-300">
                                <div className="bg-green-500/90 backdrop-blur-md text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-xl border border-white/20">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="font-mono font-bold">{lastScanned}</span>
                                </div>
                            </div>
                        )}

                        {/* Bottom Controls */}
                        <div className="p-6 pb-14 space-y-4">
                            <form onSubmit={handleManualSubmit} className="pointer-events-auto w-full relative group">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                    <Keyboard className="h-5 w-5 text-gray-400" />
                                </div>
                                <input 
                                    type="text" 
                                    value={manualCode}
                                    onChange={(e) => setManualCode(e.target.value)}
                                    placeholder="Barkodu manuel gir..." 
                                    className="w-full bg-white/90 backdrop-blur-md text-gray-900 pl-10 pr-12 py-3 rounded-xl focus:ring-2 focus:bg-white outline-none shadow-lg transition-all"
                                    style={{ '--tw-ring-color': settings.theme.primary } as React.CSSProperties}
                                />
                                <button 
                                    type="submit"
                                    disabled={!manualCode}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-white rounded-lg disabled:opacity-50 disabled:bg-gray-400"
                                    style={manualCode ? primaryStyle : undefined}
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </form>

                            <div className="flex justify-center items-center gap-8 pt-2">
                                <button onClick={() => setFlashOn(!flashOn)} className="pointer-events-auto flex flex-col items-center gap-1 group">
                                    <div className={`p-4 rounded-full backdrop-blur-md transition-all shadow-lg ${flashOn ? 'bg-yellow-400/90 text-yellow-900' : 'bg-gray-800/60 text-white border border-white/20'}`}>
                                        {flashOn ? <ZapOff className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
                                    </div>
                                    <span className="text-xs text-white font-medium drop-shadow-md">Flaş</span>
                                </button>

                                <button onClick={() => fileInputRef.current?.click()} className="pointer-events-auto flex flex-col items-center gap-1 group">
                                    <div className="p-4 rounded-full backdrop-blur-md bg-gray-800/60 text-white border border-white/20 transition-all hover:bg-gray-700/60 shadow-lg">
                                        <ImageIcon className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs text-white font-medium drop-shadow-md">Galeri</span>
                                </button>
                            </div>
                        </div>
                     </div>
                </div>
            );
        
        case AppView.BROWSER:
            return (
                <div className="flex flex-col h-full gap-4 relative p-4" style={{ backgroundColor: settings.theme.bg }}>
                     <div className="flex items-center gap-2 mb-2 pt-2">
                        <div className="p-2 rounded-lg shadow-lg" style={primaryStyle}>
                            <Search className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Ara & Bul</h1>
                     </div>

                    {browserBarcode ? (
                        <div className="absolute inset-0 z-10 bg-white rounded-2xl flex flex-col p-6 animate-in fade-in zoom-in duration-200 mt-20 mx-4 shadow-2xl border border-gray-200 h-[80%]">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Ürün Bulundu</h2>
                                    <p className="text-gray-500 font-mono mt-1 text-lg">{browserBarcode}</p>
                                </div>
                                <button onClick={() => setBrowserBarcode(null)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                                    <X className="w-6 h-6 text-gray-600" />
                                </button>
                            </div>
                            <div className="space-y-3 flex-grow overflow-y-auto">
                                <button onClick={() => openSearch('google')} className="w-full flex items-center justify-between p-4 rounded-xl bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-all active:scale-95 group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><Globe className="w-5 h-5" /></div>
                                        <span className="font-semibold text-gray-700">Google'da Ara</span>
                                    </div>
                                    <ExternalLink className="w-5 h-5 text-gray-300 group-hover:text-blue-500" />
                                </button>

                                <button onClick={() => openSearch('amazon')} className="w-full flex items-center justify-between p-4 rounded-xl bg-yellow-50 border border-yellow-200 shadow-sm hover:bg-yellow-100 transition-all active:scale-95 group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600"><ShoppingCart className="w-5 h-5" /></div>
                                        <span className="font-semibold text-gray-800">Amazon'da Ara</span>
                                    </div>
                                    <ExternalLink className="w-5 h-5 text-gray-300 group-hover:text-yellow-500" />
                                </button>

                                <button onClick={() => openSearch('trendyol')} className="w-full flex items-center justify-between p-4 rounded-xl bg-orange-50 border border-orange-200 shadow-sm hover:bg-orange-100 transition-all active:scale-95 group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600"><Search className="w-5 h-5" /></div>
                                        <span className="font-semibold text-gray-800">Trendyol'da Ara</span>
                                    </div>
                                    <ExternalLink className="w-5 h-5 text-gray-300 group-hover:text-orange-500" />
                                </button>

                                <button onClick={() => openSearch('hepsiburada')} className="w-full flex items-center justify-between p-4 rounded-xl bg-rose-50 border border-rose-200 shadow-sm hover:bg-rose-100 transition-all active:scale-95 group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600"><Package className="w-5 h-5" /></div>
                                        <span className="font-semibold text-gray-800">Hepsiburada'da Ara</span>
                                    </div>
                                    <ExternalLink className="w-5 h-5 text-gray-300 group-hover:text-rose-500" />
                                </button>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <Button onClick={() => setBrowserBarcode(null)} style={primaryStyle} className="w-full">
                                    Yeni Tarama Yap
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-grow relative rounded-3xl overflow-hidden bg-black">
                             <Scanner 
                                ref={scannerRef}
                                isActive={view === AppView.BROWSER && !browserBarcode} 
                                onScan={handleScan} 
                                flashOn={flashOn}
                                soundEnabled={settings.sound} 
                                vibrateEnabled={settings.vibration}
                                hideOverlay={true}
                             />

                            {/* UI Overlay for Browser Mode */}
                            <div className="absolute inset-x-0 bottom-0 p-4 pb-6 z-20 pointer-events-none">
                                <form onSubmit={handleManualSubmit} className="pointer-events-auto w-full relative group mb-4">
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <Keyboard className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input 
                                        type="text" 
                                        value={manualCode}
                                        onChange={(e) => setManualCode(e.target.value)}
                                        placeholder="Barkodu manuel gir..." 
                                        className="w-full bg-white/90 backdrop-blur-md text-gray-900 pl-10 pr-12 py-3 rounded-xl focus:ring-2 focus:bg-white outline-none shadow-lg transition-all"
                                        style={{ '--tw-ring-color': settings.theme.primary } as React.CSSProperties}
                                    />
                                    <button 
                                        type="submit"
                                        disabled={!manualCode}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-white rounded-lg disabled:opacity-50 disabled:bg-gray-400"
                                        style={manualCode ? primaryStyle : undefined}
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </form>

                                <div className="flex justify-center items-center gap-8 pointer-events-auto">
                                    <button onClick={() => setFlashOn(!flashOn)} className="flex flex-col items-center gap-1 group">
                                        <div className={`p-3 rounded-full backdrop-blur-md transition-all shadow-lg ${flashOn ? 'bg-yellow-400/90 text-yellow-900' : 'bg-gray-800/60 text-white border border-white/20'}`}>
                                            {flashOn ? <ZapOff className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                                        </div>
                                        <span className="text-[10px] text-white font-medium drop-shadow-md">Flaş</span>
                                    </button>

                                    <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-1 group">
                                        <div className="p-3 rounded-full backdrop-blur-md bg-gray-800/60 text-white border border-white/20 transition-all hover:bg-gray-700/60 shadow-lg">
                                            <ImageIcon className="w-5 h-5" />
                                        </div>
                                        <span className="text-[10px] text-white font-medium drop-shadow-md">Galeri</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            );

        case AppView.LIST:
            return (
                <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden m-4 mt-0 relative">
                    {/* History Overlay */}
                    {showHistory && (
                        <div className="absolute inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-right duration-300">
                             <div className="p-4 pt-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                        <ArrowLeft className="w-5 h-5 text-gray-700" />
                                    </button>
                                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <History className="w-5 h-5" style={textPrimaryStyle} />
                                        Geçmiş
                                    </h2>
                                </div>
                                <button onClick={clearHistory} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Geçmişi Temizle">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex-grow overflow-y-auto p-0 bg-gray-50">
                                {history.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                                        <History className="w-16 h-16 mb-4 opacity-20" />
                                        <p>Geçmiş kaydı bulunamadı.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {history.map((item, idx) => (
                                            <div key={idx} className="flex items-start justify-between p-4 bg-white hover:bg-gray-50 transition-colors">
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-1 flex-shrink-0">
                                                        <Calendar className="w-4 h-4 text-gray-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-mono text-gray-800 font-bold text-lg">{item.barcode}</p>
                                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {new Date(item.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                            <span>{new Date(item.timestamp).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                             <div className="p-4 border-t border-gray-100 bg-white">
                                <Button onClick={() => exportToExcel(history, 'Gecmis')} disabled={history.length === 0} className="w-full text-white" style={{ backgroundColor: '#16a34a' }} icon={<FileSpreadsheet className="w-5 h-5" />}>Geçmişi Excel'e Aktar</Button>
                            </div>
                        </div>
                    )}

                    {/* Main List Header */}
                    <div className="p-4 pt-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <List className="w-5 h-5" style={textPrimaryStyle} />
                            Okunanlar Listesi
                        </h2>
                        
                        <div className="flex items-center gap-1">
                            <button onClick={clearList} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 className="w-5 h-5" />
                            </button>
                            
                            <div className="relative">
                                <button 
                                    onClick={() => setShowListMenu(!showListMenu)} 
                                    className={`p-2 rounded-lg transition-colors ${showListMenu ? 'bg-gray-200 text-gray-800' : 'text-gray-400 hover:bg-gray-100'}`}
                                >
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                                
                                {showListMenu && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setShowListMenu(false)}></div>
                                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-20 py-2 animate-in fade-in zoom-in-95 duration-100">
                                            <button 
                                                onClick={() => {
                                                    setShowHistory(true);
                                                    setShowListMenu(false);
                                                }}
                                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                            >
                                                <History className="w-4 h-4" />
                                                Geçmiş
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex-grow overflow-y-auto p-0" style={{ backgroundColor: settings.theme.bg + '80' }}>
                        {items.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                                <Package className="w-16 h-16 mb-4 opacity-20" />
                                <p>Henüz envanter için barkod okutulmadı.</p>
                                <Button onClick={() => setView(AppView.SCANNER)} variant="ghost" className="mt-4" style={textPrimaryStyle}>Envanter Taramaya Başla</Button>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {[...items].reverse().map((item, idx) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 bg-white hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={bgStyle}>
                                                <span style={textPrimaryStyle}>{items.length - idx}</span>
                                            </span>
                                            <div className="min-w-0">
                                                <p className="font-mono text-gray-800 font-medium truncate">{item.barcode}</p>
                                                <p className="text-xs text-gray-400">{new Date(item.timestamp).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => removeItem(item.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="p-4 border-t border-gray-100 bg-white">
                         <Button onClick={() => exportToExcel(items, 'Barkod_Listesi')} disabled={items.length === 0} className="w-full text-white" style={{ backgroundColor: '#16a34a' }} icon={<FileSpreadsheet className="w-5 h-5" />}>Excel'e Aktar</Button>
                    </div>
                </div>
            );

        case AppView.SETTINGS:
            return (
                <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: settings.theme.bg }}>
                    <div className="p-4 pt-10 pb-4 bg-white border-b border-gray-200">
                         <h1 className="text-2xl font-bold text-gray-900">Ayarlar</h1>
                    </div>
                    
                    <div className="flex-grow overflow-y-auto p-4 space-y-6">
                        {/* Premium Banner */}
                        <div 
                            onClick={() => !isPremium && setShowProModal(true)}
                            className={`bg-white p-4 rounded-xl shadow-sm border flex items-center justify-between cursor-pointer active:scale-95 transition-all ${isPremium ? 'border-amber-200 bg-amber-50/50' : 'border-gray-100'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${isPremium ? 'bg-amber-100 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                                    {isPremium ? <Check className="w-6 h-6" /> : <Star className="w-6 h-6 fill-current" />}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900">{isPremium ? 'Premium Üye' : 'Pro Sürüm'}</div>
                                    <div className="text-xs text-gray-500">{isPremium ? 'Tüm özellikler aktif' : 'Gelişmiş özellikleri etkinleştir'}</div>
                                </div>
                            </div>
                            {!isPremium && <ChevronRight className="w-5 h-5 text-gray-400" />}
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 mb-2 px-1">Uygulama Ayarları</h3>
                            <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200">
                                <SettingsRow 
                                    icon={settings.isAppLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                                    title="Uygulamayı kilitle"
                                    subtitle={settings.isAppLocked ? "Pin koruması aktif" : "Pin koruması devre dışı"}
                                    isPro={true}
                                    action={<Switch checked={settings.isAppLocked} onChange={handleLockToggle} disabled={!isPremium && !settings.isAppLocked} />}
                                />
                            </div>
                        </div>

                         <div>
                            <h3 className="text-sm font-semibold text-gray-500 mb-2 px-1">Özelleştirme</h3>
                            <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200">
                                <SettingsRow 
                                    icon={<Palette className="w-5 h-5" />}
                                    title="Arka plan rengi"
                                    subtitle="Uygulama zemin rengi"
                                    isPro={true}
                                    action={
                                        <div className="relative overflow-hidden w-8 h-8 rounded-full border-2 border-gray-200 shadow-inner" style={{ backgroundColor: settings.theme.bg }}>
                                            <input type="color" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" value={settings.theme.bg} onChange={(e) => updateTheme('bg', e.target.value)} disabled={!isPremium} />
                                        </div>
                                    }
                                />
                                <SettingsRow 
                                    icon={<PaintBucket className="w-5 h-5" />}
                                    title="Ön plan rengi"
                                    subtitle="Buton ve ikon rengi"
                                    isPro={true}
                                    action={
                                        <div className="relative overflow-hidden w-8 h-8 rounded-full border-2 border-gray-200 shadow-inner" style={{ backgroundColor: settings.theme.primary }}>
                                            <input type="color" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" value={settings.theme.primary} onChange={(e) => updateTheme('primary', e.target.value)} disabled={!isPremium} />
                                        </div>
                                    }
                                />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 mb-2 px-1">Genel</h3>
                            <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200">
                                <SettingsRow 
                                    icon={<Smartphone className="w-5 h-5" />}
                                    title="Toplu Tarama"
                                    subtitle="Seri tarama modu"
                                    isPro={true}
                                    action={<Switch checked={settings.batchScan} onChange={() => toggleSetting('batchScan')} />}
                                />
                                <SettingsRow icon={<Bell className="w-5 h-5" />} title="Titreşim" action={<Switch checked={settings.vibration} onChange={() => toggleSetting('vibration')} />} />
                                <SettingsRow icon={<Volume2 className="w-5 h-5" />} title="Sesli uyarı" action={<Switch checked={settings.sound} onChange={() => toggleSetting('sound')} />} />
                                <SettingsRow icon={<History className="w-5 h-5" />} title="Geçmiş" action={<Switch checked={settings.history} onChange={() => toggleSetting('history')} />} />
                                <SettingsRow icon={<Copy className="w-5 h-5" />} title="Çift tarama" action={<Switch checked={settings.allowDuplicates} onChange={() => toggleSetting('allowDuplicates')} />} />
                            </div>
                        </div>

                         <div className="pb-10 text-center text-xs text-gray-400">Versiyon 1.2.0</div>
                    </div>
                </div>
            );
    }
  };

  return (
    <div className="fixed inset-0 w-full max-w-md mx-auto flex flex-col overflow-hidden shadow-2xl" style={{ backgroundColor: settings.theme.bg }}>
      <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileUpload} />
      
      {showProModal && <ProModal onClose={() => setShowProModal(false)} onUpgrade={handleUpgrade} />}

      <main className={`flex-grow relative overflow-hidden ${view === AppView.SCANNER ? 'p-0' : ''}`}>
        {renderContent()}
      </main>

      <nav className={`flex-none bg-white border-t border-gray-200 safe-area-pb z-30 transition-transform ${view === AppView.SCANNER ? 'translate-y-0 shadow-2xl border-t-0' : ''}`}>
        <div className="grid grid-cols-4 p-2 gap-1">
            {[
                { id: AppView.SCANNER, icon: Scan, label: 'Sayım' },
                { id: AppView.BROWSER, icon: Search, label: 'Ara & Bul' },
                { id: AppView.LIST, icon: List, label: 'Liste', badge: items.length > 0 },
                { id: AppView.SETTINGS, icon: Settings, label: 'Ayarlar' }
            ].map(tab => (
                <button 
                    key={tab.id}
                    onClick={() => setView(tab.id as AppView)}
                    className={`flex flex-col items-center p-2 rounded-xl transition-all relative ${view === tab.id ? 'bg-gray-50' : 'text-gray-400 hover:bg-gray-50'}`}
                    style={view === tab.id ? { color: settings.theme.primary } : undefined}
                >
                    <tab.icon className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-medium">{tab.label}</span>
                    {tab.badge && <span className="absolute top-2 right-4 w-2 h-2 bg-red-500 rounded-full"></span>}
                </button>
            ))}
        </div>
      </nav>
    </div>
  );
};

export default App;