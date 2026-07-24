import React from 'react';
import { User, MapPin, FileText, RefreshCw } from 'lucide-react';

interface StudentInfoCardProps {
  student: any;
  loading: boolean;
  onRefresh: () => void;
}

export const StudentInfoCard: React.FC<StudentInfoCardProps> = ({ student, loading, onRefresh }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border-gray)] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-gray-200 border-4 border-white shadow flex items-center justify-center overflow-hidden shrink-0 text-[var(--color-primary)]">
           {student?.photo ? (
              <img src={student.photo} alt="Profile" className="w-full h-full object-cover" />
           ) : (
              <User size={40} />
           )}
        </div>
        <div>
          <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
            {student?.name || 'Loading...'}
          </h1>
          {student && (
            <div className="text-[14px] text-[var(--color-text-secondary)] mt-3 flex flex-wrap gap-5 font-medium">
              <span className="flex items-center gap-1.5"><User size={16}/> ID: {student.studentId}</span>
              <span className="flex items-center gap-1.5"><FileText size={16}/> Class: {student.branch} {student.year}</span>
              <span className="flex items-center gap-1.5"><MapPin size={16}/> Room: {student.room} ({student.hostel})</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col items-start md:items-end gap-3">
        <div className="text-[14px] font-bold text-[var(--color-text-primary)] bg-gray-100 px-4 py-2 rounded-lg">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        <button onClick={onRefresh} className="text-[13px] font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1.5">
           <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Details
        </button>
      </div>
    </div>
  );
};
