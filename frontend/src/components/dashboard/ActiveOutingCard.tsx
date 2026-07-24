import React from 'react';

interface ActiveOutingCardProps {
  activeOuting: any;
  studentName: string;
  studentId: string;
  branch: string;
  year: string;
  hostel: string;
  room: string;
}

export const ActiveOutingCard: React.FC<ActiveOutingCardProps> = ({ 
  activeOuting, studentName, studentId, branch, year, hostel, room 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border-gray)] p-6">
      <h3 className="text-[16px] font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-5">
        Current Outing Status
      </h3>
      
      {activeOuting ? (
         activeOuting.status === 'Approved' || activeOuting.status === 'Exited' ? (
           <div className="bg-white border-2 border-[var(--color-primary)] rounded-xl overflow-hidden shadow-md max-w-2xl mx-auto">
             <div className="bg-[var(--color-primary)] text-white p-4 text-center">
               <h2 className="text-xl font-bold uppercase tracking-widest">Official Outing Pass</h2>
               <p className="text-sm opacity-90">University Gate Pass Authorization</p>
             </div>
             <div className="p-6 space-y-6">
               <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                 <div>
                   <h3 className="text-2xl font-bold text-gray-900">{studentName}</h3>
                   <p className="text-gray-500 font-medium">{studentId} • {branch} {year}</p>
                   <p className="text-gray-500 font-medium">Room: {hostel} / {room}</p>
                 </div>
                 <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-bold uppercase text-sm border border-green-200 shadow-sm flex flex-col items-center">
                   <span>{activeOuting.status}</span>
                   {activeOuting.outingType === 'Emergency' && <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 mt-1 rounded">EMERGENCY</span>}
                 </div>
               </div>
               
               <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                 <div>
                   <span className="block text-gray-400 font-bold uppercase text-xs tracking-wider mb-1">Reason</span>
                   <span className="block text-gray-900 font-medium">{activeOuting.purpose}</span>
                 </div>
                 <div>
                   <span className="block text-gray-400 font-bold uppercase text-xs tracking-wider mb-1">Destination</span>
                   <span className="block text-gray-900 font-medium">{activeOuting.destination}</span>
                 </div>
                 <div>
                   <span className="block text-gray-400 font-bold uppercase text-xs tracking-wider mb-1">Leaving Time</span>
                   <span className="block text-gray-900 font-medium">{activeOuting.leavingTime || '-'}</span>
                 </div>
                 <div>
                   <span className="block text-gray-400 font-bold uppercase text-xs tracking-wider mb-1">Reporting Time</span>
                   <span className="block text-gray-900 font-medium">{activeOuting.reportingTime || '-'}</span>
                 </div>
               </div>

               <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-6 flex justify-between items-center text-sm">
                 <div>
                   <span className="block text-gray-400 font-bold uppercase text-xs tracking-wider mb-1">Approved By</span>
                   <span className="block text-gray-900 font-bold">{activeOuting.approvedBy || 'Caretaker'}</span>
                 </div>
                 <div className="text-right">
                   <span className="block text-gray-400 font-bold uppercase text-xs tracking-wider mb-1">Approval Time</span>
                   <span className="block text-gray-900 font-medium">
                     {activeOuting.approvalTime ? `${new Date(activeOuting.approvalTime).toLocaleDateString()} ${new Date(activeOuting.approvalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : '-'}
                   </span>
                 </div>
               </div>
             </div>
           </div>
         ) : activeOuting.status === 'Rejected' ? (
           <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-red-50 border border-red-200 p-5 rounded-xl gap-4">
              <div className="space-y-1">
                <div className="font-bold text-[16px] text-red-800">
                   Outing Request Rejected
                </div>
                <div className="text-[14px] text-red-600 font-medium">
                   Reason: {activeOuting.remarks || 'No reason provided'}
                </div>
              </div>
              <span className="px-5 py-2 rounded-lg text-[13px] font-bold tracking-wider uppercase text-center bg-red-100 text-red-800 border border-red-300">
                Rejected
              </span>
           </div>
         ) : (
           <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-yellow-50 border border-yellow-200 p-5 rounded-xl gap-4">
              <div className="space-y-1">
                <div className="font-bold text-[16px] text-yellow-800 flex items-center gap-2">
                   {activeOuting.destination}
                   {activeOuting.outingType === 'Emergency' && <span className="text-[10px] font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded uppercase border border-red-200">Emergency</span>}
                </div>
                <div className="text-[14px] text-yellow-700 font-medium flex gap-4">
                   <span>Submitted: {activeOuting.submittedDate ? new Date(activeOuting.submittedDate).toLocaleDateString() : '-'} at {activeOuting.submittedTime ? new Date(activeOuting.submittedTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}</span>
                </div>
              </div>
              <span className="px-5 py-2 rounded-lg text-[13px] font-bold tracking-wider uppercase text-center bg-yellow-100 text-yellow-800 border border-yellow-300">
                Pending Approval
              </span>
           </div>
         )
      ) : (
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-8 flex items-center justify-center text-[var(--color-text-muted)] font-bold text-[15px]">
          No active outing request.
        </div>
      )}
    </div>
  );
};
