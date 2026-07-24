import React from 'react';
import { User, GraduationCap, Building, AlertCircle } from 'lucide-react';
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

export const StudentCard: React.FC<Props> = ({ student, onViewProfile }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      <div className="p-5 border-b border-gray-100 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {student.photoUrl ? (
              <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-[16px] leading-tight truncate">{student.name}</h3>
            <p className="text-sm font-medium text-gray-500">{student.studentId}</p>
          </div>
        </div>
        <StudentStatusBadge status={student.dynamicStatus} />
      </div>

      <div className="p-5 space-y-4 flex-grow text-[13px]">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-2 text-gray-600">
            <GraduationCap className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <p className="font-bold text-gray-500 uppercase text-[10px] tracking-wider mb-0.5">Class</p>
              <p className="font-semibold text-gray-900">{student.branch} {student.year}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 text-gray-600">
            <Building className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <p className="font-bold text-gray-500 uppercase text-[10px] tracking-wider mb-0.5">Room</p>
              <p className="font-semibold text-gray-900">{student.hostel} / {student.roomNo}</p>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${student.remaining_outings > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="font-semibold text-gray-700">
              Quota: <span className="text-gray-900">{student.remaining_outings} remaining</span>
            </span>
          </div>
          {student.hasActiveOuting && (
            <div className="flex items-center gap-1 text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded-md">
              <AlertCircle size={14} /> Active Pass
            </div>
          )}
        </div>
      </div>

      <div className="p-3 bg-gray-50 border-t border-gray-100">
        <button
          onClick={() => onViewProfile(student.id)}
          className="w-full py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
        >
          View Full Profile
        </button>
      </div>
    </div>
  );
};
