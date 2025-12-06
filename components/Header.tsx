
import React from 'react';
import { Settings, Maximize2, Minus, X } from 'lucide-react';

interface HeaderProps {
  onOpenAbout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAbout }) => {
  return (
    <header className="h-12 bg-black border-b border-ld-border flex items-center justify-between px-4 select-none shrink-0 z-50">
      {/* Left: Branding */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ld-gold to-yellow-700 flex items-center justify-center font-bold text-black text-xs shadow-[0_0_10px_rgba(255,215,0,0.5)]">
          LD
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-lg font-bold text-ld-gold leading-none tracking-wider">
            TEXT TO VOICE PRO LD
          </h1>
          <span className="text-[10px] text-gray-500 font-mono tracking-tight mt-0.5">
             © Developed by LD - All Rights Reserved
          </span>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-4">
        {/* Zalo Link */}
        <a 
          href="https://zalo.me/0377537562" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-[#0068FF]/10 px-3 py-1 rounded-full border border-[#0068FF]/30 hover:bg-[#0068FF]/20 transition-all group"
        >
            {/* Zalo Logo Simulation */}
            <div className="w-5 h-5 bg-[#0068FF] rounded flex items-center justify-center shadow-lg">
              <span className="text-[8px] font-black text-white">Zalo</span>
            </div>
            <span className="text-xs text-[#0068FF] font-bold group-hover:text-blue-400">Tham gia nhóm AI để biết thêm về AI nha mấy chế</span>
        </a>

        <div className="h-4 w-px bg-gray-700 mx-1"></div>

        <button className="text-xs text-ld-accentBlue hover:underline hover:text-blue-400 transition-colors">
          Hướng dẫn sử dụng LD
        </button>
        
        <div className="h-4 w-px bg-gray-700 mx-1"></div>

        <button onClick={onOpenAbout} className="text-gray-400 hover:text-white transition-colors" title="Settings / About">
          <Settings size={18} />
        </button>

        <div className="flex items-center gap-2 ml-2">
          <button className="p-1 hover:bg-gray-800 rounded transition-colors text-gray-400">
            <Minus size={16} />
          </button>
          <button className="p-1 hover:bg-gray-800 rounded transition-colors text-gray-400">
            <Maximize2 size={16} />
          </button>
          <button className="p-1 hover:bg-red-900/50 hover:text-red-500 rounded transition-colors text-gray-400">
            <X size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};