
import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { SplashScreen } from './components/SplashScreen';
import { AboutModal } from './components/AboutModal';
import { NotificationPopup } from './components/NotificationPopup'; // Import Popup
import { AppConfig, QueueItem, TabType, LDVoice } from './types';
import { generateSpeechLD, createWavBlob } from './services/geminiService';
import { checkLocalLicense } from './services/licenseService'; 
import { Play, Square, FileAudio, Plus, Trash2, Edit2, Volume2, FileText, File, Captions, Download, CheckSquare, PlayCircle, StopCircle, UploadCloud, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  // Splash Screen State
  const [loading, setLoading] = useState(true);
  
  // Notification Popup State
  const [notification, setNotification] = useState<{ isOpen: boolean; message: string; type: 'error' | 'warning' | 'success' }>({
    isOpen: false,
    message: '',
    type: 'error'
  });

  // App Logic State
  const [config, setConfig] = useState<AppConfig>({
    licenseKey: '', 
    isLicensed: false, 
    selectedVoice: LDVoice.MAI_TUAN_TAI_1,
    mastering: {
      delay: 150,
      stability: 0.5,
      similarity: 0.75,
      speed: 1.0
    },
    expiryTimestamp: null
  });

  const [activeTab, setActiveTab] = useState<TabType>('edit');
  const [inputText, setInputText] = useState('');
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [playbackState, setPlaybackState] = useState<{ type: 'idle' | 'preview' | 'row', id?: string }>({ type: 'idle' });
  const [showAbout, setShowAbout] = useState(false);
  const [statusMessage, setStatusMessage] = useState('LD Engine Ready');
  const [processingIndex, setProcessingIndex] = useState<number | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const shouldProcessRef = useRef(true);

  useEffect(() => {
    const localLicense = checkLocalLicense();
    if (localLicense.isLicensed) {
      setConfig(prev => ({
        ...prev,
        isLicensed: true,
        licenseKey: localLicense.key,
        expiryTimestamp: localLicense.expiryTimestamp
      }));
    } else {
      setConfig(prev => ({
        ...prev,
        isLicensed: false,
        licenseKey: '',
        expiryTimestamp: null
      }));
    }

    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Helper to show popup
  const showPopup = (message: string, type: 'error' | 'warning' | 'success' = 'error') => {
    setNotification({ isOpen: true, message, type });
  };

  const closePopup = () => {
    setNotification(prev => ({ ...prev, isOpen: false }));
  };

  const checkLicenseOrAlert = () => {
    if (!config.isLicensed) {
      showPopup("Vui lòng điền key", 'error'); // Hiển thị popup thay vì alert
      return false;
    }
    return true;
  };

  useEffect(() => {
    const processNextItem = async () => {
      if (isProcessing) return; 
      if (!shouldProcessRef.current) return; 
      if (!config.isLicensed) return; 

      const index = queue.findIndex(item => item.status === 'pending');
      if (index === -1) {
        if (statusMessage.includes('Đang xử lý')) {
          setStatusMessage('Hoàn tất hàng đợi. LD Engine Ready.');
        }
        return; 
      }

      const item = queue[index];
      setIsProcessing(true);
      setProcessingIndex(index);
      setStatusMessage(`Đang xử lý: Item #${index + 1} (${item.voiceName})...`);

      setQueue(prev => {
        const newQ = [...prev];
        newQ[index] = { ...newQ[index], status: 'processing' };
        return newQ;
      });

      try {
        const speedToUse = item.speed || config.mastering.speed;
        
        const result = await generateSpeechLD(item.text, item.voiceName, speedToUse);

        if (!shouldProcessRef.current) {
             setQueue(prev => {
              const newQ = [...prev];
              newQ[index] = { ...newQ[index], status: 'pending' };
              return newQ;
            });
            setIsProcessing(false);
            setProcessingIndex(null);
            setStatusMessage('Đã dừng phát (User Stopped).');
            return;
        }

        if (result.error) {
           console.error(`Error processing item ${index}:`, result.error);
            setQueue(prev => {
              const newQ = [...prev];
              newQ[index] = { ...newQ[index], status: 'error' };
              return newQ;
            });
        } else if (result.audioBuffer && result.rawAudio) {
            setQueue(prev => {
              const newQ = [...prev];
              newQ[index] = { 
                ...newQ[index], 
                status: 'done', 
                audioData: result.audioBuffer!,
                rawAudio: result.rawAudio 
              };
              return newQ;
            });
        }
      } catch (error) {
         console.error("Critical Engine Error:", error);
         setQueue(prev => {
            const newQ = [...prev];
            newQ[index] = { ...newQ[index], status: 'error' };
            return newQ;
          });
      } finally {
        setIsProcessing(false);
        setProcessingIndex(null);
      }
    };

    processNextItem();
  }, [queue, isProcessing, config.isLicensed, config.licenseKey, config.mastering.speed]);


  const addToQueue = () => {
    if (!inputText.trim()) return;
    if (!checkLicenseOrAlert()) return;
    
    shouldProcessRef.current = true;
    
    const newItem: QueueItem = {
      id: Date.now().toString(),
      text: inputText,
      voiceName: config.selectedVoice,
      status: 'pending',
      selected: false,
      speed: config.mastering.speed
    };
    
    setQueue(prev => [...prev, newItem]);
    setInputText('');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!checkLicenseOrAlert()) return;

    const file = event.target.files?.[0];
    if (!file) return;

    shouldProcessRef.current = true;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;
      
      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
      
      const newItems: QueueItem[] = lines.map((line) => ({
        id: Date.now().toString() + Math.random().toString().substr(2, 5),
        text: line.trim(),
        voiceName: config.selectedVoice,
        status: 'pending',
        selected: false,
        speed: config.mastering.speed
      }));

      shouldProcessRef.current = true;
      setQueue(prev => [...prev, ...newItems]);
      setStatusMessage(`Đã nạp ${newItems.length} đoạn hội thoại từ file.`);
    };
    
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerFileUpload = () => {
    if (!checkLicenseOrAlert()) return;
    fileInputRef.current?.click();
  };

  const removeItem = (id: string) => {
    if (playbackState.type === 'row' && playbackState.id === id) {
      stopAllAudio();
    }
    setQueue(prev => prev.filter(item => item.id !== id));
  };

  const stopAllAudio = () => {
    if (activeSourceRef.current) {
      try { activeSourceRef.current.stop(); } catch(e) {}
      activeSourceRef.current = null;
    }
    setPlaybackState({ type: 'idle' });
    setStatusMessage('LD Engine Ready');
  };

  const handleManualStart = () => {
    if (!checkLicenseOrAlert()) return;
    shouldProcessRef.current = true;
    if (!isProcessing) {
       setQueue(prev => [...prev]); 
    }
  };

  const handleStop = () => {
    stopAllAudio();
    shouldProcessRef.current = false;
    setStatusMessage('Đã dừng tự động xử lý.');
  };

  const playAudioBuffer = async (buffer: AudioBuffer, speed: number = 1.0) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000
      });
    }

    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    if (activeSourceRef.current) {
      try { activeSourceRef.current.stop(); } catch(e){}
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = speed;
    source.connect(ctx.destination);
    
    activeSourceRef.current = source;
    
    return new Promise<void>((resolve) => {
      source.onended = () => {
        activeSourceRef.current = null;
        resolve();
      };
      source.start();
    });
  };

  const handleDownload = (item: QueueItem) => {
    if (!checkLicenseOrAlert()) return;
    
    if (!item.rawAudio) {
      showPopup("Chưa có dữ liệu âm thanh để tải xuống.", 'warning');
      return;
    }

    const safeName = item.text.slice(0, 10).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `[LD_PRO]_${safeName}.wav`;

    const blob = createWavBlob(item.rawAudio);
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadSelected = () => {
    if (!checkLicenseOrAlert()) return;

    const selectedItems = queue.filter(item => item.selected && item.status === 'done' && item.rawAudio);
    if (selectedItems.length === 0) {
      showPopup("Chưa chọn file nào đã hoàn thành để tải xuống.", 'warning');
      return;
    }
    selectedItems.forEach((item, index) => {
      setTimeout(() => {
        handleDownload(item);
      }, index * 500); 
    });
  };

  const handlePreviewVoice = async (voice: LDVoice) => {
    if (playbackState.type === 'preview') {
      stopAllAudio();
      return;
    }
    
    if (!checkLicenseOrAlert()) return;

    setPlaybackState({ type: 'preview' });
    setStatusMessage(`Đang tạo mẫu giọng: ${voice}...`);
    
    const previewText = "Phần Mềm Được Tạo Bởi LD nếu bạn thấy hữu dụng hãy vào nhóm zalo ủng hộ admin nha .";
    
    const result = await generateSpeechLD(previewText, voice, config.mastering.speed);
    
    if (result.audioBuffer) {
      setStatusMessage(`Đang phát mẫu giọng: ${voice}...`);
      await playAudioBuffer(result.audioBuffer, config.mastering.speed);
      if (activeSourceRef.current === null) {
          setPlaybackState({ type: 'idle' });
          setStatusMessage('LD Engine Ready');
      }
    } else if (result.error) {
      showPopup("Lỗi Preview: " + result.error, 'error');
      setPlaybackState({ type: 'idle' });
      setStatusMessage('Lỗi tạo mẫu giọng.');
    }
  };

  const toggleRowPlayback = async (item: QueueItem) => {
    if (playbackState.type === 'row' && playbackState.id === item.id) {
      stopAllAudio();
      return;
    }
    if (!item.audioData) return;
    stopAllAudio();
    setPlaybackState({ type: 'row', id: item.id });
    setStatusMessage(`Đang phát: ${item.voiceName}...`);
    const playbackSpeed = item.speed || 1.0;
    await playAudioBuffer(item.audioData, playbackSpeed);
    setPlaybackState({ type: 'idle' });
    setStatusMessage('LD Engine Ready');
  };

  const toggleSelectAll = () => {
    const allSelected = queue.length > 0 && queue.every(i => i.selected);
    setQueue(prev => prev.map(item => ({...item, selected: !allSelected})));
  };

  const toggleSelect = (index: number) => {
    setQueue(prev => {
      const newQ = [...prev];
      newQ[index] = { ...newQ[index], selected: !newQ[index].selected };
      return newQ;
    });
  };

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-ld-bg text-white font-sans overflow-hidden">
      <NotificationPopup 
        isOpen={notification.isOpen} 
        message={notification.message} 
        type={notification.type} 
        onClose={closePopup} 
      />

      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
      <Header onOpenAbout={() => setShowAbout(true)} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          config={config} 
          setConfig={setConfig} 
          onPreviewVoice={handlePreviewVoice}
          isPreviewing={playbackState.type === 'preview'}
          showNotification={showPopup} // Pass popup handler to Sidebar
        />

        <main className="flex-1 flex flex-col bg-[#121212] relative">
          
          {/* Tabs */}
          <div className="flex items-center h-10 bg-[#1e1e1e] border-b border-ld-border">
            {[
              { id: 'edit', label: 'Soạn thảo văn bản', icon: FileText },
              { id: 'file', label: 'Nạp File (.txt / .docx)', icon: File },
              { id: 'subtitle', label: 'Xử lý phụ đề (.srt)', icon: Captions },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-6 h-full text-xs font-medium transition-colors border-r border-ld-border ${
                  activeTab === tab.id 
                  ? 'bg-[#121212] text-ld-gold border-t-2 border-t-ld-gold' 
                  : 'text-gray-400 hover:bg-[#252525] hover:text-gray-200'
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* DYNAMIC EDITOR AREA */}
          <div className="p-4 border-b border-ld-border bg-[#181818] relative min-h-[160px]">
            {/* Watermark */}
            <div className="ld-watermark">LD PRO</div>

            {activeTab === 'edit' && (
              <>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full h-32 bg-transparent border-none resize-none focus:outline-none text-gray-200 text-sm placeholder-gray-600 relative z-10 font-mono leading-relaxed"
                  placeholder="Nhập nội dung cần chuyển đổi vào đây..."
                />
                <div className="flex justify-end mt-2 relative z-20">
                  <button 
                    onClick={addToQueue}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded border border-gray-600 transition-all hover:border-gray-400"
                  >
                    <Plus size={14} />
                    Thêm vào danh sách xử lý (Auto Run)
                  </button>
                </div>
              </>
            )}

            {activeTab === 'file' && (
              <div className="relative z-10 h-32 flex flex-col items-center justify-center">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".txt,.csv" 
                  className="hidden"
                />
                <button 
                  onClick={triggerFileUpload}
                  className="w-full h-full border-2 border-dashed border-gray-700 hover:border-ld-gold rounded-lg flex flex-col items-center justify-center gap-3 bg-black/20 hover:bg-black/40 transition-all group"
                >
                  <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center group-hover:bg-ld-gold/20 transition-colors">
                    <UploadCloud size={24} className="text-gray-400 group-hover:text-ld-gold" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-300 group-hover:text-white">Click để tải file lên (.txt, .csv, .xlsx)</p>
                    <p className="text-xs text-gray-500 mt-1">Hỗ trợ tốt nhất: File .txt hoặc .csv (Excel Save As)</p>
                  </div>
                </button>
                
                <div className="absolute bottom-[-10px] left-0 right-0 flex justify-center pointer-events-none">
                   <div className="bg-[#1e1e1e] border border-ld-gold/30 px-3 py-1 rounded-full flex items-center gap-2 shadow-lg">
                      <AlertCircle size={12} className="text-ld-gold" />
                      <span className="text-[10px] text-ld-gold font-bold uppercase tracking-wide">
                        Lưu ý: Mỗi lần xuống dòng sẽ tự động thành 1 đoạn voice
                      </span>
                   </div>
                </div>
              </div>
            )}
             
            {activeTab === 'subtitle' && (
               <div className="relative z-10 h-32 flex items-center justify-center text-gray-500">
                  <p className="text-sm italic">Tính năng xử lý phụ đề .SRT đang cập nhật...</p>
               </div>
            )}
          </div>

          <div className="h-10 bg-[#181818] border-b border-ld-border flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
               <button 
                  onClick={handleDownloadSelected}
                  className="flex items-center gap-2 px-3 py-1 bg-ld-accentGreen/20 hover:bg-ld-accentGreen/30 text-green-400 text-xs rounded border border-green-800 transition-colors"
                >
                  <Download size={14} />
                  Tải Về Các File Đã Chọn
               </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-[#121212]">
             <table className="w-full text-left border-collapse">
                <thead className="bg-[#1e1e1e] text-xs font-bold text-gray-400 uppercase sticky top-0 z-30">
                  <tr>
                    <th className="p-3 border-b border-ld-border w-16 text-center">
                      <input 
                        type="checkbox" 
                        checked={queue.length > 0 && queue.every(i => i.selected)}
                        onChange={toggleSelectAll}
                        className="rounded bg-gray-700 border-gray-600 accent-ld-gold cursor-pointer"
                      />
                    </th>
                    <th className="p-3 border-b border-ld-border w-16 text-center">STT</th>
                    <th className="p-3 border-b border-ld-border w-48">Giọng đọc</th>
                    <th className="p-3 border-b border-ld-border">Nội dung (Preview)</th>
                    <th className="p-3 border-b border-ld-border w-32 text-center">Trạng thái</th>
                    <th className="p-3 border-b border-ld-border w-40 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-[#2a2a2a]">
                  {queue.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-600 italic">
                        Chưa có dữ liệu. Vui lòng thêm văn bản hoặc nạp file.
                      </td>
                    </tr>
                  ) : (
                    queue.map((item, index) => (
                      <tr key={item.id} className="hover:bg-[#1a1a1a] transition-colors group">
                        <td className="p-3 text-center">
                           <input 
                            type="checkbox" 
                            checked={!!item.selected}
                            onChange={() => toggleSelect(index)}
                            className="rounded bg-gray-700 border-gray-600 accent-ld-gold cursor-pointer"
                          />
                        </td>
                        <td className="p-3 text-center text-gray-500 font-mono">{index + 1}</td>
                        <td className="p-3 text-ld-gold font-medium truncate max-w-[12rem]">{item.voiceName}</td>
                        <td className="p-3 text-gray-300 truncate max-w-md">{item.text}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            item.status === 'done' ? 'bg-green-900/20 text-green-500 border-green-800' :
                            item.status === 'processing' ? 'bg-blue-900/20 text-blue-400 border-blue-800 animate-pulse' :
                            item.status === 'error' ? 'bg-red-900/20 text-red-500 border-red-800' :
                            'bg-gray-800 text-gray-400 border-gray-700'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-3 opacity-50 group-hover:opacity-100 transition-opacity">
                            {item.status === 'done' && (
                              <>
                                <button 
                                  onClick={() => toggleRowPlayback(item)} 
                                  className={`${playbackState.type === 'row' && playbackState.id === item.id ? 'text-ld-gold' : 'text-ld-accentBlue'} hover:text-white transition-colors`} 
                                  title={playbackState.type === 'row' && playbackState.id === item.id ? "Dừng phát" : "Nghe ngay"}
                                >
                                  {playbackState.type === 'row' && playbackState.id === item.id ? (
                                    <StopCircle size={16} fill="currentColor"/>
                                  ) : (
                                    <PlayCircle size={16} />
                                  )}
                                </button>
                                <button 
                                  onClick={() => handleDownload(item)} 
                                  className="text-ld-gold hover:text-white transition-colors" 
                                  title="Tải xuống WAV"
                                >
                                  <Download size={16} />
                                </button>
                              </>
                            )}
                            <button className="text-gray-400 hover:text-blue-400"><Edit2 size={16} /></button>
                            <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
             </table>
          </div>

          <div className="h-8 bg-[#1e1e1e] border-t border-ld-border flex items-center justify-between px-4 text-xs text-gray-400">
            <div className="flex items-center gap-4">
               <button className="hover:text-white flex items-center gap-1"><Edit2 size={12}/> Sửa</button>
               <button className="hover:text-white flex items-center gap-1"><Trash2 size={12}/> Xóa</button>
               <button className="hover:text-white flex items-center gap-1"><Volume2 size={12}/> Đổi giọng</button>
            </div>
            <div className="flex items-center gap-2 text-green-500">
               <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
               {statusMessage}
            </div>
          </div>
        </main>
      </div>

      <footer className="h-16 bg-[#181818] border-t border-ld-border px-6 flex items-center justify-between shrink-0">
        <div className="text-gray-400 text-xs">
          Tổng số ký tự: <span className="text-white font-mono">{inputText.length + queue.reduce((acc, i) => acc + i.text.length, 0)}</span> / <span className="text-ld-gold">Unlimited (Bản Pro)</span>
        </div>

        <div className="flex items-center gap-4">
           <button 
              onClick={handleManualStart}
              disabled={isProcessing && shouldProcessRef.current}
              className={`h-10 px-6 ${isProcessing && shouldProcessRef.current ? 'bg-gray-700' : 'bg-ld-accentBlue hover:bg-blue-600'} text-white font-bold uppercase rounded shadow-lg transition-all flex items-center gap-2`}
            >
              <Play size={18} fill="currentColor" />
              Bắt đầu chuyển đổi
           </button>

           <button 
              onClick={handleStop}
              className="h-10 px-6 bg-ld-accentRed hover:bg-red-600 text-white font-bold uppercase rounded shadow-lg transition-all flex items-center gap-2"
            >
              <Square size={18} fill="currentColor" />
              Dừng lại
           </button>

           <button className="h-10 px-6 bg-ld-accentGreen hover:bg-green-600 text-white font-bold uppercase rounded shadow-lg transition-all flex items-center gap-2">
              <FileAudio size={18} />
              Ghép File Audio (LD Merge)
           </button>
        </div>
      </footer>
    </div>
  );
};

export default App;
