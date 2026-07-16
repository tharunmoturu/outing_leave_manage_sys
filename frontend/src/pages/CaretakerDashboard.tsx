import React, { useEffect, useState } from 'react';
import API from '../services/api';
import Modal from '../components/Modal';
import {
  Search,
  Users,
  CheckCircle,
  XCircle,
  Plus,
  ArrowRight,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  FileText,
  User,
  Activity,
  UserCheck
} from 'lucide-react';

export const CaretakerDashboard: React.FC = () => {
  // Statistics/Dashboard metrics state
  const [metrics, setMetrics] = useState<any>(null);
  const [activeOutings, setActiveOutings] = useState<any[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  // Search autocomplete state
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Selected student state
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentOutings, setStudentOutings] = useState<any[]>([]);
  const [studentLeaves, setStudentLeaves] = useState<any[]>([]);
  const [loadingStudent, setLoadingStudent] = useState(false);

  // Modals state
  const [isGrantOutingOpen, setIsGrantOutingOpen] = useState(false);
  const [isLeaveActionOpen, setIsLeaveActionOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<any>(null);
  const [leaveActionType, setLeaveActionType] = useState<'approve' | 'reject'>('approve');

  // Form Fields
  const [outingForm, setOutingForm] = useState({
    purpose: 'Personal Errands',
    destination: '',
    out_time: '',
    expected_return: '',
    remarks: '',
  });

  const [leaveRemarks, setLeaveRemarks] = useState('');

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch Caretaker Dashboard summary data
  const fetchDashboardData = async () => {
    setLoadingDashboard(true);
    try {
      const { data } = await API.get('/dashboard/caretaker');
      setMetrics(data.metrics);
      setActiveOutings(data.activeOutingsList);
      setPendingLeaves(data.pendingLeavesList);
    } catch (err) {
      console.error('Failed to fetch caretaker statistics', err);
    } finally {
      setLoadingDashboard(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handle Autocomplete fetch
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const { data } = await API.get(`/students/suggestions?q=${searchQuery}`);
        setSuggestions(data);
      } catch (err) {
        console.error(err);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Load single student profile
  const handleSelectStudent = async (studentId: string) => {
    setLoadingStudent(true);
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    try {
      const { data } = await API.get(`/students/${studentId}`);
      setSelectedStudent(data.student);
      setStudentOutings(data.outings);
      setStudentLeaves(data.leaves);
    } catch (err) {
      console.error('Failed to load student profile', err);
    } finally {
      setLoadingStudent(false);
    }
  };

  // Open Grant Outing Modal Setup
  const openGrantOutingModal = () => {
    if (!selectedStudent) return;
    
    // Set default out time to now, expected return to now + 4 hours
    const now = new Date();
    const returnTime = new Date(now.getTime() + 4 * 60 * 60 * 1000);
    
    // ISO format for datetime-local input: YYYY-MM-DDTHH:MM
    const formatDateTimeLocal = (date: Date) => {
      const pad = (num: number) => num.toString().padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    setOutingForm({
      purpose: 'Personal Errands',
      destination: '',
      out_time: formatDateTimeLocal(now),
      expected_return: formatDateTimeLocal(returnTime),
      remarks: '',
    });
    setFormError('');
    setFormSuccess('');
    setIsGrantOutingOpen(true);
  };

  // Submit Outing Grant
  const handleGrantOutingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setSubmitting(true);

    try {
      await API.post('/outings/grant', {
        student_id: selectedStudent.student_id,
        ...outingForm,
      });

      setFormSuccess('Outing granted and registered successfully!');
      
      // Refresh current student profile
      handleSelectStudent(selectedStudent._id);
      
      // Refresh statistics queue
      fetchDashboardData();

      setTimeout(() => {
        setIsGrantOutingOpen(false);
      }, 1500);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to grant outing');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Leave remarks action modal
  const openLeaveActionModal = (leave: any, type: 'approve' | 'reject') => {
    setSelectedLeave(leave);
    setLeaveActionType(type);
    setLeaveRemarks('');
    setFormError('');
    setFormSuccess('');
    setIsLeaveActionOpen(true);
  };

  // Submit Leave Action
  const handleLeaveActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setSubmitting(true);

    try {
      const endpoint = `/leaves/${selectedLeave._id}/${leaveActionType}`;
      await API.post(endpoint, { remarks: leaveRemarks });

      setFormSuccess(`Leave successfully ${leaveActionType}d!`);
      
      // If the currently selected student is this leave's student, refresh profile
      if (selectedStudent && selectedStudent._id === selectedLeave.student._id) {
        handleSelectStudent(selectedStudent._id);
      }

      // Refresh statistics queues
      fetchDashboardData();

      setTimeout(() => {
        setIsLeaveActionOpen(false);
        setSelectedLeave(null);
      }, 1500);
    } catch (err: any) {
      setFormError(err.response?.data?.message || `Failed to ${leaveActionType} leave`);
    } finally {
      setSubmitting(false);
    }
  };

  // Gate checkin return click (inside Checked Out list)
  const handleMarkReturn = async (outingId: string) => {
    if (!window.confirm('Mark this student as RETURNED? (This will transition status to Inside)')) {
      return;
    }
    try {
      await API.post(`/outings/${outingId}/return`);
      
      // Reload stats and student profiles
      fetchDashboardData();
      if (selectedStudent) {
        handleSelectStudent(selectedStudent._id);
      }
      alert('Student checked back in successfully');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Check-in operation failed');
    }
  };

  // Gate checkout exit click
  const handleMarkExit = async (outingId: string) => {
    if (!window.confirm('Mark this student as EXITED? (This will transition status to Outside)')) {
      return;
    }
    try {
      await API.post(`/outings/${outingId}/exit`);
      
      // Reload stats and student profiles
      fetchDashboardData();
      if (selectedStudent) {
        handleSelectStudent(selectedStudent._id);
      }
      alert('Student checked out successfully');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Check-out operation failed');
    }
  };

  // Cancel outing approval before exit
  const handleCancelOuting = async (outingId: string) => {
    if (!window.confirm('Cancel this approved pass and refund the outings quota?')) {
      return;
    }
    try {
      await API.post(`/outings/${outingId}/cancel`);
      fetchDashboardData();
      if (selectedStudent) {
        handleSelectStudent(selectedStudent._id);
      }
      alert('Outing cancelled successfully');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel outing');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="font-heading text-2xl font-black text-slate-800 dark:text-white sm:text-3xl">
          Caretaker Console
        </h1>
        <p className="text-sm text-slate-400 dark:text-slate-500">
          Search student profiles, approve leaves, and grant daily gatepass outings.
        </p>
      </div>

      {/* Main Double Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Student Search & Actions (Span 7) */}
        <div className="space-y-6 lg:col-span-7">
          {/* Autocomplete Search Panel */}
          <div className="glass-panel rounded-3xl p-5 border relative">
            <h3 className="font-heading text-sm font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              Search Student profile
            </h3>
            
            <div className="relative">
              <Search className="absolute top-3.5 left-4 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Type Student ID (e.g. S101) or Name..."
                value={searchQuery}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3.5 pl-12 pr-4 text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
              />

              {/* Autocomplete Dropdown list */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 z-50 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-2 shadow-xl divide-y divide-slate-100 dark:divide-slate-900">
                  {suggestions.map((student) => (
                    <div
                      key={student._id}
                      onClick={() => handleSelectStudent(student._id)}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-500/5 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-xs">
                          {student.photo ? (
                            <img src={student.photo} alt={student.name} className="h-full w-full object-cover" />
                          ) : (
                            <User className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                            {student.name}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">
                            {student.student_id} · {student.branch} {student.year} Yr
                          </span>
                        </div>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[8px] font-extrabold uppercase ${
                        student.status === 'Inside'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {student.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Student Profile Card (Loaded on selection) */}
          {loadingStudent ? (
            <div className="glass-panel rounded-3xl border p-12 text-center text-slate-400">
              <Clock className="mx-auto h-8 w-8 animate-spin text-indigo-500 mb-3" />
              <span className="text-sm font-semibold">Loading student profile...</span>
            </div>
          ) : selectedStudent ? (
            <div className="space-y-6">
              {/* Profile Card Header */}
              <div className="glass-panel rounded-3xl border p-6 relative overflow-hidden">
                {/* Background colored indicator */}
                <div className={`absolute top-0 inset-x-0 h-2 ${
                  selectedStudent.status === 'Inside'
                    ? 'bg-emerald-500'
                    : selectedStudent.status === 'Outside'
                    ? 'bg-rose-500'
                    : 'bg-amber-500'
                }`} />

                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="h-20 w-20 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shadow-inner">
                    {selectedStudent.photo ? (
                      <img src={selectedStudent.photo} alt={selectedStudent.name} className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-10 w-10 text-slate-300" />
                    )}
                  </div>
                  
                  <div className="flex-1 text-center sm:text-left space-y-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
                      <h2 className="font-heading text-lg font-black text-slate-800 dark:text-white">
                        {selectedStudent.name}
                      </h2>
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase ${
                        selectedStudent.status === 'Inside'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : selectedStudent.status === 'Outside'
                          ? 'bg-rose-500/10 text-rose-500'
                          : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {selectedStudent.status}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider space-x-2">
                      <span>{selectedStudent.student_id}</span>
                      <span>·</span>
                      <span>{selectedStudent.branch} ({selectedStudent.year} Yr)</span>
                      <span>·</span>
                      <span>{selectedStudent.hostel} (Room {selectedStudent.room})</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-2 max-w-sm">
                      <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-2.5 text-center">
                        <span className="block text-[9px] font-bold text-slate-400 uppercase">Remaining Outings</span>
                        <span className={`font-heading text-xl font-extrabold ${
                          selectedStudent.remaining_outings === 0 ? 'text-rose-500' : 'text-slate-800 dark:text-white'
                        }`}>
                          {selectedStudent.remaining_outings}
                        </span>
                      </div>
                      <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-2.5 text-center">
                        <span className="block text-[9px] font-bold text-slate-400 uppercase">Used This Month</span>
                        <span className="font-heading text-xl font-extrabold text-slate-800 dark:text-white">
                          {selectedStudent.used_outings}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Grant Outing Action Button */}
                <div className="mt-6 border-t border-slate-200/50 dark:border-slate-800/50 pt-4 flex flex-col sm:flex-row gap-3 justify-between items-center">
                  <div className="text-[10px] text-slate-400 text-center sm:text-left font-semibold">
                    Contact: {selectedStudent.phone} | Parent: {selectedStudent.parent_phone}
                  </div>
                  
                  {selectedStudent.status === 'Inside' ? (
                    <button
                      onClick={openGrantOutingModal}
                      disabled={selectedStudent.remaining_outings <= 0}
                      className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white px-5 py-2.5 text-xs font-bold shadow-md shadow-indigo-500/10 active:scale-95 transition-all duration-200 cursor-pointer disabled:scale-100 disabled:shadow-none"
                    >
                      <Plus className="h-4 w-4" />
                      <span>{selectedStudent.remaining_outings <= 0 ? 'No outings remaining' : 'Grant Gatepass Outing'}</span>
                    </button>
                  ) : selectedStudent.status === 'Outside' ? (
                    <div className="text-xs text-rose-500 font-bold">
                      Student is checked out on active outing.
                    </div>
                  ) : (
                    <div className="text-xs text-amber-500 font-bold">
                      Student is checked out on active overnight leave.
                    </div>
                  )}
                </div>
              </div>

              {/* Student Outing & Leave History tabs inside profile */}
              <div className="glass-panel rounded-3xl border overflow-hidden p-5 space-y-4">
                <h3 className="font-heading text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Recent Outings / Leave History
                </h3>
                
                {studentOutings.length === 0 && studentLeaves.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No previous logs for this student</p>
                ) : (
                  <div className="space-y-4">
                    {/* Active Outing Action Row inside history */}
                    {studentOutings.map((outing) => {
                      if (outing.status === 'Approved' || outing.status === 'Exited') {
                        return (
                          <div key={outing._id} className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div className="space-y-1">
                              <span className="inline-flex rounded-full bg-indigo-500/10 px-2 py-0.5 text-[8px] font-bold text-indigo-500 uppercase tracking-wide">
                                Active {outing.status} Pass
                              </span>
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{outing.purpose} to {outing.destination}</p>
                              <span className="block text-[10px] text-slate-400">
                                Expect return: {new Date(outing.expected_return).toLocaleString()}
                              </span>
                            </div>
                            
                            <div className="flex gap-2 w-full sm:w-auto">
                              {outing.status === 'Approved' && (
                                <>
                                  <button
                                    onClick={() => handleMarkExit(outing._id)}
                                    className="flex-1 sm:flex-none rounded-lg bg-teal-600 hover:bg-teal-500 text-white px-3 py-1.5 text-[10px] font-bold shadow-sm active:scale-95 transition-all cursor-pointer"
                                  >
                                    Mark Exit
                                  </button>
                                  <button
                                    onClick={() => handleCancelOuting(outing._id)}
                                    className="flex-1 sm:flex-none rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-1.5 text-[10px] font-bold active:scale-95 transition-all cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}
                              {outing.status === 'Exited' && (
                                <button
                                  onClick={() => handleMarkReturn(outing._id)}
                                  className="flex-1 sm:flex-none rounded-lg bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 text-[10px] font-bold shadow-sm active:scale-95 transition-all cursor-pointer"
                                >
                                  Mark Return Checkin
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}

                    {/* Historical outing logs list */}
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">History Logs</h4>
                      {studentOutings.filter(o => o.status !== 'Approved' && o.status !== 'Exited').slice(0, 4).map((outing) => (
                        <div key={outing._id} className="py-2.5 flex justify-between items-center text-xs">
                          <div className="space-y-0.5">
                            <p className="font-semibold text-slate-700 dark:text-slate-300">{outing.purpose}</p>
                            <span className="text-[10px] text-slate-400">
                              Dest: {outing.destination} · Out: {new Date(outing.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className={`inline-block rounded-full px-2 py-0.5 text-[8px] font-bold uppercase ${
                              outing.status === 'Returned'
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}>
                              {outing.status}
                            </span>
                            {outing.actual_return_time && (
                              <span className="block text-[9px] text-slate-400 font-medium mt-0.5">
                                Back: {new Date(outing.actual_return_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}

                      {studentLeaves.slice(0, 3).map((leave) => (
                        <div key={leave._id} className="py-2.5 flex justify-between items-center text-xs">
                          <div className="space-y-0.5">
                            <p className="font-semibold text-slate-700 dark:text-slate-300">Leave: {leave.reason}</p>
                            <span className="text-[10px] text-slate-400">
                              Dates: {new Date(leave.start_date).toLocaleDateString()} to {new Date(leave.end_date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-right">
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
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-3xl border p-12 text-center text-slate-400">
              <Search className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-700 mb-3 animate-pulse" />
              <span className="text-sm font-semibold">Search and select a student ID to grant gatepass outings or view history logs</span>
            </div>
          )}
        </div>

        {/* Right Column: Pending Leaves & Checked Out Students (Span 5) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Action queue: Pending Leaves */}
          <div className="glass-panel rounded-3xl border overflow-hidden">
            <div className="border-b border-slate-200/60 dark:border-slate-800/60 p-4 bg-slate-500/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5 text-amber-500" />
                <h3 className="font-heading text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Leave Approval Queue
                </h3>
              </div>
              <span className="rounded-full bg-amber-500/10 text-amber-600 px-2 py-0.5 text-[10px] font-extrabold">
                {pendingLeaves.length} Pending
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/50 p-4 max-h-[350px] overflow-y-auto space-y-3">
              {loadingDashboard ? (
                <p className="text-xs text-slate-400 text-center py-6">Loading leaves queue...</p>
              ) : pendingLeaves.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No pending leaves to review</p>
              ) : (
                pendingLeaves.map((leave) => (
                  <div key={leave._id} className="rounded-xl border border-slate-200/50 dark:border-slate-800/50 p-3 bg-white dark:bg-slate-900 shadow-sm flex flex-col gap-2.5 transition-all hover:border-slate-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 overflow-hidden rounded-full bg-slate-100 flex items-center justify-center font-bold text-[9px]">
                          {leave.student.photo ? (
                            <img src={leave.student.photo} alt={leave.student.name} />
                          ) : (
                            <User className="h-3 w-3 text-slate-400" />
                          )}
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {leave.student.name}
                        </span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">
                        {leave.student.student_id}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      <p className="italic">" {leave.reason} "</p>
                      <div className="flex items-center gap-1 mt-1.5 font-bold text-slate-500 text-[10px]">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {new Date(leave.start_date).toLocaleDateString()} to {new Date(leave.end_date).toLocaleDateString()}
                        </span>
                      </div>
                      {leave.attachment_url && (
                        <a
                          href={leave.attachment_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 mt-2 text-indigo-500 font-bold text-[10px]"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>View Medical / Proof doc</span>
                        </a>
                      )}
                    </div>

                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => openLeaveActionModal(leave, 'approve')}
                        className="flex-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white py-1.5 text-[10px] font-bold shadow-sm active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => openLeaveActionModal(leave, 'reject')}
                        className="flex-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 py-1.5 text-[10px] font-bold active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1 border border-rose-500/10"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Checked Out Students panel */}
          <div className="glass-panel rounded-3xl border overflow-hidden">
            <div className="border-b border-slate-200/60 dark:border-slate-800/60 p-4 bg-slate-500/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4.5 w-4.5 text-rose-500" />
                <h3 className="font-heading text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Checked Out Board
                </h3>
              </div>
              <span className="rounded-full bg-rose-500/10 text-rose-600 px-2 py-0.5 text-[10px] font-extrabold">
                {activeOutings.filter(o => o.status === 'Exited').length} Outside
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/50 p-4 max-h-[350px] overflow-y-auto space-y-3">
              {loadingDashboard ? (
                <p className="text-xs text-slate-400 text-center py-6">Loading board...</p>
              ) : activeOutings.filter(o => o.status === 'Exited').length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No students checked out right now</p>
              ) : (
                activeOutings.filter(o => o.status === 'Exited').map((outing) => (
                  <div key={outing._id} className="rounded-xl border border-slate-200/50 dark:border-slate-800/50 p-3 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize">
                        {outing.student.name}
                      </span>
                      <span className="block text-[9px] font-bold text-slate-400 uppercase">
                        {outing.student.student_id} · Room {outing.student.room}
                      </span>
                      <span className="flex items-center gap-1 text-[9px] font-bold text-slate-500">
                        <Clock className="h-3 w-3" />
                        <span>Left: {new Date(outing.actual_exit_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>
                    </div>

                    <button
                      onClick={() => handleMarkReturn(outing._id)}
                      className="rounded-lg bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 text-[10px] font-bold shadow-sm active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>Checkin</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: GRANT OUTING FORM */}
      <Modal
        isOpen={isGrantOutingOpen}
        onClose={() => setIsGrantOutingOpen(false)}
        title={selectedStudent ? `Grant Outing Pass: ${selectedStudent.name}` : 'Grant Outing Pass'}
      >
        <form onSubmit={handleGrantOutingSubmit} className="space-y-4">
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
            {/* Purpose */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Purpose of Outing
              </label>
              <input
                type="text"
                required
                value={outingForm.purpose}
                onChange={(e) => setOutingForm({ ...outingForm, purpose: e.target.value })}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 px-3 text-xs text-slate-800 dark:text-white"
                placeholder="e.g. Buy study books, Dental clinic visit"
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
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 px-3 text-xs text-slate-800 dark:text-white"
                placeholder="e.g. City Central Market, Sector 15"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Out Time */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Out Date/Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={outingForm.out_time}
                  onChange={(e) => setOutingForm({ ...outingForm, out_time: e.target.value })}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 px-3 text-xs text-slate-800 dark:text-white"
                />
              </div>

              {/* Expected Return */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Expected Return Date/Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={outingForm.expected_return}
                  onChange={(e) => setOutingForm({ ...outingForm, expected_return: e.target.value })}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 px-3 text-xs text-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Remarks */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Remarks (Optional)
              </label>
              <textarea
                value={outingForm.remarks}
                onChange={(e) => setOutingForm({ ...outingForm, remarks: e.target.value })}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 px-3 text-xs text-slate-800 dark:text-white h-16 resize-none"
                placeholder="Parent details, verification remarks..."
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-200/50 pt-4">
            <button
              type="button"
              onClick={() => setIsGrantOutingOpen(false)}
              className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 text-xs font-bold shadow-md cursor-pointer"
            >
              {submitting ? 'Granting...' : 'Approve & Grant Outing'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: LEAVE DECISION ACTION */}
      <Modal
        isOpen={isLeaveActionOpen}
        onClose={() => setIsLeaveActionOpen(false)}
        title={selectedLeave ? `Review Leave: ${selectedLeave.student.name}` : ''}
      >
        <form onSubmit={handleLeaveActionSubmit} className="space-y-4">
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

          <div className="space-y-3 text-xs">
            <div className="bg-slate-100 dark:bg-slate-800/40 rounded-xl p-3.5">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Reason for Leave</span>
              <p className="font-semibold text-slate-700 dark:text-slate-300">"{selectedLeave?.reason}"</p>
              <div className="mt-2 text-slate-400 font-medium">
                Dates: <span className="text-slate-600 dark:text-slate-300 font-bold">{new Date(selectedLeave?.start_date).toLocaleDateString()}</span> to <span className="text-slate-600 dark:text-slate-300 font-bold">{new Date(selectedLeave?.end_date).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Decision Remarks
              </label>
              <input
                type="text"
                required
                value={leaveRemarks}
                onChange={(e) => setLeaveRemarks(e.target.value)}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3 px-4 text-xs text-slate-800 dark:text-white"
                placeholder={leaveActionType === 'approve' ? 'e.g. Approved after calling parent' : 'e.g. Rejected due to pending exams'}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-200/50 pt-4">
            <button
              type="button"
              onClick={() => setIsLeaveActionOpen(false)}
              className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`rounded-xl px-5 py-2 text-xs font-bold text-white shadow-md cursor-pointer ${
                leaveActionType === 'approve' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
              }`}
            >
              {submitting ? 'Processing...' : leaveActionType === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default CaretakerDashboard;
