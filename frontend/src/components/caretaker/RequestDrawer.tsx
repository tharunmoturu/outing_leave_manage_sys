import React, { useEffect, useState } from 'react';
import { X, User, History, FileText, Loader2 } from 'lucide-react';
import API from '../../services/api';

interface RequestDrawerProps {
  outingId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onApproveClick?: (req: any) => void;
  onRejectClick?: (req: any) => void;
  currentUserHostel?: string;
  currentUserRole?: string;
}

export const RequestDrawer: React.FC<RequestDrawerProps> = ({ outingId, isOpen, onClose, onApproveClick, onRejectClick, currentUserHostel, currentUserRole }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<{
    currentRequest: {
      id: string;
      outing_id: string;
      reason: string;
      destination: string;
      leavingDate: string;
      leavingTime: string;
      reportingDate: string;
      reportingTime: string;
      submittedTime: string;
    };
    student: {
      name: string;
      studentId: string;
      branch: string;
      year: string;
      hostel: string;
      roomNo: string;
      phone: string;
      parentPhone: string;
    };
    previousOutings: Array<{
      id: string;
      outing_id: string;
      date: string;
      destination: string;
      outingType: string;
      status: string;
    }>;
  } | null>(null);

  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen && outingId) {
      setLoading(true);
      setError('');
      API.get(`/caretaker/pending-normal/${outingId}`)
        .then((res) => {
          setData(res.data);
        })
        .catch((err) => {
          console.error('Failed to load outing details:', err);
          setError(err.response?.data?.message || 'Failed to load details');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setData(null);
    }
  }, [isOpen, outingId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs transition-opacity flex justify-end">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between animate-slideLeft">
        {/* Drawer Header */}
        <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between bg-[#FAFAFA]">
          <div>
            <h2 className="text-[20px] font-bold text-[#111827]">Student Request Details</h2>
            <p className="text-[13px] text-[#6B7280]">Read-only comprehensive review panel</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full text-[#6B7280] transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-[#6B7280] space-y-3">
              <Loader2 size={32} className="animate-spin text-[#800000]" />
              <p className="text-[14px] font-medium">Fetching request details...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-[14px]">
              {error}
            </div>
          ) : data ? (
            <>
              {/* Section 1: Student Information */}
              <div className="bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] p-5 space-y-3">
                <h3 className="text-[14px] font-bold uppercase tracking-wider text-[#374151] flex items-center gap-2 border-b border-[#E5E7EB] pb-2">
                  <User size={16} className="text-[#800000]" />
                  Student Information
                </h3>
                <div className="grid grid-cols-2 gap-3 text-[13px]">
                  <div>
                    <span className="text-[#6B7280] block text-[12px]">Student Name</span>
                    <span className="font-bold text-[#111827]">{data.student.name}</span>
                  </div>
                  <div>
                    <span className="text-[#6B7280] block text-[12px]">Student ID</span>
                    <span className="font-mono font-bold text-[#111827]">{data.student.studentId}</span>
                  </div>
                  <div>
                    <span className="text-[#6B7280] block text-[12px]">Branch & Year</span>
                    <span className="font-medium text-[#111827]">{data.student.branch} - {data.student.year}</span>
                  </div>
                  <div>
                    <span className="text-[#6B7280] block text-[12px]">Hostel & Room</span>
                    <span className="font-medium text-[#111827]">{data.student.hostel} / {data.student.roomNo}</span>
                  </div>
                  <div>
                    <span className="text-[#6B7280] block text-[12px]">Student Phone</span>
                    <span className="font-medium text-[#111827]">{data.student.phone}</span>
                  </div>
                  <div>
                    <span className="text-[#6B7280] block text-[12px]">Parent Phone</span>
                    <span className="font-medium text-[#111827]">{data.student.parentPhone}</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Current Request Details */}
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 space-y-3">
                <h3 className="text-[14px] font-bold uppercase tracking-wider text-[#374151] flex items-center gap-2 border-b border-[#E5E7EB] pb-2">
                  <FileText size={16} className="text-[#800000]" />
                  Current Request Details
                </h3>
                <div className="space-y-3 text-[13px]">
                  <div>
                    <span className="text-[#6B7280] block text-[12px]">Reason for Outing</span>
                    <span className="font-medium text-[#111827]">{data.currentRequest.reason}</span>
                  </div>
                  <div>
                    <span className="text-[#6B7280] block text-[12px]">Destination</span>
                    <span className="font-medium text-[#111827]">{data.currentRequest.destination}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#F3F4F6]">
                    <div>
                      <span className="text-[#6B7280] block text-[12px]">Leaving Date & Time</span>
                      <span className="font-semibold text-[#111827]">{data.currentRequest.leavingDate} at {data.currentRequest.leavingTime}</span>
                    </div>
                    <div>
                      <span className="text-[#6B7280] block text-[12px]">Reporting Date & Time</span>
                      <span className="font-semibold text-[#111827]">{data.currentRequest.reportingDate} at {data.currentRequest.reportingTime}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[#F3F4F6]">
                    <span className="text-[#6B7280] block text-[12px]">Submitted At</span>
                    <span className="text-[#4B5563]">
                      {new Date(data.currentRequest.submittedTime).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 3: Previous Outing History */}
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 space-y-3">
                <h3 className="text-[14px] font-bold uppercase tracking-wider text-[#374151] flex items-center gap-2 border-b border-[#E5E7EB] pb-2">
                  <History size={16} className="text-[#800000]" />
                  Previous Outings (Last 5)
                </h3>

                {data.previousOutings.length === 0 ? (
                  <p className="text-[13px] text-[#6B7280] py-2">No previous outing records found for this student.</p>
                ) : (
                  <div className="divide-y divide-[#F3F4F6]">
                    {data.previousOutings.map((po) => (
                      <div key={po.id} className="py-2.5 flex justify-between items-center text-[13px]">
                        <div>
                          <p className="font-medium text-[#111827]">{po.destination}</p>
                          <p className="text-[12px] text-[#6B7280]">{po.date} ({po.outingType})</p>
                        </div>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          po.status === 'Approved' || po.status === 'Returned' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : po.status === 'Rejected' 
                            ? 'bg-red-50 text-red-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {po.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-[#E5E7EB] bg-[#FAFAFA] flex justify-between">
          <button
            onClick={onClose}
            className="bg-white border border-[#D1D5DB] hover:bg-[#F3F4F6] text-[#374151] font-bold text-[14px] px-5 py-2 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
          {data && onApproveClick && onRejectClick ? (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (onRejectClick) {
                    onRejectClick({
                      id: data.currentRequest.id,
                      studentName: data.student.name,
                      destination: data.currentRequest.destination,
                      leavingDate: data.currentRequest.leavingDate,
                      leavingTime: data.currentRequest.leavingTime,
                      reportingDate: data.currentRequest.reportingDate,
                      reportingTime: data.currentRequest.reportingTime
                    });
                  }
                }}
                disabled={currentUserRole === 'admin' ? false : (currentUserHostel ? data.student.hostel !== currentUserHostel : false)}
                title={currentUserRole !== 'admin' && currentUserHostel && data.student.hostel !== currentUserHostel ? `Student belongs to ${data.student.hostel || 'another'} hostel` : "Reject"}
                className="bg-white border border-red-200 hover:bg-red-50 text-red-700 font-bold text-[14px] px-5 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  if (onApproveClick) {
                    onApproveClick({
                      id: data.currentRequest.id,
                      studentName: data.student.name,
                      destination: data.currentRequest.destination,
                      leavingDate: data.currentRequest.leavingDate,
                      leavingTime: data.currentRequest.leavingTime,
                      reportingDate: data.currentRequest.reportingDate,
                      reportingTime: data.currentRequest.reportingTime
                    });
                  }
                }}
                disabled={currentUserRole === 'admin' ? false : (currentUserHostel ? data.student.hostel !== currentUserHostel : false)}
                title={currentUserRole !== 'admin' && currentUserHostel && data.student.hostel !== currentUserHostel ? `Student belongs to ${data.student.hostel || 'another'} hostel` : "Approve"}
                className="bg-green-600 hover:bg-green-700 text-white font-bold text-[14px] px-5 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Approve
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
