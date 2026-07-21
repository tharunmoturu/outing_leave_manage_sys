import React, { useEffect, useState } from 'react';
import API from '../services/api';
import Modal from '../components/Modal';
import {
  Calendar,
  Clock,
  QrCode,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  User,
  Plus,
  RefreshCw,
  History,
  ShieldAlert,
  Send
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isApplyOutingOpen, setIsApplyOutingOpen] = useState(false);
  const [outingForm, setOutingForm] = useState({
    purpose: '',
    destination: '',
    attachment_url: '',
  });

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Active tab in history panel
  const [activeTab, setActiveTab] = useState<'outings' | 'leaves'>('outings');

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

  // Handle file base64 encoding for medical certificates / permission letters
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setFormError('Attachment size must be under 2MB');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setOutingForm({ ...outingForm, attachment_url: reader.result as string });
    };
    reader.onerror = () => {
      setFormError('Error reading attachment file');
    };
  };

  // Submit Outing Application
  const handleApplyOutingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    
    if (!outingForm.purpose.trim() || !outingForm.destination.trim()) {
      setFormError('Purpose and destination are required.');
      return;
    }

    setSubmitting(true);
    try {
      await API.post('/outings/apply', outingForm);
      setFormSuccess('Outing request submitted successfully! Awaiting caretaker approval.');
      
      // Reload stats
      fetchStudentDashboard();

      setTimeout(() => {
        setIsApplyOutingOpen(false);
        setOutingForm({ purpose: '', destination: '', attachment_url: '' });
      }, 2000);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to submit outing request');
    } finally {
      setSubmitting(false);
    }
  };

  // Cancel Outing pass before exit
  const handleCancelOuting = async (outingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this outing pass request?')) {
      return;
    }
    try {
      await API.post(`/outings/${outingId}/cancel`);
      fetchStudentDashboard();
      alert('Outing pass cancelled successfully');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel outing');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {data?.student && (
          <div>
            <h1 className="font-heading text-2xl font-black text-slate-800 dark:text-white sm:text-3xl">
              Welcome, {data.student.name}
            </h1>
            <p className="text-sm text-slate-400 dark:text-slate-500">
              ID: {data.student.student_id} · Room: {data.student.hostel}/{data.student.room}
            </p>
          </div>
        )}
        <button
          onClick={fetchStudentDashboard}
          className="flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition-all duration-200 cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh Details</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
          <RefreshCw className="h-8 w-8 animate-spin text-indigo-500" />
          <span className="text-sm font-semibold">Loading student profile...</span>
        </div>
      ) : (
        data && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
            {/* Left Column (Span 8): Quotas, Active Passes, Applications */}
            <div className="space-y-6 lg:col-span-8">
              {/* Quota Indicator Banner */}
              <div className="glass-panel rounded-3xl p-6 border bg-gradient-to-r from-indigo-500/5 via-violet-500/5 to-transparent relative overflow-hidden">
                <h3 className="font-heading text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
                  Monthly Outing Quota Balance
                </h3>

                <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">
                  <div className="flex items-center gap-4">
                    {/* Circle Balance Gauge */}
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                      <svg className="absolute inset-0 h-full w-full -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          fill="transparent"
                          className="stroke-slate-200 dark:stroke-slate-700"
                          strokeWidth="6"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          fill="transparent"
                          stroke="#6366f1"
                          strokeWidth="6"
                          strokeDasharray={2 * Math.PI * 34}
                          strokeDashoffset={2 * Math.PI * 34 * (1 - data.metrics.remainingOutings / 3)}
                          className="transition-all duration-500"
                        />
                      </svg>
                      <span className="font-heading text-2xl font-black text-indigo-600 dark:text-indigo-400">
                        {data.metrics.remainingOutings}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Outings Remaining</span>
                      <p className="text-[11px] text-slate-400">
                        You have used <span className="font-bold text-slate-700 dark:text-slate-300">{data.metrics.usedOutings} of 3</span> outings this month.
                      </p>
                    </div>
                  </div>

                  {data.metrics.status === 'Inside' ? (
                    <button
                      onClick={() => {
                        setFormError('');
                        setFormSuccess('');
                        setIsApplyOutingOpen(true);
                      }}
                      className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 text-xs font-bold shadow-md shadow-indigo-500/10 active:scale-95 transition-all duration-200 cursor-pointer w-full sm:w-auto"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Apply for Outing</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-rose-500 bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/10">
                      Cannot apply for outings while checked out.
                    </span>
                  )}
                </div>
              </div>

              {/* Active Outing / Leave Display */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Active Outing Pass (Simulates QR gatepass) */}
                <div className="glass-panel rounded-3xl border p-5 flex flex-col justify-between min-h-[300px]">
                  <h3 className="font-heading text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
                    Active Outing Pass
                  </h3>

                  {data.activeOuting ? (
                    <div className="flex-1 flex flex-col justify-between items-center text-center space-y-4">
                      {/* Pass details */}
                      <div className="space-y-1">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                          data.activeOuting.status === 'Approved'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : data.activeOuting.status === 'Pending'
                            ? 'bg-amber-500/10 text-amber-500 animate-pulse'
                            : 'bg-rose-500/10 text-rose-500 animate-pulse'
                        }`}>
                          {data.activeOuting.status} Outing
                        </span>
                        <h4 className="font-bold text-slate-800 dark:text-white text-sm">
                          {data.activeOuting.purpose}
                        </h4>
                        <span className="block text-[10px] text-slate-400">
                          Dest: {data.activeOuting.destination}
                        </span>
                      </div>

                      {/* Simulated QR Code Pass or Awaiting Approval */}
                      {data.activeOuting.status === 'Pending' ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2 mt-2">
                          <Clock className="h-10 w-10 text-amber-500 animate-pulse" />
                          <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/10">
                            Awaiting Caretaker Approval
                          </p>
                          <span className="text-[9px] text-slate-400 max-w-[150px] leading-relaxed">
                            Caretaker approval date & time will be logged automatically.
                          </span>
                        </div>
                      ) : (
                        <div className="relative flex h-28 w-28 items-center justify-center rounded-2xl bg-white border border-slate-200 dark:border-slate-800 p-2 shadow-inner group">
                          <QrCode className="h-full w-full text-slate-900 group-hover:scale-105 transition-all duration-300" />
                          <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
                          
                          {/* QR scan scanning lines animation */}
                          {data.activeOuting.status === 'Exited' && (
                            <div className="absolute top-0 inset-x-0 h-0.5 bg-rose-500 animate-bounce" />
                          )}
                        </div>
                      )}

                      <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                        {data.activeOuting.outing_id}
                      </div>

                      {/* Cancel Outing pass request if not checked out */}
                      {(data.activeOuting.status === 'Approved' || data.activeOuting.status === 'Pending') && (
                        <button
                          onClick={() => handleCancelOuting(data.activeOuting._id)}
                          className="text-[10px] font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-500/5 px-3 py-1.5 rounded-lg border border-transparent hover:border-rose-500/20 active:scale-95 transition-all cursor-pointer"
                        >
                          Cancel Pass Request
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
                      <ShieldAlert className="h-10 w-10 text-slate-200 dark:text-slate-800" />
                      <p className="text-xs font-semibold">No active outing passes granted</p>
                    </div>
                  )}
                </div>

                {/* Active Leave Request */}
                <div className="glass-panel rounded-3xl border p-5 flex flex-col justify-between min-h-[300px]">
                  <h3 className="font-heading text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
                    Active Overnight Leave
                  </h3>

                  {data.activeLeave ? (
                    <div className="flex-1 flex flex-col justify-between items-center text-center space-y-4">
                      <div className="space-y-1">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                          data.activeLeave.status === 'Approved'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-amber-500/10 text-amber-500'
                        }`}>
                          Leave {data.activeLeave.status}
                        </span>
                        <h4 className="font-bold text-slate-800 dark:text-white text-sm">
                          {data.activeLeave.reason}
                        </h4>
                      </div>

                      <div className="bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-4 w-full text-xs text-slate-600 dark:text-slate-400 space-y-2">
                        <div className="flex items-center justify-between font-semibold border-b border-slate-200/50 pb-1.5 text-[10px] uppercase text-slate-400">
                          <span>Leave Dates</span>
                          <Calendar className="h-4 w-4" />
                        </div>
                        <div className="flex items-center justify-between font-bold">
                          <span>Starts:</span>
                          <span className="text-slate-800 dark:text-slate-200">
                            {new Date(data.activeLeave.start_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between font-bold">
                          <span>Ends:</span>
                          <span className="text-slate-800 dark:text-slate-200">
                            {new Date(data.activeLeave.end_date).toLocaleDateString()}
                          </span>
                        </div>
                        
                        {data.activeLeave.remarks && (
                          <div className="mt-2 text-left text-[10px] border-t border-slate-200/50 pt-1.5 italic">
                            Warden remarks: {data.activeLeave.remarks}
                          </div>
                        )}
                      </div>

                      <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                        {data.activeLeave.leave_id}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
                      <ShieldAlert className="h-10 w-10 text-slate-200 dark:text-slate-800" />
                      <p className="text-xs font-semibold">No active or pending leave applications</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column (Span 4): History Logs Tab Panels */}
            <div className="glass-panel rounded-3xl border overflow-hidden lg:col-span-4 flex flex-col">
              {/* Tab Selector Header */}
              <div className="flex border-b border-slate-200/60 dark:border-slate-800/60 p-2 bg-slate-500/5 gap-2">
                <button
                  onClick={() => setActiveTab('outings')}
                  className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${
                    activeTab === 'outings'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Outings Logs
                </button>
                <button
                  onClick={() => setActiveTab('leaves')}
                  className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${
                    activeTab === 'leaves'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Leaves Logs
                </button>
              </div>

              {/* Tab Content body */}
              <div className="p-4 max-h-[450px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50">
                {activeTab === 'outings' ? (
                  data.recentOutings.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-12">No outings history logged</p>
                  ) : (
                    data.recentOutings.map((outing: any) => (
                      <div key={outing._id} className="py-3 flex justify-between items-center text-xs">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-700 dark:text-slate-300">{outing.purpose}</p>
                          <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(outing.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[8px] font-bold uppercase ${
                            outing.status === 'Returned'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : outing.status === 'Cancelled'
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                              : 'bg-rose-500/10 text-rose-500'
                          }`}>
                            {outing.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  data.recentLeaves.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-12">No leaves history logged</p>
                  ) : (
                    data.recentLeaves.map((leave: any) => (
                      <div key={leave._id} className="py-3 flex justify-between items-center text-xs">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-700 dark:text-slate-300">{leave.reason}</p>
                          <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(leave.start_date).toLocaleDateString()} to {new Date(leave.end_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[8px] font-bold uppercase ${
                            leave.status === 'Approved'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : leave.status === 'Pending'
                              ? 'bg-amber-500/10 text-amber-500'
                              : 'bg-rose-500/10 text-rose-500'
                          }`}>
                            {leave.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>
            </div>
          </div>
        )
      )}

      {/* MODAL: APPLY FOR OUTING REQUEST */}
      <Modal
        isOpen={isApplyOutingOpen}
        onClose={() => setIsApplyOutingOpen(false)}
        title="Apply for Same-Day Outing"
      >
        <form onSubmit={handleApplyOutingSubmit} className="space-y-4">
          {formError && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-500">
              <AlertCircle className="h-4 w-4" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-500 font-semibold">
              {formSuccess}
            </div>
          )}

          <div className="space-y-3">
            {/* Purpose of Outing */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Purpose of Outing (e.g. Movie, Buy books, Clinic visit)
              </label>
              <input
                type="text"
                required
                value={outingForm.purpose}
                onChange={(e) => setOutingForm({ ...outingForm, purpose: e.target.value })}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 px-3 text-xs text-slate-800 dark:text-white outline-none focus:border-indigo-500 transition-all"
                placeholder="e.g. Going for a movie with friends, buying study books"
              />
            </div>

            {/* Destination */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Destination
              </label>
              <input
                type="text"
                required
                value={outingForm.destination}
                onChange={(e) => setOutingForm({ ...outingForm, destination: e.target.value })}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 px-3 text-xs text-slate-800 dark:text-white outline-none focus:border-indigo-500 transition-all"
                placeholder="e.g. City Central Mall, Sector 15 Market"
              />
            </div>

            {/* Document Attachment */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Attach Permission Letter / Written Proof (Optional)</span>
                <span className="text-[9px] text-slate-400 normal-case font-normal">(PDF/Image, under 2MB)</span>
              </label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 px-3 text-xs text-slate-800 dark:text-white file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-indigo-500/10 file:text-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-200/50 pt-4">
            <button
              type="button"
              onClick={() => setIsApplyOutingOpen(false)}
              className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{submitting ? 'Applying...' : 'Apply for Outing'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default StudentDashboard;
