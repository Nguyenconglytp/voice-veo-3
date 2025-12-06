
import React from 'react';

export const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0a0a] flex flex-col items-center justify-center">
      <div className="w-32 h-32 rounded-full border-4 border-ld-gold flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(255,215,0,0.3)] animate-pulse">
        <span className="text-5xl font-bold text-ld-gold">LD</span>
      </div>
      
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-bold text-white tracking-widest">TEXT TO VOICE PRO</h1>
        <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-ld-gold rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-2 h-2 bg-ld-gold rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-2 h-2 bg-ld-gold rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
        </div>
        <p className="text-sm text-gray-500 uppercase tracking-wide">Đang khởi động Text to Voice Pro LD...</p>
      </div>

      <div className="absolute bottom-8 text-xs text-gray-600 font-mono">
        Copyright © 2024 LD. Nghiêm cấm sao chép.
      </div>
    </div>
  );
};