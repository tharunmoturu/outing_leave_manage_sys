import React from 'react';
import { User, Phone, GraduationCap, Building } from 'lucide-react';

interface StudentInfoCardProps {
  studentData: any;
  loadingStudent: boolean;
}

export const StudentInfoCard: React.FC<StudentInfoCardProps> = ({ studentData, loadingStudent }) => {
  if (loadingStudent) {
    return (
      <div className="bg-white rounded-[16px] border border-[#E5E7EB] p-6 shadow-sm animate-pulse">
        <div className="h-6 w-48 bg-gray-200 rounded mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i}>
              <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
              <div className="h-5 w-32 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!studentData) return null;

  return (
    <div className="bg-white rounded-[16px] border border-[#E5E7EB] p-6 shadow-sm relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full blur-2xl opacity-70"></div>
      
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <User className="text-blue-600" size={20} />
        </div>
        <div>
          <h2 className="text-[18px] font-black text-[#111827]">Student Information</h2>
          <p className="text-[13px] text-[#6B7280] font-medium">Verify your details before submitting</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 relative z-10">
        <div>
          <label className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider block mb-1">Full Name</label>
          <div className="flex items-center gap-2 text-[#111827] font-bold text-[15px]">
            <User size={16} className="text-[#6B7280]" />
            {studentData.name}
          </div>
        </div>
        <div>
          <label className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider block mb-1">Student ID</label>
          <div className="flex items-center gap-2 text-[#111827] font-bold text-[15px]">
            <GraduationCap size={16} className="text-[#6B7280]" />
            {studentData.studentId}
          </div>
        </div>
        <div>
          <label className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider block mb-1">Branch & Year</label>
          <div className="flex items-center gap-2 text-[#111827] font-bold text-[15px]">
            <GraduationCap size={16} className="text-[#6B7280]" />
            {studentData.branch} - {studentData.year}
          </div>
        </div>
        <div>
          <label className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider block mb-1">Hostel Details</label>
          <div className="flex items-center gap-2 text-[#111827] font-bold text-[15px]">
            <Building size={16} className="text-[#6B7280]" />
            Block {studentData.hostel}, Room {studentData.room}
          </div>
        </div>
        <div>
          <label className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider block mb-1">Phone Number</label>
          <div className="flex items-center gap-2 text-[#111827] font-bold text-[15px]">
            <Phone size={16} className="text-[#6B7280]" />
            {studentData.phone}
          </div>
        </div>
        <div>
          <label className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider block mb-1">Parent Phone</label>
          <div className="flex items-center gap-2 text-[#111827] font-bold text-[15px]">
            <Phone size={16} className="text-[#6B7280]" />
            {studentData.parentPhone}
          </div>
        </div>
      </div>
    </div>
  );
};
