import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, Clock, MapPin, CheckCircle2 } from 'lucide-react';

interface StudentOutsideItem {
  id: string;
  studentId: string;
  studentName: string;
  destination: string;
  leavingTime: string;
  reportingTime: string;
}

interface StudentsOutsidePreviewProps {
  students: StudentOutsideItem[];
  loading?: boolean;
}

export const StudentsOutsidePreview: React.FC<StudentsOutsidePreviewProps> = ({ students, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm space-y-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2">
            <Activity size={20} className="text-[#DC2626]" />
            <h2 className="text-[18px] font-bold text-[#111827]">Students Outside Preview</h2>
          </div>
          <span className="text-[12px] font-semibold bg-[#FEE2E2] text-[#991B1B] px-2.5 py-0.5 rounded-full">
            {students.length} Outside
          </span>
        </div>

        <div className="divide-y divide-[#F3F4F6] mt-2">
          {students.length === 0 ? (
            <div className="py-10 text-center text-[#6B7280]">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
              <p className="text-[14px] font-medium text-[#374151]">All students are currently inside.</p>
            </div>
          ) : (
            students.map((stu) => (
              <div key={stu.id} className="py-4 hover:bg-[#F9FAFB] px-2 rounded-lg transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-[#111827] text-[15px]">{stu.studentName}</h3>
                    <p className="text-[13px] font-mono text-[#6B7280]">{stu.studentId}</p>
                  </div>
                  <span className="text-[12px] font-semibold bg-amber-50 text-amber-700 px-2 py-0.5 rounded">
                    Outside
                  </span>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2 text-[13px] text-[#4B5563]">
                  <div className="flex items-center gap-1.5 truncate col-span-2">
                    <MapPin size={14} className="text-[#9CA3AF] shrink-0" />
                    <span className="truncate">{stu.destination}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-[#9CA3AF] shrink-0" />
                    <span>Left: {stu.leavingTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-[#9CA3AF] shrink-0" />
                    <span>Due: {stu.reportingTime}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="pt-4 mt-2 border-t border-[#E5E7EB]">
        <Link
          to="/caretaker/students-outside"
          className="text-[14px] font-semibold text-[#800000] hover:text-[#5c0000] flex items-center justify-end gap-1 group"
        >
          View All
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
