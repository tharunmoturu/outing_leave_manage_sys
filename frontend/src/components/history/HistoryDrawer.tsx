import React, { useEffect, useState } from 'react';
import { X, MapPin, Calendar, User } from 'lucide-react';
import { TimelineComponent } from './TimelineComponent';

interface HistoryDrawerProps {
  outing: any;
  isOpen: boolean;
  onClose: () => void;
  isCaretaker?: boolean;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  outing,
  isOpen,
  onClose,
  isCaretaker = false
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(onClose, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div 
        className={`absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out transform ${isAnimating ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-[20px] font-black text-gray-900">Outing History</h2>
            <p className="text-[13px] text-gray-500 font-medium">Detailed read-only record</p>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        {outing && (
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            
            {/* Student Info (If Caretaker) */}
            {isCaretaker && (
              <div>
                <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-wider mb-4">Student Profile</h3>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <User size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-[16px] font-bold text-gray-900">{outing.studentName}</h4>
                      <p className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mt-0.5">
                        {outing.studentId} • {outing.branch} {outing.year}
                      </p>
                      <p className="text-[13px] text-gray-600 font-medium mt-1">
                        Hostel {outing.hostel}, Room {outing.roomNo}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Request Info */}
            <div>
              <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-wider mb-4">Request Details</h3>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Destination</p>
                    <p className="text-[15px] font-bold text-gray-900">{outing.destination}</p>
                    <p className="text-[13px] text-gray-600 font-medium mt-0.5">{outing.reason}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-3 border-t border-gray-200">
                  <Calendar size={18} className="text-purple-500 mt-0.5" />
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Leaving</p>
                      <p className="text-[13px] font-bold text-gray-900">{outing.leavingDate}</p>
                      <p className="text-[13px] font-bold text-gray-500">{outing.leavingTime}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Reporting</p>
                      <p className="text-[13px] font-bold text-gray-900">{outing.reportingDate}</p>
                      <p className="text-[13px] font-bold text-gray-500">{outing.reportingTime}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-wider mb-4">Timeline</h3>
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <TimelineComponent outing={outing} />
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
