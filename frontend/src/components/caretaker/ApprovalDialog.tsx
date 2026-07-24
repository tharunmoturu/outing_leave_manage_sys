import React from 'react';
import { X, CheckCircle, Loader2 } from 'lucide-react';
import { formatTo12Hour } from '../../utils/timeFormat';

interface ApprovalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  request: {
    studentName: string;
    destination: string;
    leavingDate: string;
    leavingTime: string;
    reportingDate: string;
    reportingTime: string;
  } | null;
}

export const ApprovalDialog: React.FC<ApprovalDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  request
}) => {
  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-slideUp">
        <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle size={22} />
            <h2 className="text-[18px] font-bold">Approve Outing Request?</h2>
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
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-3 text-[14px]">
            <div className="grid grid-cols-3 gap-2">
              <span className="text-gray-500 font-bold uppercase text-xs">Student</span>
              <span className="col-span-2 font-bold text-gray-900">{request.studentName}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-gray-500 font-bold uppercase text-xs">Destination</span>
              <span className="col-span-2 font-medium text-gray-900">{request.destination}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-gray-500 font-bold uppercase text-xs">Leaving</span>
              <span className="col-span-2 font-medium text-gray-900">
                {request.leavingDate} <br /> <span className="font-bold">{formatTo12Hour(request.leavingTime)}</span>
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-gray-500 font-bold uppercase text-xs">Reporting</span>
              <span className="col-span-2 font-medium text-gray-900">
                {request.reportingDate} <br /> <span className="font-bold">{formatTo12Hour(request.reportingTime)}</span>
              </span>
            </div>
          </div>
          <p className="text-[13px] text-gray-600">
            This action will generate a gate pass and notify the student.
          </p>
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
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2 text-[14px] font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            Approve
          </button>
        </div>
      </div>
    </div>
  );
};
