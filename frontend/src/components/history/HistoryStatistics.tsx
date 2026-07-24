import React from 'react';
import { FileText, CheckCircle, XCircle, CheckSquare } from 'lucide-react';

interface HistoryStatisticsProps {
  statistics: {
    totalRequests: number;
    approved: number;
    rejected: number;
    completed: number;
  };
  isLoading?: boolean;
}

export const HistoryStatistics: React.FC<HistoryStatisticsProps> = ({ statistics, isLoading = false }) => {
  const stats = [
    { label: 'Total Requests', value: statistics.totalRequests, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Approved', value: statistics.approved, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Rejected', value: statistics.rejected, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Completed', value: statistics.completed, icon: CheckSquare, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div key={idx} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center flex-shrink-0`}>
              <Icon size={24} className={stat.color} />
            </div>
            <div>
              <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">{stat.label}</p>
              {isLoading ? (
                <div className="h-8 w-16 bg-gray-200 rounded mt-1 animate-pulse" />
              ) : (
                <h3 className="text-[24px] font-black text-gray-900 leading-none mt-1">{stat.value}</h3>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
