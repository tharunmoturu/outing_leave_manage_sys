import React from 'react';
import { Eye, MapPin, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface HistoryTableProps {
  history: any[];
  isLoading: boolean;
  onViewDetails: (outing: any) => void;
  isCaretaker?: boolean;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({
  history,
  isLoading,
  onViewDetails,
  isCaretaker = false
}) => {

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
        <AlertTriangle className="mx-auto h-12 w-12 text-gray-300 mb-3" />
        <h3 className="text-[18px] font-bold text-gray-900">No History Found</h3>
        <p className="text-[14px] text-gray-500 mt-1">
          No outing history matches your current filters for the last 30 days.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-5 py-4 text-[11px] font-black text-gray-500 uppercase tracking-wider">Date & Time</th>
              {isCaretaker && (
                <th className="px-5 py-4 text-[11px] font-black text-gray-500 uppercase tracking-wider">Student</th>
              )}
              {isCaretaker && (
                <th className="px-5 py-4 text-[11px] font-black text-gray-500 uppercase tracking-wider">Approved By</th>
              )}
              <th className="px-5 py-4 text-[11px] font-black text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-5 py-4 text-[11px] font-black text-gray-500 uppercase tracking-wider min-w-[200px]">Destination & Reason</th>
              <th className="px-5 py-4 text-[11px] font-black text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-5 py-4 text-[11px] font-black text-gray-500 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {history.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar size={14} className="text-gray-400" />
                    <span className="text-[13px] font-semibold text-gray-900">{record.leavingDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-400" />
                    <span className="text-[12px] font-medium text-gray-500">{record.leavingTime} - {record.reportingTime}</span>
                  </div>
                </td>
                
                {isCaretaker && (
                  <td className="px-5 py-4">
                    <p className="text-[14px] font-bold text-gray-900">{record.studentName}</p>
                    <p className="text-[12px] text-gray-500 font-medium">{record.studentId}</p>
                  </td>
                )}

                {isCaretaker && (
                  <td className="px-5 py-4">
                    {record.approvedBy && record.approvedBy !== 'N/A' && (
                      <>
                        <p className="text-[13px] font-bold text-gray-900">{record.approvedBy}</p>
                        {record.approvedAt && record.approvedAt !== 'N/A' && (
                          <p className="text-[11px] text-gray-500 font-medium">
                            {new Date(record.approvedAt).toLocaleString()}
                          </p>
                        )}
                      </>
                    )}
                  </td>
                )}

                <td className="px-5 py-4">
                  <span className={`text-[12px] font-bold px-2 py-1 rounded ${
                    record.outingType === 'Emergency' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {record.outingType}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-blue-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[13px] font-bold text-gray-900">{record.destination}</p>
                      <p className="text-[12px] text-gray-500 line-clamp-1">{record.reason}</p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <StatusBadge status={record.status} />
                </td>

                <td className="px-5 py-4 text-right">
                  <button
                    onClick={() => onViewDetails(record)}
                    className="inline-flex items-center justify-center gap-1 bg-white border border-gray-200 text-gray-700 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 font-bold text-[12px] px-3 py-1.5 rounded transition-colors"
                  >
                    <Eye size={14} />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
