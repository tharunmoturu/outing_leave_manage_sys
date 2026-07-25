import { useNavigate } from 'react-router-dom';
import { formatTo12Hour } from '../../utils/timeFormat';
import { QrCode } from 'lucide-react';

interface ActiveOutingCardProps {
  activeOuting: any;
  studentName?: string;
  studentId?: string;
  branch?: string;
  year?: string;
  hostel?: string;
  room?: string;
}

export const ActiveOutingCard: React.FC<ActiveOutingCardProps> = ({ 
  activeOuting
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border-gray)] p-6">
      <h3 className="text-[16px] font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-5">
        Current Outing Status
      </h3>
      
      {activeOuting ? (
         activeOuting.status === 'Approved' || activeOuting.status === 'Exited' ? (
           <div className="bg-white border-2 border-[var(--color-primary)] rounded-xl overflow-hidden shadow-sm max-w-2xl mx-auto">
             <div className="bg-[var(--color-primary)] text-white p-4 flex justify-between items-center">
               <div>
                 <h2 className="text-[16px] font-bold uppercase tracking-widest">Outing Approved</h2>
                 <p className="text-[12px] opacity-90">Valid until {formatTo12Hour(activeOuting.reportingTime)}</p>
               </div>
               <div className="bg-white text-[var(--color-primary)] px-3 py-1 rounded font-bold uppercase text-[12px]">
                 {activeOuting.status}
               </div>
             </div>
             
             <div className="p-6">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                 <div className="space-y-1">
                   <p className="text-[14px] font-bold text-gray-900">{activeOuting.destination}</p>
                   <p className="text-[13px] text-gray-600">{activeOuting.purpose}</p>
                   <p className="text-[12px] text-gray-400 mt-2">
                     Approved By {activeOuting.approvedBy} at {activeOuting.approvalTime ? new Date(activeOuting.approvalTime).toLocaleString() : '-'}
                   </p>
                 </div>
                 
                 <button 
                   onClick={() => navigate('/student/gate-pass')}
                   className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold px-5 py-2.5 rounded-lg transition-colors border border-blue-200"
                 >
                   <QrCode size={18} />
                   View Digital Gate Pass
                 </button>
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
