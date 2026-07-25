import React from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface AlertDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  type?: 'error' | 'success' | 'info';
  onClose: () => void;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({ 
  isOpen, 
  title, 
  message, 
  type = 'error', 
  onClose 
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'error': return <AlertCircle className="w-6 h-6 text-red-600" />;
      case 'success': return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'info': return <Info className="w-6 h-6 text-blue-600" />;
    }
  };

  const getHeaderColor = () => {
    switch (type) {
      case 'error': return 'bg-red-50 border-red-100';
      case 'success': return 'bg-green-50 border-green-100';
      case 'info': return 'bg-blue-50 border-blue-100';
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'error': return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
      case 'success': return 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
      case 'info': return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
    }
  };

  const defaultTitle = type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Information';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all duration-300 scale-100 opacity-100 animate-in fade-in zoom-in-95"
      >
        <div className={`p-4 border-b flex items-center gap-3 ${getHeaderColor()}`}>
          {getIcon()}
          <h3 className="text-lg font-bold text-gray-800 flex-1">
            {title || defaultTitle}
          </h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-md hover:bg-black/5 text-gray-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-600 text-[15px] leading-relaxed">
            {message}
          </p>
        </div>
        
        <div className="p-4 bg-gray-50 flex justify-end border-t border-gray-100">
          <button
            onClick={onClose}
            className={`px-5 py-2 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${getButtonColor()}`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
