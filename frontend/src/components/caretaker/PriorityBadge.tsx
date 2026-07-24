import React from 'react';

export const PriorityBadge: React.FC = () => {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-700 uppercase tracking-wider shadow-sm border border-red-200">
      <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
      HIGH
    </span>
  );
};
