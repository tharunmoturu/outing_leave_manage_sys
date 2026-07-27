import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Loader2, ArrowLeft, Info } from 'lucide-react';
import API from '../services/api';
import Modal from '../components/Modal';
import { formatTo12Hour } from '../utils/timeFormat';
import { StudentInfoCard } from '../components/dashboard/StudentInfoCard';
import { EmergencyCategorySelector } from '../components/dashboard/EmergencyCategorySelector';

const leavingTimeOptions: string[] = [];
for (let i = 6; i <= 17; i++) {
  const h = i.toString().padStart(2, '0');
  leavingTimeOptions.push(formatTo12Hour(`${h}:00`));
  if (i !== 17) leavingTimeOptions.push(formatTo12Hour(`${h}:30`));
}

const reportingTimeOptions: string[] = [];
for (let i = 9; i <= 20; i++) {
  const h = i.toString().padStart(2, '0');
  reportingTimeOptions.push(formatTo12Hour(`${h}:00`));
  if (i !== 20) reportingTimeOptions.push(formatTo12Hour(`${h}:30`));
}

export const EmergencyOutingPage: React.FC = () => {
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState<any>(null);
  const [loadingStudent, setLoadingStudent] = useState(true);

  // Form State
  const [form, setForm] = useState({
    emergencyCategory: '',
    otherReason: '',
    reason: '',
    destination: '',
    outingDate: '',
    leavingTime: '',
    reportingTime: ''
  });

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    setLoadingStudent(true);
    try {
      const { data } = await API.get('/student/dashboard');
      setStudentData(data.student);
    } catch (err) {
      setFormError('Failed to load student details.');
    } finally {
      setLoadingStudent(false);
    }
  };

  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const isTimeInPast = (timeStr: string) => {
    if (form.outingDate !== getTodayDateString()) return false;
    
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [timePart, modifier] = timeStr.trim().split(/\s+/);
    let [hours, minutes] = timePart.split(':').map(Number);
    if (modifier && modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
    if (modifier && modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;

    const optionMinutes = hours * 60 + minutes;
    return optionMinutes < currentMinutes;
  };

  const handleValidation = () => {
    setFormError('');
    if (!form.emergencyCategory || !form.reason.trim() || !form.destination.trim() || !form.outingDate || !form.leavingTime || !form.reportingTime) {
      setFormError('All fields are required.');
      return false;
    }
    
    if (form.emergencyCategory === 'Other' && !form.otherReason.trim()) {
      setFormError('Please specify the emergency category.');
      return false;
    }

    if (form.outingDate === getTodayDateString() && isTimeInPast(form.leavingTime)) {
       setFormError('Leaving time cannot be in the past.');
       return false;
    }

    const parseTime = (timeStr: string) => {
       const [h, m] = timeStr.split(':').map(Number);
       return h * 60 + m;
    };
    if (parseTime(form.leavingTime) >= parseTime(form.reportingTime)) {
       setFormError('Leaving time must be earlier than reporting time.');
       return false;
    }
    
    // Set confirm modal
    setIsConfirmOpen(true);
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setFormError('');
    
    try {
      const payload = {
        ...form,
        emergencyCategory: form.emergencyCategory === 'Other' ? form.otherReason : form.emergencyCategory
      };
      
      await API.post('/student/outings/emergency', payload);
      setFormSuccess('Your emergency outing request has been submitted successfully and is awaiting approval.');
      setIsConfirmOpen(false);
      
      setTimeout(() => {
        navigate('/student');
      }, 2000);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to submit outing request.');
      setIsConfirmOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex flex-col gap-4">
        <div className="flex items-center bg-red-50 p-4 rounded-xl shadow-sm border border-red-200 gap-4">
           <button 
             onClick={() => navigate('/student')} 
             className="p-2 bg-red-100 hover:bg-red-200 rounded-lg text-red-700 transition-colors flex items-center justify-center"
             title="Back to Dashboard"
           >
             <ArrowLeft size={20} />
           </button>
           <div>
             <h1 className="text-xl font-bold text-red-800">Emergency Outing Request</h1>
             <p className="text-sm text-red-600 font-medium mt-1">Submit an emergency outing request for urgent situations.</p>
           </div>
        </div>

        {/* Information Banner */}
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-xl shadow-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-0.5">
              <Info className="h-5 w-5 text-orange-500" />
            </div>
            <div className="ml-3 space-y-1">
              <p className="text-sm font-bold text-orange-800">
                Emergency outings are intended only for genuine emergencies.
              </p>
              <ul className="list-disc pl-5 text-sm text-orange-700 space-y-1">
                <li>These requests do not reduce your monthly outing quota.</li>
                <li>False requests may result in disciplinary action.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {formError && (
         <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-[14px] font-bold flex items-center gap-3 animate-fadeIn">
           <AlertCircle size={20}/> {formError}
         </div>
      )}
      {formSuccess && (
         <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-[14px] font-bold flex items-center gap-3 animate-fadeIn">
           <CheckCircle size={20}/> {formSuccess}
         </div>
      )}

      {/* Card 1: Student Information */}
      <StudentInfoCard studentData={studentData} loadingStudent={loadingStudent} />

      {/* Card 2: Outing Details */}
      <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border-gray)] p-6 space-y-6 border-t-4 border-t-red-500 relative overflow-hidden">
         <h3 className="text-[16px] font-bold text-red-700 uppercase tracking-wider mb-2 border-b pb-3 relative z-10">
           Emergency Details
         </h3>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <EmergencyCategorySelector 
              selectedCategory={form.emergencyCategory}
              onCategoryChange={val => setForm({ ...form, emergencyCategory: val })}
              otherReason={form.otherReason}
              onOtherReasonChange={val => setForm({ ...form, otherReason: val })}
            />

            <div className="col-span-1 md:col-span-2 space-y-2">
               <label className="text-[14px] font-bold text-[var(--color-text-secondary)]">Destination <span className="text-red-500">*</span></label>
               <input 
                 value={form.destination}
                 onChange={e => setForm({ ...form, destination: e.target.value })}
                 type="text" 
                 className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" 
                 placeholder="Where are you going?..." 
               />
            </div>

            <div className="col-span-1 md:col-span-2 space-y-2">
               <label className="text-[14px] font-bold text-[var(--color-text-secondary)]">Emergency Reason <span className="text-red-500">*</span></label>
               <textarea 
                 value={form.reason}
                 onChange={e => setForm({ ...form, reason: e.target.value })}
                 className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" 
                 placeholder="Please briefly describe the reason for this emergency..." 
                 rows={3} 
               />
            </div>

            <div className="space-y-2 col-span-1 md:col-span-2">
               <label className="text-[14px] font-bold text-[var(--color-text-secondary)]">Date of Outing <span className="text-red-500">*</span></label>
               <input 
                 value={form.outingDate}
                 onChange={e => setForm({ ...form, outingDate: e.target.value })}
                 type="date" 
                 min={getTodayDateString()}
                 className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" 
               />
            </div>

            <div className="space-y-2">
               <label className="text-[14px] font-bold text-[var(--color-text-secondary)]">Leaving Time <span className="text-red-500">*</span></label>
               <select 
                 value={form.leavingTime}
                 onChange={e => setForm({ ...form, leavingTime: e.target.value })}
                 className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white" 
               >
                 <option value="" disabled>Select leaving time</option>
                 {leavingTimeOptions.map(time => {
                   const isPast = isTimeInPast(time);
                   return (
                     <option key={time} value={time} disabled={isPast}>{time}</option>
                   );
                 })}
               </select>
            </div>

            <div className="space-y-2">
               <label className="text-[14px] font-bold text-[var(--color-text-secondary)]">Expected Return Time <span className="text-red-500">*</span></label>
               <select 
                 value={form.reportingTime}
                 onChange={e => setForm({ ...form, reportingTime: e.target.value })}
                 className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white" 
               >
                 <option value="" disabled>Select reporting time</option>
                 {reportingTimeOptions.map(time => (
                   <option key={time} value={time}>{time}</option>
                 ))}
               </select>
            </div>
         </div>

         <div className="pt-6 border-t border-[var(--color-border-gray)] flex justify-end gap-4 relative z-10">
            <button
               type="button"
               onClick={() => navigate('/student')}
               className="px-6 py-3 rounded-lg font-bold text-[var(--color-text-secondary)] bg-gray-100 hover:bg-gray-200 transition-colors text-[14px]"
            >
               Cancel
            </button>
            <button
               onClick={handleValidation}
               disabled={submitting}
               className="px-6 py-3 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-[14px]"
            >
               Submit Emergency
            </button>
         </div>
      </div>

      {/* Confirmation Modal */}
      <Modal isOpen={isConfirmOpen} onClose={() => !submitting && setIsConfirmOpen(false)} title="Confirm Emergency Outing">
         <div className="space-y-4 w-full sm:w-[400px]">
           <p className="text-sm text-gray-600 mb-4 font-medium">Are you sure you want to submit this emergency outing request? Emergency requests should only be used for genuine emergencies.</p>
           
           <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-sm space-y-3">
             <div className="grid grid-cols-3 gap-2">
                <span className="text-red-800 font-bold uppercase text-xs">Student</span>
                <span className="col-span-2 font-bold text-red-950">{studentData?.name} ({studentData?.studentId})</span>
             </div>
             <div className="grid grid-cols-3 gap-2">
                <span className="text-red-800 font-bold uppercase text-xs">Category</span>
                <span className="col-span-2 font-bold text-red-950">
                  {form.emergencyCategory === 'Other' ? form.otherReason : form.emergencyCategory}
                </span>
             </div>
             <div className="grid grid-cols-3 gap-2">
                <span className="text-red-800 font-bold uppercase text-xs">Destination</span>
                <span className="col-span-2 font-bold text-red-950">{form.destination}</span>
             </div>
             <div className="grid grid-cols-3 gap-2">
                <span className="text-red-800 font-bold uppercase text-xs">Date</span>
                <span className="col-span-2 font-bold text-red-950">{form.outingDate}</span>
             </div>
             <div className="grid grid-cols-3 gap-2">
                <span className="text-red-800 font-bold uppercase text-xs">Timing</span>
                <span className="col-span-2 font-bold text-red-950">{form.leavingTime} - {form.reportingTime}</span>
             </div>
           </div>

           <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
              <button 
                onClick={() => setIsConfirmOpen(false)}
                disabled={submitting}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                 Cancel
              </button>
              <button 
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                 {submitting && <Loader2 size={16} className="animate-spin" />}
                 Submit Request
              </button>
           </div>
         </div>
      </Modal>
    </div>
  );
};

export default EmergencyOutingPage;
