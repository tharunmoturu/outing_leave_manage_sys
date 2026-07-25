import React, { useState, useEffect } from 'react';
import { Eye, MapPin } from 'lucide-react';
import { formatTo12Hour } from '../../utils/timeFormat';

export interface StudentsOutsideItem {
  id: string;
  outingId: string;
  studentId: string;
  studentName: string;
  branch: string;
  year: string;
  hostel: string;
  roomNo: string;
  reason: string;
  destination: string;
  leavingDate: string;
  leavingTime: string; // "12:00 PM"
  reportingDate: string;
  reportingTime: string; // "07:00 PM"
  approvedBy: string;
  approvedAt: string;
  status: string;
}

interface StudentsOutsideCardProps {
  student: StudentsOutsideItem;
  onViewDetails: (outingId: string) => void;
}

export const StudentsOutsideCard: React.FC<StudentsOutsideCardProps> = ({ student, onViewDetails }) => {
  const [progress, setProgress] = useState(0);
  const [remainingTimeStr, setRemainingTimeStr] = useState('Calculating...');
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    const calculateProgress = () => {
      try {
        const now = new Date();

        // Parse leaving date/time
        const leavingDate = new Date(student.leavingDate);
        const lTime = student.leavingTime.trim().split(/\s+/);
        let lHours = 0, lMins = 0;
        if (lTime[0]) {
          const lParts = lTime[0].split(':');
          lHours = parseInt(lParts[0] || '0', 10);
          lMins = parseInt(lParts[1] || '0', 10);
          if (lTime[1]?.toUpperCase() === 'PM' && lHours < 12) lHours += 12;
          if (lTime[1]?.toUpperCase() === 'AM' && lHours === 12) lHours = 0;
        }
        leavingDate.setHours(lHours, lMins, 0, 0);

        // Parse reporting date/time
        const reportingDate = new Date(student.reportingDate);
        const rTime = student.reportingTime.trim().split(/\s+/);
        let rHours = 0, rMins = 0;
        if (rTime[0]) {
          const rParts = rTime[0].split(':');
          rHours = parseInt(rParts[0] || '0', 10);
          rMins = parseInt(rParts[1] || '0', 10);
          if (rTime[1]?.toUpperCase() === 'PM' && rHours < 12) rHours += 12;
          if (rTime[1]?.toUpperCase() === 'AM' && rHours === 12) rHours = 0;
        }
        reportingDate.setHours(rHours, rMins, 0, 0);

        // Handle overnight (though usually same day)
        if (reportingDate < leavingDate) {
          reportingDate.setDate(reportingDate.getDate() + 1);
        }

        const totalDuration = reportingDate.getTime() - leavingDate.getTime();
        const elapsed = now.getTime() - leavingDate.getTime();
        const remaining = reportingDate.getTime() - now.getTime();

        if (remaining <= 0) {
          setProgress(100);
          setRemainingTimeStr('Overdue');
          setIsOverdue(true);
        } else {
          setIsOverdue(false);
          let p = (elapsed / totalDuration) * 100;
          if (p < 0) p = 0;
          if (p > 100) p = 100;
          setProgress(p);

          const rHoursLeft = Math.floor(remaining / (1000 * 60 * 60));
          const rMinsLeft = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
          setRemainingTimeStr(`${rHoursLeft}h ${rMinsLeft}m remaining`);
        }
      } catch (e) {
        console.error('Time calculation error', e);
      }
    };

    calculateProgress();
    const interval = setInterval(calculateProgress, 60000);
    return () => clearInterval(interval);
  }, [student]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col md:flex-row md:items-center">
      
      {/* ── Left: Student Info ── */}
      <div className="p-4 md:w-1/4 flex flex-col border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50/50 min-h-full justify-center">
        <h3 className="text-[16px] font-bold text-gray-900 leading-tight">
          {student.studentName}
        </h3>
        <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide mt-1">
          {student.studentId} • {student.branch} {student.year}
        </p>
        <div className="text-[12px] text-gray-500 font-medium mt-1">
          Room: {student.hostel} {student.roomNo}
        </div>
      </div>

      {/* ── Middle: Destination & Time Progress ── */}
      <div className="p-4 md:flex-1 flex flex-col justify-center">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-start gap-2 max-w-[50%]">
            <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin size={12} className="text-blue-600" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-gray-900 truncate">{student.destination}</p>
              <p className="text-[12px] text-gray-600 font-medium truncate">{student.reason}</p>
            </div>
          </div>
          
          <div className="text-right">
            <span className={`px-2 py-0.5 rounded font-black text-[10px] uppercase tracking-wider inline-block mb-1
              ${isOverdue ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}
            `}>
              {isOverdue ? 'OVERDUE' : 'OUTSIDE'}
            </span>
            <div className={`text-[12px] font-bold ${isOverdue ? 'text-red-600' : 'text-blue-600'}`}>
              {remainingTimeStr}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full">
          <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            <span>{formatTo12Hour(student.leavingTime)}</span>
            <span>{formatTo12Hour(student.reportingTime)}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 relative overflow-hidden">
            <div 
              className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${isOverdue ? 'bg-red-500' : 'bg-blue-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Right: Actions ── */}
      <div className="p-4 md:w-48 border-t md:border-t-0 md:border-l border-gray-100 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3">
        <div className="text-[11px] font-medium text-gray-500 text-left md:text-right">
          <span className="block text-gray-400 uppercase font-bold tracking-wider mb-0.5">Approved By</span>
          <span className="text-gray-700 font-bold">{student.approvedBy}</span>
        </div>
        <button
          onClick={() => onViewDetails(student.id)}
          className="flex items-center justify-center gap-1.5 bg-white border border-gray-200 text-blue-600 hover:text-blue-800 hover:bg-blue-50 font-bold text-[12px] px-3 py-1.5 rounded transition-colors w-full max-w-[120px]"
        >
          <Eye size={14} />
          Details
        </button>
      </div>

    </div>
  );
};
