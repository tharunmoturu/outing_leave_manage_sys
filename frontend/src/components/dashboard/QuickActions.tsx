import React from 'react';
import { useNavigate } from 'react-router-dom';

interface QuickActionsProps {
  activeStatus?: string | null;
  remainingOutings?: number;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ activeStatus, remainingOutings = 0 }) => {
  const navigate = useNavigate();

  const isDisabled = !!activeStatus;
  const isEmergencyDisabled = isDisabled || remainingOutings > 0;

  return (
    <div className="w-full md:w-auto md:border-l border-[var(--color-border-gray)] md:pl-12 flex flex-col items-center justify-center space-y-4">
      <button
        onClick={() => navigate('/student/normal-outing')}
        disabled={isDisabled}
        className="w-full bg-[var(--color-primary)] text-white px-8 py-3 rounded-xl text-[15px] font-bold shadow-md hover:bg-[#6c0f22] hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <span></span> Apply Normal Outing
      </button>
      <button
        onClick={() => navigate('/student/emergency-outing')}
        disabled={isEmergencyDisabled}
        className="w-full bg-red-600 text-white px-8 py-3 rounded-xl text-[15px] font-bold shadow-md hover:bg-red-700 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <span></span> Apply Emergency Outing
      </button>

      {activeStatus && (
        <span className="text-[13px] text-yellow-600 font-bold mt-3 text-center">
          {activeStatus === 'Pending' 
            ? "You have a pending outing request." 
            : "You have an active gate pass."}
        </span>
      )}
    </div>
  );
};
