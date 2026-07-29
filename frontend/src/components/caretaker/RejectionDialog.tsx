import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Loader2 } from 'lucide-react';

interface RejectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  loading: boolean;
  studentName?: string;
}

export const RejectionDialog: React.FC<RejectionDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  studentName
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setError('');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    onConfirm(reason.trim());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-slideUp">
        <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle size={22} />
            <h2 className="text-[18px] font-bold">Reject Outing Request</h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-[14px] text-gray-600 font-medium">
            Are you sure you want to reject the request for <span className="font-bold text-gray-900">{studentName || 'this student'}</span>?
          </p>

          <div className="space-y-2">
            <label className="text-[13px] font-bold text-gray-700">Reason for Rejection (Optional)</label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Quota exhausted, No parent approval, etc."
              className="w-full border border-gray-300 rounded-lg p-3 text-[14px] focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              rows={3}
              disabled={loading}
            />
            {error && <p className="text-red-600 text-[12px] font-medium mt-1">{error}</p>}
          </div>
        </div>

        <div className="p-5 border-t border-[#E5E7EB] flex justify-end gap-3 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-[14px] font-bold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-5 py-2 text-[14px] font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};
