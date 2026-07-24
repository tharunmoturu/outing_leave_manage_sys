import React from 'react';

interface Props {
  status: 'Inside Hostel' | 'Outside Hostel' | 'Pending Approval' | 'Emergency Outing' | string;
}

export const StudentStatusBadge: React.FC<Props> = ({ status }) => {
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-800';
  let borderColor = 'border-gray-200';
  let dotColor = 'bg-gray-400';
  let isPulsing = false;

  switch (status) {
    case 'Inside Hostel':
      bgColor = 'bg-green-50';
      textColor = 'text-green-700';
      borderColor = 'border-green-200';
      dotColor = 'bg-green-500';
      break;
    case 'Outside Hostel':
      bgColor = 'bg-orange-50';
      textColor = 'text-orange-700';
      borderColor = 'border-orange-200';
      dotColor = 'bg-orange-500';
      break;
    case 'Pending Approval':
      bgColor = 'bg-blue-50';
      textColor = 'text-blue-700';
      borderColor = 'border-blue-200';
      dotColor = 'bg-blue-500';
      break;
    case 'Emergency Outing':
      bgColor = 'bg-red-50';
      textColor = 'text-red-700';
      borderColor = 'border-red-200';
      dotColor = 'bg-red-600';
      isPulsing = true;
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm border ${bgColor} ${textColor} ${borderColor}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} ${isPulsing ? 'animate-pulse' : ''}`}></span>
      {status}
    </span>
  );
};
