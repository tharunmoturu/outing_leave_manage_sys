import React, { useState } from 'react';
import { Clock, MapPin, Eye, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import API from '../../services/api';
import { formatTo12Hour } from '../../utils/timeFormat';

export interface PendingNormalRequestItem {
  id: string;
  outing_id: string;
  studentId: string;
  studentName: string;
  reason: string;
  destination: string;
  leavingDate: string;
  leavingTime: string;
  reportingDate: string;
  reportingTime: string;
  remainingOutings: string;
  submittedAt: string;
}

interface RequestCardProps {
  request: PendingNormalRequestItem;
  onViewDetails: (id: string) => void;
  onApproveClick: (req: PendingNormalRequestItem) => void;
  onRejectClick: (req: PendingNormalRequestItem) => void;
}

export const RequestCard: React.FC<RequestCardProps> = ({
  request,
  onViewDetails,
  onApproveClick,
  onRejectClick,
}) => {
  // Format time ago
  const formatTimeAgo = (dateStr: string) => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    const now = new Date();
    const diffInMins = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    const diffInHours = Math.floor(diffInMins / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleApprove = () => {
    onApproveClick(request);
  };

  const handleReject = () => {
    onRejectClick(request);
  };

  return (
    <tr className="hover:bg-[#F9FAFB] transition-colors border-b border-[#E5E7EB] text-[14px]">
      {/* Student Column */}
      <td className="py-3.5 px-4 align-top">
        <div className="font-bold text-[#111827]">{request.studentName}</div>
        <div className="text-[12px] font-mono text-[#6B7280]">{request.studentId}</div>
      </td>

      {/* Quota Column */}
      <td className="py-3.5 px-4 align-top">
        <span className="inline-block bg-[#FEF3C7] text-[#92400E] text-[12px] font-extrabold px-2.5 py-0.5 rounded border border-[#FCD34D]">
          {request.remainingOutings}
        </span>
      </td>

      {/* Reason & Destination Column */}
      <td className="py-3.5 px-4 align-top max-w-xs">
        <div className="font-semibold text-[#111827] truncate">{request.reason}</div>
        <div className="text-[13px] text-[#4B5563] flex items-center gap-1 mt-0.5 truncate">
          <MapPin size={13} className="text-[#9CA3AF] shrink-0" />
          <span className="truncate">{request.destination}</span>
        </div>
      </td>

      {/* Leaving / Reporting Times Column */}
      <td className="py-3.5 px-4 align-top">
        <div className="text-[13px] font-medium text-[#111827]">
          {request.leavingDate}
        </div>
        <div className="text-[12px] text-[#4B5563] flex items-center gap-1 mt-0.5 font-medium">
          <Clock size={12} className="text-[#9CA3AF]" />
          <span>{formatTo12Hour(request.leavingTime)} → {formatTo12Hour(request.reportingTime)}</span>
        </div>
      </td>

      {/* Submitted Column */}
      <td className="py-3.5 px-4 align-top text-[13px] text-[#6B7280] font-medium whitespace-nowrap">
        {formatTimeAgo(request.submittedAt)}
      </td>

      {/* Actions Column */}
      <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-2">
          {/* Approve Button */}
          <button
            onClick={handleApprove}
            className="inline-flex items-center gap-1 bg-[#059669] hover:bg-[#047857] text-white font-bold text-[12px] px-3 py-1.5 rounded-md transition-colors shadow-2xs cursor-pointer"
          >
            <CheckCircle2 size={14} />
            Approve
          </button>

          {/* Reject Button */}
          <button
            onClick={handleReject}
            className="inline-flex items-center gap-1 bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-[12px] px-3 py-1.5 rounded-md transition-colors cursor-pointer"
          >
            <XCircle size={14} />
            Reject
          </button>

          {/* Details Button */}
          <button
            onClick={() => onViewDetails(request.id)}
            className="inline-flex items-center gap-1 bg-white border border-[#D1D5DB] hover:bg-[#F3F4F6] text-[#374151] font-semibold text-[12px] px-2.5 py-1.5 rounded-md transition-colors cursor-pointer"
          >
            <Eye size={13} className="text-[#800000]" />
            Details
          </button>
        </div>
      </td>
    </tr>
  );
};
