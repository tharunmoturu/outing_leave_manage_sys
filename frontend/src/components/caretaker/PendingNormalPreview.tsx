import React from 'react';
import { Link } from 'react-router-dom';
import { Inbox, ArrowRight, Clock, MapPin, Calendar, FileText } from 'lucide-react';

interface PendingNormalItem {
  id: string;
  studentId: string;
  studentName: string;
  reason: string;
  destination: string;
  leavingDate: string;
  leavingTime: string;
}

interface PendingNormalPreviewProps {
  requests: PendingNormalItem[];
  loading?: boolean;
}

export const PendingNormalPreview: React.FC<PendingNormalPreviewProps> = ({ requests, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm space-y-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-[#D97706]" />
            <h2 className="text-[18px] font-bold text-[#111827]">Pending Normal Requests</h2>
          </div>
          <span className="text-[12px] font-semibold bg-[#FEF3C7] text-[#92400E] px-2.5 py-0.5 rounded-full">
            {requests.length} Latest
          </span>
        </div>

        <div className="divide-y divide-[#F3F4F6] mt-2">
          {requests.length === 0 ? (
            <div className="py-10 text-center text-[#6B7280]">
              <Inbox className="mx-auto h-8 w-8 text-[#9CA3AF] mb-2" />
              <p className="text-[14px] font-medium">No pending normal requests.</p>
            </div>
          ) : (
            requests.map((req) => (
              <div key={req.id} className="py-4 hover:bg-[#F9FAFB] px-2 rounded-lg transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-[#111827] text-[15px]">{req.studentName}</h3>
                    <p className="text-[13px] font-mono text-[#6B7280]">{req.studentId}</p>
                  </div>
                  <span className="text-[12px] font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                    Normal
                  </span>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2 text-[13px] text-[#4B5563]">
                  <div className="flex items-center gap-1.5 truncate">
                    <FileText size={14} className="text-[#9CA3AF] shrink-0" />
                    <span className="truncate">{req.reason}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin size={14} className="text-[#9CA3AF] shrink-0" />
                    <span className="truncate">{req.destination}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-[#9CA3AF] shrink-0" />
                    <span>{req.leavingDate}</span>
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

      <div className="pt-4 mt-2 border-t border-[#E5E7EB]">
        <Link
          to="/caretaker/pending-requests"
          className="text-[14px] font-semibold text-[#800000] hover:text-[#5c0000] flex items-center justify-end gap-1 group"
        >
          View All Pending Requests
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
