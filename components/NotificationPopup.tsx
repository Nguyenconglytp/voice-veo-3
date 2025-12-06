
import React from 'react';
import { AlertTriangle, XCircle, CheckCircle, X } from 'lucide-react';

interface NotificationPopupProps {
  isOpen: boolean;
  message: string;
  type: 'error' | 'success' | 'warning';
  onClose: () => void;
}

export const NotificationPopup: React.FC<NotificationPopupProps> = ({ isOpen, message, type, onClose }) => {
  if (!isOpen) return null;

  let borderColor = 'border-red-600';
  let icon = <XCircle size={48} className="text-red-500" />;
  let title = 'THÔNG BÁO';
  let btnColor = 'bg-red-600 hover:bg-red-700';

  if (type === 'success') {
    borderColor = 'border-green-500';
    icon = <CheckCircle size={48} className="text-green-500" />;
    title = 'THÀNH CÔNG';
    btnColor = 'bg-green-600 hover:bg-green-700';
  } else if (type === 'warning') {
    borderColor = 'border-ld-gold';
    icon = <AlertTriangle size={48} className="text-ld-gold" />;
    title = 'CẢNH BÁO';
    btnColor = 'bg-ld-gold hover:bg-yellow-500 text-black';
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className={`w-full max-w-md bg-[#1e1e1e] border-2 ${borderColor} rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] p-6 relative transform scale-100 animate-in zoom-in-95 duration-200`}>
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-3 bg-black/50 rounded-full border border-gray-800 shadow-inner">
            {icon}
          </div>
          
          <h2 className={`text-2xl font-bold uppercase tracking-wider ${type === 'warning' ? 'text-ld-gold' : type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
            {title}
          </h2>
          
          <p className="text-lg text-white font-medium leading-relaxed">
            {message}
          </p>

          <button
            onClick={onClose}
            className={`mt-4 px-8 py-3 rounded-lg font-bold uppercase tracking-widest shadow-lg transition-all transform hover:scale-105 active:scale-95 ${btnColor} w-full`}
          >
            ĐÃ HIỂU
          </button>
        </div>
      </div>
    </div>
  );
};