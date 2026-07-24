import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, Clock, MapPin, FileText, ShieldAlert } from 'lucide-react';

interface EmergencyItem {
  id: string;
  studentId: string;
  studentName: string;
  reason: string;
  destination: string;
  leavingTime: string;
}

interface EmergencyPreviewProps {
  requests: EmergencyItem[];
  loading?: boolean;
}

export const EmergencyPreview: React.FC<EmergencyPreviewProps> = ({ requests, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-6 shadow-sm space-y-4 animate-pulse">
        <div className="h-6 bg-red-100 rounded w-1/3"></div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 bg-red-50 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-red-200 p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
      {/* Top red accent border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#DC2626]"></div>

      <div>
        <div className="flex items-center justify-between pb-4 border-b border-red-100">
          <div className="flex items-center gap-2">
            <ShieldAlert size={20} className="text-[#DC2626]" />
            <h2 className="text-[18px] font-bold text-[#111827]">Emergency Requests</h2>
          </div>
          <span className="text-[12px] font-bold bg-[#FEE2E2] text-[#991B1B] px-2.5 py-0.5 rounded-full border border-red-200">
            Urgent ({requests.length})
          </span>
        </div>

        <div className="divide-y divide-red-50 mt-2">
          {requests.length === 0 ? (
            <div className="py-10 text-center text-[#6B7280]">
              <AlertCircle className="mx-auto h-8 w-8 text-green-500 mb-2" />
              <p className="text-[14px] font-medium">No pending emergency requests.</p>
            </div>
          ) : (
            requests.map((req) => (
              <div key={req.id} className="py-4 hover:bg-red-50/50 px-2 rounded-lg transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-[#111827] text-[15px]">{req.studentName}</h3>
                    <p className="text-[13px] font-mono text-[#6B7280]">{req.studentId}</p>
                  </div>
                  <span className="text-[12px] font-bold bg-[#DC2626] text-white px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">
                    Emergency
                  </span>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2 text-[13px] text-[#4B5563]">
                  <div className="flex items-center gap-1.5 truncate col-span-2">
                    <FileText size={14} className="text-red-500 shrink-0" />
                    <span className="font-semibold text-red-900 truncate">{req.reason}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin size={14} className="text-[#9CA3AF] shrink-0" />
                    <span className="truncate">{req.destination}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-[#9CA3AF] shrink-0" />
                    <span>{req.leavingTime}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="pt-4 mt-2 border-t border-red-100">
        <Link
          to="/caretaker/emergency-requests"
          className="text-[14px] font-bold text-[#DC2626] hover:text-[#991B1B] flex items-center justify-end gap-1 group"
        >
          View All Emergency Requests
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
