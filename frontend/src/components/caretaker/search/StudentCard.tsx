import React from 'react';
import { GraduationCap, Building2, ChevronRight } from 'lucide-react';
import { StudentStatusBadge } from './StudentStatusBadge';

export interface StudentSearchResult {
  id: string;
  studentId: string;
  name: string;
  email: string;
  branch: string;
  year: string;
  hostel: string;
  roomNo: string;
  remaining_outings: number;
  dynamicStatus: string;
  hasActiveOuting: boolean;
  lastOutingDate: string | null;
  photoUrl: string | null;
}

interface Props {
  student: StudentSearchResult;
  onViewProfile: (studentId: string) => void;
}

const getInitials = (name: string): string => {
  if (!name || typeof name !== 'string') return 'U';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

export const StudentCard: React.FC<Props> = ({ student, onViewProfile }) => {
  const initials = getInitials(student.name || student.studentId || 'User');
  const hasClassInfo = (student.branch && student.branch !== 'N/A') || (student.year && student.year !== 'N/A');
  const hasRoomInfo = (student.hostel && student.hostel !== 'N/A') || (student.roomNo && student.roomNo !== 'N/A');

  return (
    <div
      onClick={() => onViewProfile(student.id)}
      className="bg-white border border-gray-200 rounded-xl p-4 transition-all duration-200 hover:border-gray-300 hover:shadow-md cursor-pointer flex flex-col justify-between h-full group"
    >
      <div>
        {/* Top Header: Avatar, Name, ID, and Badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 text-slate-700 font-bold text-sm">
              {student.photoUrl ? (
                <img src={student.photoUrl} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 text-sm truncate leading-snug group-hover:text-[var(--color-primary)] transition-colors">
                {student.name || 'Unnamed Student'}
              </h3>
              <p className="text-xs text-gray-500 font-mono mt-0.5 truncate">{student.studentId}</p>
            </div>
          </div>
          <div className="flex-shrink-0">
            <StudentStatusBadge status={student.dynamicStatus} />
          </div>
        </div>

        {/* Middle Info: Class & Room */}
        <div className="py-2.5 px-3 bg-slate-50 rounded-lg space-y-1.5 mb-3">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <GraduationCap className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">
              {hasClassInfo ? `${student.branch || ''} ${student.year ? `• ${student.year}` : ''}`.trim() : 'Class not specified'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Building2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">
              {hasRoomInfo ? `${student.hostel || ''} ${student.roomNo ? `Room ${student.roomNo}` : ''}`.trim() : 'Room not assigned'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Footer: Outing Quota & Action Link */}
      <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${student.remaining_outings > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
          <span className="text-gray-600 font-medium">
            <strong className="text-gray-900 font-semibold">{student.remaining_outings}</strong> outings left
          </span>
        </div>

        <span className="text-[var(--color-primary)] font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
          View Profile <ChevronRight className="w-4 h-4" />
        </span>
      </div>
    </div>
  );
};
