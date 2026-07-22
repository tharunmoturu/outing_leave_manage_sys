import React, { useEffect, useState } from 'react';
import API from '../services/api';
import Modal from '../components/Modal';
import {
  Calendar,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  User,
  MapPin,
  FileText
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isApplyOutingOpen, setIsApplyOutingOpen] = useState(false);
  const [outingForm, setOutingForm] = useState({
    reason: '',
    leavingTime: '',
    reportingTime: '',
    studentPhone: '',
    parentPhone: '',
    destination: '',
  });

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch Student data
  const fetchStudentDashboard = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/dashboard/student');
      setData(data);
    } catch (err) {
      console.error('Failed to load student dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentDashboard();
  }, []);

  // Time options for dropdowns
  const leavingTimeOptions = [
    '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', 
    '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', 
    '4:00 PM', '4:30 PM', '5:00 PM'
  ];

  const reportingTimeOptions = [
    '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', 
    '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', 
    '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', 
    '8:00 PM', '8:30 PM', '9:00 PM'
  ];

  // Submit Outing Application
  const handleApplyOutingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    
    if (!outingForm.reason.trim() || !outingForm.destination.trim() || !outingForm.leavingTime || !outingForm.reportingTime || !outingForm.studentPhone || !outingForm.parentPhone) {
      setFormError('All fields are required.');
      return;
    }
    
    if (data?.metrics?.remainingOutings <= 0) {
      setFormError('You have already used all 3 outings for this month.');
      return;
    }

    setSubmitting(true);
    try {
      // Combining extra fields into purpose string for the API since we cannot modify backend logic.
      const formattedPurpose = `${outingForm.reason} | Leave: ${outingForm.leavingTime} | Return: ${outingForm.reportingTime} | Phone: ${outingForm.studentPhone} | Parent: ${outingForm.parentPhone}`;

      await API.post('/outings/apply', {
        purpose: formattedPurpose,
        destination: outingForm.destination,
        attachment_url: ''
      });

      setFormSuccess('Outing request submitted successfully! Awaiting caretaker approval.');
      
      // Reload stats
      fetchStudentDashboard();

      setTimeout(() => {
        setIsApplyOutingOpen(false);
        setOutingForm({ reason: '', leavingTime: '', reportingTime: '', studentPhone: '', parentPhone: '', destination: '' });
      }, 2000);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to submit outing request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Section */}
      <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border-gray)] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
            Welcome, {data?.student?.name || 'Loading...'}
          </h1>
          {data?.student && (
            <div className="text-[14px] text-[var(--color-text-secondary)] mt-3 flex flex-wrap gap-5 font-medium">
              <span className="flex items-center gap-1.5"><User size={16}/> ID: {data.student.student_id}</span>
              <span className="flex items-center gap-1.5"><FileText size={16}/> Branch: CSE</span>
              <span className="flex items-center gap-1.5"><Calendar size={16}/> Year: E2</span>
              <span className="flex items-center gap-1.5"><MapPin size={16}/> Room: {data.student.room} ({data.student.hostel})</span>
            </div>
          )}
        </div>
        <div className="flex flex-col items-start md:items-end gap-3">
          <div className="text-[14px] font-bold text-[var(--color-text-primary)] bg-gray-100 px-4 py-2 rounded-lg">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <button onClick={fetchStudentDashboard} className="text-[13px] font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1.5">
             <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Details
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
          <RefreshCw className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
          <span className="text-sm font-semibold">Loading student dashboard...</span>
        </div>
      ) : (
        data && (
          <div className="space-y-6">
            
            {/* Monthly Outing Summary Card */}
            <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border-gray)] p-8">
              <h3 className="text-[16px] font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-6">
                Monthly Outing Quota
              </h3>

              <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="flex-1 w-full space-y-5">
                  <div className="flex items-center justify-between text-[14px] font-bold text-[var(--color-text-secondary)] uppercase">
                    <span>Allowed: 3</span>
                    <span>Used: {data.metrics.usedOutings}</span>
                  </div>
                  
                  {/* Progress Indicator */}
                  <div className="flex gap-3 h-6 w-full">
                    {[1, 2, 3].map((num) => (
                      <div 
                        key={num} 
                        className={`flex-1 rounded ${num <= data.metrics.usedOutings ? 'bg-[var(--color-primary)]' : 'bg-gray-100 border border-gray-200'}`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[16px]">
                    <span className="font-bold text-[var(--color-text-primary)]">
                      Remaining Outings: <span className="text-[var(--color-primary)] text-[22px] ml-2">{data.metrics.remainingOutings}</span>
                    </span>
                    <span className="text-[13px] text-[var(--color-text-muted)] font-semibold uppercase">Current Month</span>
                  </div>
                </div>

                <div className="w-full md:w-auto md:border-l border-[var(--color-border-gray)] md:pl-12 flex flex-col items-center justify-center">
                  <button
                    onClick={() => {
                      setFormError('');
                      setFormSuccess('');
                      setIsApplyOutingOpen(true);
                    }}
                    disabled={data.metrics.remainingOutings <= 0 || data.metrics.status !== 'Inside'}
                    className="w-full md:w-auto bg-[var(--color-primary)] text-white px-10 py-4 rounded-xl text-[16px] font-bold shadow-md hover:bg-[#6c0f22] hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Apply for Outing
                  </button>
                  {data.metrics.remainingOutings <= 0 ? (
                     <span className="text-[13px] text-red-500 font-bold mt-3">Monthly quota exhausted.</span>
                  ) : data.metrics.status !== 'Inside' ? (
                     <span className="text-[13px] text-[var(--color-warning)] font-bold mt-3">You are currently outside.</span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Current Request Status */}
            <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border-gray)] p-6">
              <h3 className="text-[16px] font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-5">
                Current Outing Status
              </h3>
              
              {data.activeOuting ? (
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 border border-gray-200 p-5 rounded-xl gap-4">
                    <div className="space-y-1">
                      <div className="font-bold text-[16px] text-[var(--color-text-primary)]">
                         {data.activeOuting.destination}
                      </div>
                      <div className="text-[14px] text-[var(--color-text-secondary)] font-medium">
                         {data.activeOuting.purpose.split('|')[0] || data.activeOuting.purpose}
                      </div>
                    </div>
                    <span className={`px-5 py-2 rounded-lg text-[13px] font-bold tracking-wider uppercase text-center ${
                        data.activeOuting.status === 'Approved' ? 'bg-green-100 text-green-800 border border-green-200' : 
                        data.activeOuting.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                        data.activeOuting.status === 'Exited' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        'bg-gray-200 text-gray-800'
                    }`}>
                      {data.activeOuting.status === 'Exited' ? 'Student Currently Outside' : data.activeOuting.status}
                    </span>
                 </div>
              ) : (
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-8 flex items-center justify-center text-[var(--color-text-muted)] font-bold text-[15px]">
                  No Active Request
                </div>
              )}
            </div>

            {/* Recent Outings Table */}
            <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border-gray)] p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[16px] font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
                  Recent Outings
                </h3>
                <button className="text-[13px] font-bold text-[var(--color-primary)] hover:underline uppercase tracking-wide">
                  View All
                </button>
              </div>

              <div className="overflow-x-auto rounded-lg border border-[var(--color-border-gray)]">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-[var(--color-border-gray)] text-[12px] uppercase text-[var(--color-text-muted)] tracking-wider">
                      <th className="py-4 px-5 font-bold">Date</th>
                      <th className="py-4 px-5 font-bold">Reason</th>
                      <th className="py-4 px-5 font-bold">Destination</th>
                      <th className="py-4 px-5 font-bold">Status</th>
                      <th className="py-4 px-5 font-bold">Approved By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border-gray)] bg-white">
                    {data.recentOutings && data.recentOutings.slice(0, 5).length > 0 ? (
                      data.recentOutings.slice(0, 5).map((outing: any) => (
                        <tr key={outing._id} className="text-[14px] text-[var(--color-text-primary)] hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-5 font-bold">{new Date(outing.createdAt).toLocaleDateString()}</td>
                          <td className="py-4 px-5 text-[var(--color-text-secondary)] font-medium max-w-[200px] truncate">
                            {outing.purpose.split('|')[0] || outing.purpose}
                          </td>
                          <td className="py-4 px-5 text-[var(--color-text-secondary)] font-medium max-w-[150px] truncate">{outing.destination}</td>
                          <td className="py-4 px-5">
                            <span className={`px-3 py-1 rounded text-[12px] font-bold tracking-wide uppercase ${
                              outing.status === 'Returned' ? 'bg-green-50 text-green-700' :
                              outing.status === 'Cancelled' || outing.status === 'Rejected' ? 'bg-red-50 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {outing.status}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-[var(--color-text-muted)] font-medium">
                            {outing.approved_by_name || '-'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-[var(--color-text-muted)] text-[14px] font-semibold">
                          No outings logged this month.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )
      )}

      {/* MODAL: APPLY FOR OUTING REQUEST */}
      <Modal
        isOpen={isApplyOutingOpen}
        onClose={() => setIsApplyOutingOpen(false)}
        title="Apply for Outing"
      >
        <form onSubmit={handleApplyOutingSubmit} className="space-y-6 max-w-[600px] w-full">
          {formError && (
             <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-[14px] font-bold flex items-center gap-3">
               <AlertCircle size={20}/> {formError}
             </div>
          )}
          {formSuccess && (
             <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg text-[14px] font-bold flex items-center gap-3">
               <CheckCircle size={20}/> {formSuccess}
             </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 p-5 rounded-xl border border-gray-200">
             <div className="space-y-1 text-[13px]">
               <span className="block text-[var(--color-text-muted)] font-bold uppercase tracking-wider text-[11px]">Student ID</span>
               <span className="block font-bold text-[var(--color-text-primary)]">{data?.student?.student_id}</span>
             </div>
             <div className="space-y-1 text-[13px]">
               <span className="block text-[var(--color-text-muted)] font-bold uppercase tracking-wider text-[11px]">Name</span>
               <span className="block font-bold text-[var(--color-text-primary)] truncate" title={data?.student?.name}>{data?.student?.name}</span>
             </div>
             <div className="space-y-1 text-[13px]">
               <span className="block text-[var(--color-text-muted)] font-bold uppercase tracking-wider text-[11px]">Class</span>
               <span className="block font-bold text-[var(--color-text-primary)]">CSE E2</span>
             </div>
             <div className="space-y-1 text-[13px]">
               <span className="block text-[var(--color-text-muted)] font-bold uppercase tracking-wider text-[11px]">Room</span>
               <span className="block font-bold text-[var(--color-text-primary)]">{data?.student?.hostel} / {data?.student?.room}</span>
             </div>
          </div>

          <div className="space-y-5">
             <div className="flex flex-col gap-2">
               <label className="text-[13px] font-bold text-[var(--color-text-primary)] uppercase tracking-wide">
                 Reason <span className="text-red-500">*</span>
               </label>
               <textarea
                 required
                 value={outingForm.reason}
                 onChange={(e) => setOutingForm({ ...outingForm, reason: e.target.value })}
                 className="w-full rounded-xl border border-[var(--color-border-gray)] px-4 py-3 text-[14px] font-medium focus:outline-none focus:border-[var(--color-primary)] bg-white min-h-[80px]"
                 placeholder="State your reason for outing clearly"
               />
             </div>

             <div className="flex flex-col gap-2">
               <label className="text-[13px] font-bold text-[var(--color-text-primary)] uppercase tracking-wide">
                 Destination / Address <span className="text-red-500">*</span>
               </label>
               <textarea
                 required
                 value={outingForm.destination}
                 onChange={(e) => setOutingForm({ ...outingForm, destination: e.target.value })}
                 className="w-full rounded-xl border border-[var(--color-border-gray)] px-4 py-3 text-[14px] font-medium focus:outline-none focus:border-[var(--color-primary)] bg-white min-h-[80px]"
                 placeholder="Where exactly are you going?"
               />
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
               <div className="flex flex-col gap-2">
                 <label className="text-[13px] font-bold text-[var(--color-text-primary)] uppercase tracking-wide">
                   Leaving Time <span className="text-red-500">*</span>
                 </label>
                 <select
                   required
                   value={outingForm.leavingTime}
                   onChange={(e) => setOutingForm({ ...outingForm, leavingTime: e.target.value })}
                   className="w-full rounded-xl border border-[var(--color-border-gray)] px-4 py-3 text-[14px] font-medium focus:outline-none focus:border-[var(--color-primary)] bg-white"
                 >
                   <option value="">Select time</option>
                   {leavingTimeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                 </select>
               </div>
               <div className="flex flex-col gap-2">
                 <label className="text-[13px] font-bold text-[var(--color-text-primary)] uppercase tracking-wide">
                   Reporting Time <span className="text-red-500">*</span>
                 </label>
                 <select
                   required
                   value={outingForm.reportingTime}
                   onChange={(e) => setOutingForm({ ...outingForm, reportingTime: e.target.value })}
                   className="w-full rounded-xl border border-[var(--color-border-gray)] px-4 py-3 text-[14px] font-medium focus:outline-none focus:border-[var(--color-primary)] bg-white"
                 >
                   <option value="">Select time</option>
                   {reportingTimeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                 </select>
               </div>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
               <div className="flex flex-col gap-2">
                 <label className="text-[13px] font-bold text-[var(--color-text-primary)] uppercase tracking-wide">
                   Student Phone <span className="text-red-500">*</span>
                 </label>
                 <input
                   type="tel"
                   required
                   value={outingForm.studentPhone}
                   onChange={(e) => setOutingForm({ ...outingForm, studentPhone: e.target.value })}
                   className="w-full rounded-xl border border-[var(--color-border-gray)] px-4 py-3 text-[14px] font-medium focus:outline-none focus:border-[var(--color-primary)] bg-white"
                   placeholder="Your active mobile number"
                 />
               </div>
               <div className="flex flex-col gap-2">
                 <label className="text-[13px] font-bold text-[var(--color-text-primary)] uppercase tracking-wide">
                   Parent Phone <span className="text-red-500">*</span>
                 </label>
                 <input
                   type="tel"
                   required
                   value={outingForm.parentPhone}
                   onChange={(e) => setOutingForm({ ...outingForm, parentPhone: e.target.value })}
                   className="w-full rounded-xl border border-[var(--color-border-gray)] px-4 py-3 text-[14px] font-medium focus:outline-none focus:border-[var(--color-primary)] bg-white"
                   placeholder="Parent/Guardian number"
                 />
               </div>
             </div>
          </div>

          <div className="pt-6 border-t border-[var(--color-border-gray)] flex justify-end gap-4">
             <button
               type="button"
               onClick={() => setIsApplyOutingOpen(false)}
               className="px-8 py-3 rounded-xl font-bold text-[var(--color-text-secondary)] bg-gray-100 hover:bg-gray-200 transition-colors text-[15px]"
             >
               Cancel
             </button>
             <button
               type="submit"
               disabled={submitting || (data?.metrics?.remainingOutings <= 0)}
               className="px-8 py-3 rounded-xl font-bold text-white bg-[var(--color-primary)] hover:bg-[#6c0f22] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-[15px]"
             >
               {submitting ? 'Submitting...' : 'Submit Outing Request'}
             </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default StudentDashboard;
