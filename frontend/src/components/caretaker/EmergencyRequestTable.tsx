import React from 'react';
import { Eye, CheckCircle2, XCircle } from 'lucide-react';
import { PriorityBadge } from './PriorityBadge';

interface EmergencyRequestItem {
  id: string;
  studentId: string;
  studentName: string;
  studentHostel?: string;
  emergencyCategory: string;
  reason: string;
  destination: string;
  leavingDate: string;
  leavingTime: string;
  reportingDate: string;
  reportingTime: string;
  status: string;
  createdAt: string;
}

interface Props {
  requests: EmergencyRequestItem[];
  onViewDetails: (id: string) => void;
  onApproveClick: (req: EmergencyRequestItem) => void;
  onRejectClick: (req: EmergencyRequestItem) => void;
  currentUserHostel?: string;
  currentUserRole?: string;
}

export const EmergencyRequestTable: React.FC<Props> = ({
  requests,
  onViewDetails,
  onApproveClick,
  onRejectClick,
  currentUserHostel,
  currentUserRole
}) => {
  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <h3 className="text-lg font-bold text-gray-700 mb-2">No pending emergency requests.</h3>
        <p className="text-gray-500 text-sm">You're all caught up!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500 font-bold border-b border-gray-200">
              <th className="px-6 py-4">Student</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Destination</th>
              <th className="px-6 py-4">Leaving</th>
              <th className="px-6 py-4">Priority</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-red-50/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{req.studentName}</div>
                  <div className="text-xs text-gray-500">{req.studentId}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-block px-2.5 py-1 rounded-lg bg-orange-100 text-orange-800 text-xs font-bold border border-orange-200">
                    {req.emergencyCategory}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900 truncate max-w-[150px]" title={req.destination}>
                    {req.destination}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-gray-900">{req.leavingDate}</div>
                  <div className="text-xs text-gray-500">{req.leavingTime}</div>
                </td>
                <td className="px-6 py-4">
                  <PriorityBadge />
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                    req.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    req.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {req.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onViewDetails(req.id)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    {req.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => onApproveClick(req)}
                          disabled={currentUserRole === 'admin' ? false : (currentUserHostel ? req.studentHostel !== currentUserHostel : false)}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-200 disabled:opacity-30 disabled:cursor-not-allowed"
                          title={currentUserRole !== 'admin' && currentUserHostel && req.studentHostel !== currentUserHostel ? `Student belongs to ${req.studentHostel || 'another'} hostel` : "Direct Approve"}
                        >
                          <CheckCircle2 size={18} />
                        </button>
                        <button
                          onClick={() => onRejectClick(req)}
                          disabled={currentUserRole === 'admin' ? false : (currentUserHostel ? req.studentHostel !== currentUserHostel : false)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200 disabled:opacity-30 disabled:cursor-not-allowed"
                          title={currentUserRole !== 'admin' && currentUserHostel && req.studentHostel !== currentUserHostel ? `Student belongs to ${req.studentHostel || 'another'} hostel` : "Reject"}
                        >
                          <XCircle size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
