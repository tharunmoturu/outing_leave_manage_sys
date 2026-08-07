import React from 'react';
import { useNavigate } from 'react-router-dom';

interface RecentOutingsTableProps {
  outings: any[];
}

export const RecentOutingsTable: React.FC<RecentOutingsTableProps> = ({ outings }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border-gray)] p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[16px] font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
          Recent Outings
        </h3>
        <button 
          onClick={() => navigate('/student/history')}
          className="text-[13px] font-bold text-[var(--color-primary)] hover:underline uppercase tracking-wide"
        >
          View All
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[var(--color-border-gray)]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50">
            <tr className="border-b border-[var(--color-border-gray)] text-[12px] uppercase text-[var(--color-text-muted)] tracking-wider">
              <th className="py-4 px-5 font-bold">Date</th>
              <th className="py-4 px-5 font-bold">Type</th>
              <th className="py-4 px-5 font-bold">Reason</th>
              <th className="py-4 px-5 font-bold">Destination</th>
              <th className="py-4 px-5 font-bold">Status</th>
              <th className="py-4 px-5 font-bold">Approved/Rejected By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-gray)] bg-white">
            {outings && outings.length > 0 ? (
              outings.map((outing: any) => (
                <tr key={outing.id} className="text-[14px] text-[var(--color-text-primary)] hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-5 font-bold">{new Date(outing.date).toLocaleDateString()}</td>
                  <td className="py-4 px-5 font-bold">
                     <span className={`px-2 py-1 rounded text-[11px] uppercase ${outing.outingType === 'Emergency' ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                       {outing.outingType || 'Normal'}
                     </span>
                  </td>
                  <td className="py-4 px-5 text-[var(--color-text-secondary)] font-medium max-w-[200px] truncate">
                    {outing.reason}
                  </td>
                  <td className="py-4 px-5 text-[var(--color-text-secondary)] font-medium max-w-[150px] truncate">{outing.destination}</td>
                  <td className="py-4 px-5">
                    <span className={`px-3 py-1 rounded text-[12px] font-bold tracking-wide uppercase ${
                      outing.status === 'Returned' || outing.status === 'Approved' || outing.status === 'Exited' ? 'bg-green-50 text-green-700' :
                      outing.status === 'Cancelled' || outing.status === 'Rejected' ? 'bg-red-50 text-red-700' :
                      outing.status === 'Pending' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {outing.status === 'Returned' || outing.status === 'Exited' ? 'Approved' : outing.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-[var(--color-text-muted)] font-medium">
                    {outing.status === 'Rejected' ? (outing.rejectedBy || '-') : (outing.approvedBy || '-')}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[var(--color-text-muted)] text-[14px] font-semibold">
                  No outing history found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
