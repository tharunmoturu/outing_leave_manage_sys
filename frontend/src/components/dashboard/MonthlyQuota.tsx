import React from 'react';

interface MonthlyQuotaProps {
  quota: {
    allowed: number;
    used: number;
    remaining: number;
  };
}

export const MonthlyQuota: React.FC<MonthlyQuotaProps> = ({ quota }) => {
  return (
    <div className="flex-1 w-full space-y-5">
      <div className="flex items-center justify-between text-[14px] font-bold text-[var(--color-text-secondary)] uppercase">
        <span>Allowed: {quota.allowed}</span>
        <span>Used: {quota.used}</span>
      </div>
      <div className="flex gap-3 h-6 w-full">
        {Array.from({ length: quota.allowed }).map((_, idx) => (
          <div 
            key={idx} 
            className={`flex-1 rounded ${idx < quota.used ? 'bg-[var(--color-primary)]' : 'bg-gray-100 border border-gray-200'}`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-[16px]">
        <span className="font-bold text-[var(--color-text-primary)]">
          Remaining Outings: <span className="text-[var(--color-primary)] text-[22px] ml-2">{quota.remaining}</span>
        </span>
        <span className="text-[13px] text-[var(--color-text-muted)] font-semibold uppercase">Current Month</span>
      </div>
    </div>
  );
};
