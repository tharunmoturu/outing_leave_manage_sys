import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  const isDanger = confirmVariant === 'danger';
  const confirmButtonClass = isDanger 
    ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500' 
    : 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500';
  
  const iconClass = isDanger ? 'text-red-600 bg-red-100' : 'text-indigo-600 bg-indigo-100';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all duration-300 scale-100 opacity-100 animate-in fade-in zoom-in-95"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full flex-shrink-0 ${iconClass}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1 mt-1 text-left">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-gray-900 leading-none">
                  {title}
                </h3>
                <button 
                  onClick={onCancel}
                  className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 p-1 rounded-md transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-100">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-white text-gray-700 text-sm font-medium border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${confirmButtonClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
