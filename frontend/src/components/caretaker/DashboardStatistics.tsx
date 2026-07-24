import React from 'react';

interface DashboardStatisticsProps {
  statistics: {
    studentsOutside: number;
    pendingNormal: number;
    pendingEmergency: number;
    approvedToday: number;
  } | null;
  loading?: boolean;
}

export const DashboardStatistics: React.FC<DashboardStatisticsProps> = ({ statistics, loading }) => {
  const cards = [
    {
      label: 'Students Outside',
      value: statistics?.studentsOutside ?? 0,
      color: 'text-[#DC2626]', // Red/Danger
      badgeBg: 'bg-[#FEE2E2] text-[#991B1B]'
    },
    {
      label: 'Pending Normal Requests',
      value: statistics?.pendingNormal ?? 0,
      color: 'text-[#D97706]', // Warning Amber
      badgeBg: 'bg-[#FEF3C7] text-[#92400E]'
    },
    {
      label: 'Pending Emergency Requests',
      value: statistics?.pendingEmergency ?? 0,
      color: 'text-[#B91C1C]', // Dark Red
      badgeBg: 'bg-[#FEE2E2] text-[#991B1B]'
    },
    {
      label: "Today's Approved",
      value: statistics?.approvedToday ?? 0,
      color: 'text-[#059669]', // Success Green
      badgeBg: 'bg-[#D1FAE5] text-[#065F46]'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mt-2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <span className="text-[12px] font-bold uppercase tracking-wider text-[#6B7280]">
            {card.label}
          </span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className={`text-[36px] font-extrabold tracking-tight ${card.color}`}>
              {card.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
