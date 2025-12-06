
import React from 'react';
import { X } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[400px] bg-[#1e1e1e] border border-ld-border rounded-lg shadow-2xl p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-ld-gold rounded-full mx-auto flex items-center justify-center text-black font-bold text-2xl shadow-lg">
            LD
          </div>
          
          <div>
            <h2 className="text-xl font-bold text-white">TEXT TO VOICE PRO LD</h2>
            <p className="text-ld-gold text-sm font-mono mt-1">Version 1.0.0 (LD Release)</p>
          </div>

          <div className="bg-black/30 p-4 rounded text-sm text-gray-300 space-y-2 text-left">
            <p><span className="text-gray-500 w-20 inline-block">Owner:</span> LD</p>
            <p><span className="text-gray-500 w-20 inline-block">Gmail:</span> lydev2003@gmail.com</p>
            <p><span className="text-gray-500 w-20 inline-block">Support:</span> 0377537562</p>
            <p><span className="text-gray-500 w-20 inline-block">License:</span> Commercial Pro</p>
          </div>

          <p className="text-xs text-gray-500 pt-4 border-t border-gray-800">
            © 2024 Developed by LD. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
