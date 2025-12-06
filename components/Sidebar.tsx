
import React, { useState, useEffect } from 'react';
import { Key, Mic2, Cpu, Disc, PlayCircle, StopCircle, Gauge, RotateCcw, Sparkles, Fingerprint, ShieldCheck, Laptop, Clock, RefreshCw } from 'lucide-react';
import { AppConfig, LDVoice } from '../types';
import { verifyAndLogLicense, getDeviceId } from '../services/licenseService';

interface SidebarProps {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
  onPreviewVoice: (voice: LDVoice) => void;
  isPreviewing: boolean;
  showNotification: (msg: string, type: 'error' | 'warning' | 'success') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ config, setConfig, onPreviewVoice, isPreviewing, showNotification }) => {
  const [tempKey, setTempKey] = useState(config.licenseKey);
  const [deviceId, setDeviceId] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [expiryDateText, setExpiryDateText] = useState<string>("Vĩnh viễn (Lifetime)");
  const [countdown, setCountdown] = useState<string>("");
  
  // Show input field even if licensed, ONLY IF it's a short-term key (to allow renewal)
  const [showRenewalInput, setShowRenewalInput] = useState(false);

  useEffect(() => {
    setDeviceId(getDeviceId());
  }, []);

  // Update expiration text and countdown
  useEffect(() => {
    if (config.isLicensed) {
      if (config.expiryTimestamp) {
        // It's a short-term key
        const date = new Date(config.expiryTimestamp);
        setExpiryDateText(`18 Ngày (Hết: ${date.getDate()}/${date.getMonth()+1})`);
        
        // Start Countdown Interval
        const interval = setInterval(() => {
          const now = Date.now();
          const distance = (config.expiryTimestamp || 0) - now;

          if (distance < 0) {
            setCountdown("ĐÃ HẾT HẠN");
            clearInterval(interval);
            // Optionally auto-logout here, but App.tsx handles reload check
          } else {
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
          }
        }, 1000);
        return () => clearInterval(interval);

      } else {
        // Lifetime
        setExpiryDateText("Vĩnh viễn (Lifetime)");
        setCountdown("");
      }
    }
  }, [config.isLicensed, config.expiryTimestamp]);

  const handleActivate = async () => {
    if (tempKey.trim().length === 0) {
      showNotification("Vui lòng điền key", 'error');
      return;
    }

    setIsChecking(true);
    
    const result = await verifyAndLogLicense(tempKey);

    setIsChecking(false);

    if (result.isValid) {
      setConfig(prev => ({ 
        ...prev, 
        isLicensed: true, 
        licenseKey: tempKey,
        expiryTimestamp: result.expiryTimestamp || null // Store timestamp
      }));
      setShowRenewalInput(false); // Hide renewal input on success
      showNotification("Kích hoạt thành công! Dữ liệu máy đã được lưu.", 'success');
    } else {
      showNotification(result.message, 'error');
      if (!config.isLicensed) { 
        // Only set to false if we weren't already licensed (prevent de-activating if user just typed wrong key during renewal)
        setConfig(prev => ({ ...prev, isLicensed: false }));
      }
    }
  };

  const updateMastering = (key: keyof AppConfig['mastering'], value: number) => {
    setConfig(prev => ({
      ...prev,
      mastering: { ...prev.mastering, [key]: value }
    }));
  };

  const resetMasteringDefaults = () => {
    setConfig(prev => ({
      ...prev,
      mastering: {
        speed: 1.0,
        delay: 0,
        stability: 0.5,
        similarity: 0.75
      }
    }));
  };

  const handleCloneVoiceClick = () => {
    showNotification("Tính năng LD Voice Cloning (Nhái giọng) đang được phát triển trên Engine V3.\nVui lòng chờ bản cập nhật tiếp theo!", 'warning');
  };

  return (
    <aside className="w-80 bg-ld-sidebar border-r border-ld-border flex flex-col h-full shrink-0 relative z-40">
      
      {/* Header Sidebar */}
      <div className="p-4 border-b border-ld-border flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Hệ thống LD</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-ld-gold">Dark Mode</span>
          <div className="w-8 h-4 bg-ld-gold rounded-full relative cursor-pointer">
            <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-black rounded-full shadow-md"></div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* BOX 1: License Manager */}
        <div className={`p-4 rounded-lg border transition-colors ${config.isLicensed ? 'bg-green-900/10 border-green-800' : 'bg-black/20 border-ld-border/50'}`}>
          <div className={`flex items-center gap-2 mb-3 ${config.isLicensed ? 'text-green-500' : 'text-ld-gold'}`}>
            {config.isLicensed ? <ShieldCheck size={16} /> : <Key size={16} />}
            <h3 className="font-bold text-sm uppercase">QUẢN LÝ LICENSE LD</h3>
          </div>
          
          <div className="space-y-3">
            {!config.isLicensed || showRenewalInput ? (
              <>
                <div>
                  <label className="text-[11px] text-gray-400 mb-1 block">
                    {showRenewalInput ? "Nhập Key mới để gia hạn:" : "Nhập mã kích hoạt (LD-KEY)"}
                  </label>
                  <input 
                    type="text"
                    value={tempKey}
                    onChange={(e) => setTempKey(e.target.value.toUpperCase())}
                    placeholder="LD..."
                    className="w-full bg-[#121212] border border-gray-700 rounded px-2 py-1.5 text-sm text-white focus:border-ld-gold focus:outline-none font-mono tracking-wider"
                  />
                </div>
                
                <div className="flex gap-2">
                   {showRenewalInput && (
                     <button 
                       onClick={() => setShowRenewalInput(false)}
                       className="px-3 py-2 rounded text-xs font-bold bg-gray-700 hover:bg-gray-600 text-white"
                     >
                       Hủy
                     </button>
                   )}
                   <button 
                    onClick={handleActivate}
                    disabled={isChecking}
                    className="flex-1 py-2 rounded text-xs font-bold uppercase tracking-wide transition-all bg-ld-gold text-black hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isChecking ? (
                      <>
                        <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        Checking...
                      </>
                    ) : (showRenewalInput ? 'Gia hạn ngay' : 'Kích hoạt ngay')}
                  </button>
                </div>
                
                {!showRenewalInput && (
                  <p className="text-[10px] text-red-400 mt-1 italic text-center">
                    * Chưa điền key: Vui lòng liên hệ Admin để nhận mã.
                  </p>
                )}
              </>
            ) : (
              <div className="space-y-2">
                <div className="bg-green-900/20 p-2 rounded border border-green-800/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Laptop size={12} className="text-green-400"/>
                    <span className="text-[10px] text-green-400 font-bold uppercase">Device ID (Máy đã đăng ký)</span>
                  </div>
                  <div className="text-[10px] text-gray-300 font-mono truncate" title={deviceId}>
                    {deviceId}
                  </div>
                </div>

                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-400">Trạng thái:</span>
                  <span className="text-green-400 font-bold">Đã kích hoạt</span>
                </div>
                <div className="flex justify-between text-[11px]">
                   <span className="text-gray-400">Hạn dùng:</span>
                   <span className="text-ld-gold font-bold">{expiryDateText}</span>
                </div>

                {/* COUNTDOWN TIMER */}
                {config.expiryTimestamp && (
                  <div className="bg-[#121212] border border-ld-gold/30 p-2 rounded flex flex-col items-center justify-center">
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 uppercase mb-1">
                      <Clock size={10} /> Thời gian còn lại
                    </div>
                    <div className="text-lg font-mono font-bold text-ld-gold tracking-widest">
                      {countdown}
                    </div>
                  </div>
                )}
                
                {/* BUTTON RENEW (Only for short-term keys) */}
                {config.expiryTimestamp ? (
                  <button 
                    onClick={() => {
                       setTempKey("");
                       setShowRenewalInput(true);
                    }}
                    className="w-full py-1.5 mt-2 bg-gray-800 hover:bg-gray-700 text-ld-gold rounded text-[10px] font-bold uppercase border border-gray-600 flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={12} /> Kích hoạt Key mới
                  </button>
                ) : (
                  <button 
                    disabled
                    className="w-full py-1.5 mt-2 bg-gray-800 text-gray-500 rounded text-[10px] font-bold uppercase cursor-not-allowed border border-gray-700"
                  >
                    Key đã gắn chặt với thiết bị này
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* BOX 2: Voice Config */}
        <div className="space-y-4">
           <div className="flex items-center gap-2 text-white border-b border-gray-800 pb-2">
            <Mic2 size={16} />
            <h3 className="font-bold text-sm uppercase">CẤU HÌNH GIỌNG ĐỌC PRO</h3>
          </div>
          
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Chọn Giọng Đọc (LD Library)</label>
            <div className="flex gap-2">
              <select 
                value={config.selectedVoice}
                onChange={(e) => setConfig({...config, selectedVoice: e.target.value as LDVoice})}
                className="flex-1 bg-[#121212] border border-gray-700 rounded px-2 py-2 text-sm text-white focus:border-ld-gold focus:outline-none"
              >
                {Object.values(LDVoice).map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
              <button 
                onClick={() => onPreviewVoice(config.selectedVoice)}
                title={isPreviewing ? "Dừng nghe thử" : "Nghe thử giọng mẫu"}
                className={`px-3 rounded border border-gray-700 flex items-center justify-center transition-colors ${isPreviewing ? 'bg-ld-gold text-black animate-pulse' : 'bg-[#121212] text-ld-gold hover:bg-gray-800 hover:text-white'}`}
              >
                {isPreviewing ? <StopCircle size={18} fill="currentColor" /> : <PlayCircle size={18} />}
              </button>
            </div>
          </div>

          <button 
            onClick={handleCloneVoiceClick}
            className="w-full flex items-center justify-center gap-2 py-2 bg-purple-900/20 border border-purple-500/50 text-purple-300 rounded text-xs font-bold hover:bg-purple-900/40 transition-colors"
          >
            <Fingerprint size={14} />
            CLONE GIỌNG (BETA)
          </button>

          <div>
             <label className="text-xs text-gray-400 mb-1 block">Công nghệ lõi (LD AI Engine)</label>
             <div className="w-full bg-[#121212] border border-gray-700 rounded px-2 py-2 text-sm text-gray-400 flex items-center justify-between">
                <span>LD Neural Engine V2</span>
                <Cpu size={14} className="text-ld-gold"/>
             </div>
             <p className="text-[10px] text-gray-500 mt-1 italic">Sử dụng Engine LD Pro để có chất lượng tốt nhất</p>
          </div>
        </div>

        {/* BOX 3: Audio Mastering */}
        <div className="space-y-4 pt-2">
           <div className="flex items-center justify-between text-white border-b border-gray-800 pb-2">
            <div className="flex items-center gap-2">
              <Disc size={16} />
              <h3 className="font-bold text-sm uppercase">TINH CHỈNH ÂM THANH</h3>
            </div>
            <button 
              onClick={resetMasteringDefaults}
              title="Cấu hình chuẩn (Auto Fix)"
              className="text-ld-gold hover:bg-ld-gold/10 p-1 rounded transition-colors flex items-center gap-1 text-[10px] font-bold border border-ld-gold/30"
            >
              <Sparkles size={10} />
              AUTO FIX
            </button>
          </div>
          
           {/* Speed */}
           <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">Tốc độ (Speed)</span>
              <span className="text-ld-gold">{config.mastering.speed}x</span>
            </div>
            <div className="flex items-center gap-2">
              <Gauge size={14} className="text-gray-500"/>
              <input 
                type="range" 
                min="0.5" max="2.0" step="0.1"
                value={config.mastering.speed}
                onChange={(e) => updateMastering('speed', parseFloat(e.target.value))}
                className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-ld-gold"
              />
            </div>
          </div>

          {/* Delay */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">Độ trễ (Delay)</span>
              <span className="text-ld-gold">{config.mastering.delay}ms</span>
            </div>
            <input 
              type="range" 
              min="0" max="500" step="10"
              value={config.mastering.delay}
              onChange={(e) => updateMastering('delay', parseInt(e.target.value))}
              className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-ld-gold"
            />
          </div>

           {/* Stability */}
           <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">Ổn định giọng (Stability)</span>
              <span className="text-ld-gold">{(config.mastering.stability * 100).toFixed(0)}%</span>
            </div>
            <input 
              type="range" 
              min="0" max="1" step="0.05"
              value={config.mastering.stability}
              onChange={(e) => updateMastering('stability', parseFloat(e.target.value))}
              className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-ld-gold"
            />
          </div>

           {/* Similarity */}
           <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">Độ tương đồng (Similarity)</span>
              <span className="text-ld-gold">{(config.mastering.similarity * 100).toFixed(0)}%</span>
            </div>
            <input 
              type="range" 
              min="0" max="1" step="0.05"
              value={config.mastering.similarity}
              onChange={(e) => updateMastering('similarity', parseFloat(e.target.value))}
              className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-ld-gold"
            />
          </div>
        </div>

      </div>
      
    </aside>
  );
};