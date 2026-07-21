import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import Modal from '../components/Modal';
import {
  Search,
  AlertCircle,
  FileText,
  User,
  Activity,
  Inbox,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import { useAcademicYear } from '../contexts/AcademicYearContext';

export const CaretakerDashboard: React.FC = () => {
  const { view } = useParams<{ view?: string }>();
  const navigate = useNavigate();
  const activeView = view || 'dashboard';
  const { selectedYear } = useAcademicYear();

  /* ── Dashboard / queue state ─────────────────────────────────────── */
  const [metrics, setMetrics] = useState<any>(null);
  const [activeOutings, setActiveOutings] = useState<any[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
  const [pendingOutings, setPendingOutings] = useState<any[]>([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  /* ── Student search state ────────────────────────────────────────── */
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentOutings, setStudentOutings] = useState<any[]>([]);
  const [studentLeaves, setStudentLeaves] = useState<any[]>([]);
  const [loadingStudent, setLoadingStudent] = useState(false);
  const [searchError, setSearchError] = useState('');

  /* ── Grant Outing form state ────────────────────────────────────── */
  const [grantSearchQuery, setGrantSearchQuery] = useState('');
  const [grantSuggestions, setGrantSuggestions] = useState<any[]>([]);
  const [showGrantSuggestions, setShowGrantSuggestions] = useState(false);
  const [grantSelectedStudent, setGrantSelectedStudent] = useState<any>(null);
  const [outingForm, setOutingForm] = useState({
    purpose: '',
    destination: '',
    out_time: '',
    expected_return: '',
    remarks: '',
  });

  /* ── Leave action modal state ────────────────────────────────────── */
  const [isLeaveActionOpen, setIsLeaveActionOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<any>(null);
  const [leaveActionType, setLeaveActionType] = useState<'approve' | 'reject'>('approve');
  const [leaveRemarks, setLeaveRemarks] = useState('');

  /* ── Pending Outing action modal state ───────────────────────────── */
  const [isOutingActionOpen, setIsOutingActionOpen] = useState(false);
  const [selectedPendingOuting, setSelectedPendingOuting] = useState<any>(null);
  const [outingActionType, setOutingActionType] = useState<'approve' | 'reject'>('approve');
  const [outingRemarks, setOutingRemarks] = useState('');

  /* ── Shared form state ───────────────────────────────────────────── */
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  /* ── History log states ──────────────────────────────────────────── */
  const [outingHistory, setOutingHistory] = useState<any[]>([]);
  const [leaveHistory, setLeaveHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  /* ── Reports state ───────────────────────────────────────────────── */
  const [reportType, setReportType] = useState<'outings' | 'leaves'>('outings');
  const [reportStatus, setReportStatus] = useState('');
  const [reportBranch, setReportBranch] = useState('');
  const [reportYear, setReportYear] = useState('');
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);

  /* ── Settings state ──────────────────────────────────────────────── */
  const [settingsForm, setSettingsForm] = useState({
    curfewTime: '21:00',
    maxMonthlyOutings: '6',
    autoApproveEmergency: false,
    alertWardenDelay: '30'
  });

  /* ══════════════════════════════════════════════════════════════════
     DATA FETCHING
  ══════════════════════════════════════════════════════════════════ */

  const fetchDashboardData = useCallback(async () => {
    setLoadingDashboard(true);
    try {
      const yearQuery = selectedYear !== 'All' ? `?year=${selectedYear}` : '';
      const { data } = await API.get(`/dashboard/caretaker${yearQuery}`);
      setMetrics(data.metrics);
      setActiveOutings(data.activeOutingsList ?? []);
      setPendingLeaves(data.pendingLeavesList ?? []);
      setPendingOutings(data.pendingOutingsList ?? []);
    } catch (err) {
      console.error('Failed to fetch caretaker dashboard', err);
    } finally {
      setLoadingDashboard(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Autocomplete Suggestions for Search View
  useEffect(() => {
    if (searchQuery.trim().length < 1) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const yearQuery = selectedYear !== 'All' ? `&year=${selectedYear}` : '';
        const { data } = await API.get(`/students/suggestions?q=${encodeURIComponent(searchQuery)}${yearQuery}`);
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (err) {
        console.error(err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedYear]);

  // Autocomplete Suggestions for Grant View
  useEffect(() => {
    if (grantSearchQuery.trim().length < 1) {
      setGrantSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const yearQuery = selectedYear !== 'All' ? `&year=${selectedYear}` : '';
        const { data } = await API.get(`/students/suggestions?q=${encodeURIComponent(grantSearchQuery)}${yearQuery}`);
        setGrantSuggestions(data);
        setShowGrantSuggestions(true);
      } catch (err) {
        console.error(err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [grantSearchQuery, selectedYear]);

  /* ── Load a student's full profile ──────────────────────────────── */
  const handleSelectStudent = async (mongoId: string) => {
    setLoadingStudent(true);
    setSearchError('');
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedStudent(null);
    try {
      const { data } = await API.get(`/students/${mongoId}`);
      setSelectedStudent(data.student);
      setStudentOutings(data.outings ?? []);
      setStudentLeaves(data.leaves ?? []);
    } catch (err: any) {
      setSearchError(err.response?.data?.message || 'Student not found');
    } finally {
      setLoadingStudent(false);
    }
  };

  /* ── Grant Outing pass ───────────────────────────────────────────── */
  const selectStudentForGrant = (student: any) => {
    setGrantSelectedStudent(student);
    setGrantSearchQuery('');
    setGrantSuggestions([]);
    setShowGrantSuggestions(false);
    
    const now = new Date();
    const returnTime = new Date();
    returnTime.setHours(21, 0, 0, 0); // Default curfew 9 PM
    const fmt = (d: Date) => {
      const p = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
    };
    setOutingForm({ purpose: '', destination: '', out_time: fmt(now), expected_return: fmt(returnTime), remarks: '' });
    setFormError('');
    setFormSuccess('');
  };

  const handleGrantOutingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantSelectedStudent) return;
    setFormError('');
    setFormSuccess('');
    setSubmitting(true);
    try {
      await API.post('/outings/grant', { student_id: grantSelectedStudent.student_id, ...outingForm });
      setFormSuccess('Outing granted successfully!');
      fetchDashboardData();
      setTimeout(() => {
        setGrantSelectedStudent(null);
        setFormSuccess('');
      }, 1500);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to grant outing');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Pending Outing approve/reject ───────────────────────────────── */
  const openOutingActionModal = (outing: any, type: 'approve' | 'reject') => {
    setSelectedPendingOuting(outing);
    setOutingActionType(type);
    setOutingRemarks('');
    setFormError('');
    setFormSuccess('');
    setIsOutingActionOpen(true);
  };

  const handleOutingActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setSubmitting(true);
    try {
      await API.post(`/outings/${selectedPendingOuting._id}/${outingActionType}`, { remarks: outingRemarks });
      setFormSuccess(outingActionType === 'approve' ? 'Outing approved!' : 'Outing request rejected.');
      fetchDashboardData();
      if (selectedStudent && selectedPendingOuting.student &&
          selectedStudent._id === (selectedPendingOuting.student._id ?? selectedPendingOuting.student)) {
        handleSelectStudent(selectedStudent._id);
      }
      setTimeout(() => {
        setIsOutingActionOpen(false);
        setSelectedPendingOuting(null);
      }, 1500);
    } catch (err: any) {
      setFormError(err.response?.data?.message || `Failed to ${outingActionType} outing`);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Leave Request approve/reject ────────────────────────────────── */
  const openLeaveActionModal = (leave: any, type: 'approve' | 'reject') => {
    setSelectedLeave(leave);
    setLeaveActionType(type);
    setLeaveRemarks('');
    setFormError('');
    setFormSuccess('');
    setIsLeaveActionOpen(true);
  };

  const handleLeaveActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setSubmitting(true);
    try {
      await API.post(`/leaves/${selectedLeave._id}/${leaveActionType}`, { remarks: leaveRemarks });
      setFormSuccess(`Leave ${leaveActionType === 'approve' ? 'approved' : 'rejected'} successfully!`);
      fetchDashboardData();
      if (selectedStudent && selectedLeave.student &&
          selectedStudent._id === (selectedLeave.student._id ?? selectedLeave.student)) {
        handleSelectStudent(selectedStudent._id);
      }
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

  /* ── Gate Actions ────────────────────────────────────────────────── */
  const handleMarkExit = async (outingId: string) => {
    if (!window.confirm('Mark this student as EXITED from hostel?')) return;
    try {
      await API.post(`/outings/${outingId}/exit`);
      fetchDashboardData();
      if (selectedStudent) handleSelectStudent(selectedStudent._id);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Exit operation failed');
    }
  };

  const handleMarkReturn = async (outingId: string) => {
    if (!window.confirm('Mark this student as RETURNED to hostel?')) return;
    try {
      await API.post(`/outings/${outingId}/return`);
      fetchDashboardData();
      if (selectedStudent) handleSelectStudent(selectedStudent._id);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Return operation failed');
    }
  };

  const handleCancelOuting = async (outingId: string) => {
    if (!window.confirm('Cancel this approved pass?')) return;
    try {
      await API.post(`/outings/${outingId}/cancel`);
      fetchDashboardData();
      if (selectedStudent) handleSelectStudent(selectedStudent._id);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Cancel operation failed');
    }
  };

  /* ── History loader ──────────────────────────────────────────────── */
  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const yearQuery = selectedYear !== 'All' ? `?year=${selectedYear}` : '';
      if (activeView === 'outing-history') {
        const { data } = await API.get(`/outings/history${yearQuery}`);
        setOutingHistory(data);
      } else if (activeView === 'leave-history') {
        const { data } = await API.get(`/leaves/history${yearQuery}`);
        setLeaveHistory(data);
      }
    } catch (err) {
      console.error('Failed to load history logs', err);
    } finally {
      setLoadingHistory(false);
    }
  }, [activeView, selectedYear]);

  useEffect(() => {
    if (activeView === 'outing-history' || activeView === 'leave-history') {
      loadHistory();
    }
  }, [activeView, loadHistory]);

  /* ── Reports loader ──────────────────────────────────────────────── */
  const handleLoadPreview = async () => {
    setLoadingPreview(true);
    try {
      const endpoint = reportType === 'outings' ? '/outings/history' : '/leaves/history';
      const params: any = {};
      if (reportStatus) params.status = reportStatus;
      if (reportBranch) params.branch = reportBranch;
      if (selectedYear !== 'All') params.year = selectedYear;
      else if (reportYear) params.year = reportYear;
      if (reportStartDate) params.start_date = reportStartDate;
      if (reportEndDate) params.end_date = reportEndDate;

      const { data } = await API.get(endpoint, { params });
      setPreviewData(data);
    } catch (err) {
      console.error('Failed to load report preview list', err);
      setPreviewData([]);
    } finally {
      setLoadingPreview(false);
    }
  };

  useEffect(() => {
    if (activeView === 'reports') {
      handleLoadPreview();
    }
  }, [activeView, reportType, reportStatus, reportBranch, reportYear, reportStartDate, reportEndDate, selectedYear]);

  const handleDownload = async (format: 'pdf' | 'excel') => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const endpoint = reportType === 'outings' ? '/reports/outings' : '/reports/leaves';
    const query = new URLSearchParams();
    query.append('format', format);
    if (reportStatus) query.append('status', reportStatus);
    if (reportBranch) query.append('branch', reportBranch);
    if (selectedYear !== 'All') query.append('year', selectedYear);
    else if (reportYear) query.append('year', reportYear);
    if (reportStartDate) query.append('start_date', reportStartDate);
    if (reportEndDate) query.append('end_date', reportEndDate);

    const downloadUrl = `${baseUrl}${endpoint}?${query.toString()}`;
    try {
      const token = JSON.parse(localStorage.getItem('userInfo') || '{}').token;
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('File download failed');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Error downloading report file.');
    }
  };

  /* ── Settings handler ────────────────────────────────────────────── */
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSuccess('Settings saved successfully!');
    setTimeout(() => setFormSuccess(''), 2000);
  };

  /* ══════════════════════════════════════════════════════════════════
     RENDER HELPERS & STYLES
  ══════════════════════════════════════════════════════════════════ */

  const getStatusBadge = (status: string) => {
    const classes: Record<string, string> = {
      Inside: 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20',
      Outside: 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20',
      Leave: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20',
      Pending: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20',
      Approved: 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20',
      Rejected: 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20',
      Returned: 'bg-[#4F46E5]/10 text-[#4F46E5] border-[#4F46E5]/20',
      Exited: 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20',
    };
    return (
      <span className={`inline-flex items-center rounded border px-2.5 py-0.5 text-[13px] font-semibold uppercase ${classes[status] ?? 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const fmtDate = (d?: string | Date) => d ? new Date(d).toLocaleDateString() : '—';
  const fmtDateTime = (d?: string | Date) => d ? new Date(d).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '—';

  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-6">
        <div>
          <h1 className="text-[32px] font-bold text-[#111827] capitalize">
            {activeView.replace('-', ' ')}
          </h1>
          <p className="text-[16px] text-[#6B7280]">
            Hostel caretaker administration console. Clean, fast, and structured.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className={`h-5 w-5 ${loadingDashboard ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          SUB-VIEW: DASHBOARD OVERVIEW
      ══════════════════════════════════════════════════════════════ */}
      {activeView === 'dashboard' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Students Outside', value: metrics?.studentsOutsideCount ?? 0, color: 'text-[#DC2626]' },
              { label: 'Pending Outings', value: metrics?.pendingOutingsCount ?? 0, color: 'text-[#F59E0B]' },
              { label: 'Pending Leaves', value: metrics?.pendingLeavesList?.length ?? 0, color: 'text-[#F59E0B]' },
              { label: 'Today Returned', value: metrics?.returnedStudentsCount ?? 0, color: 'text-[#16A34A]' }
            ].map((s) => (
              <div key={s.label} className="admin-card p-6 flex flex-col justify-between">
                <span className="text-[16px] font-semibold text-[#6B7280] uppercase tracking-wider">{s.label}</span>
                <span className={`text-[32px] font-bold mt-2 ${s.color}`}>{s.value}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Urgent Outing Requests Queue */}
            <div className="admin-card p-6 space-y-4">
              <h2 className="text-[22px] font-semibold text-[#111827] flex items-center gap-2">
                Pending Outing Pass Requests
              </h2>
              <div className="divide-y divide-[#E5E7EB]">
                {pendingOutings.length === 0 ? (
                  <div className="py-8 text-center text-[#6B7280] text-[16px]">
                    <Inbox className="mx-auto h-8 w-8 text-[#6B7280] mb-2" />
                    No pending outing requests.
                  </div>
                ) : (
                  pendingOutings.slice(0, 5).map((o) => (
                    <div key={o._id} className="py-4 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-[#111827] text-[16px]">{o.student?.name}</p>
                        <p className="text-mono text-[14px] text-[#6B7280]">{o.student?.student_id}</p>
                        <p className="text-[15px] text-[#111827] mt-1">{o.purpose} → {o.destination}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openOutingActionModal(o, 'approve')}
                          className="btn-primary py-2 px-4 text-[15px]"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => openOutingActionModal(o, 'reject')}
                          className="btn-secondary py-2 px-4 text-[15px] text-[#DC2626] border-[#DC2626]/20 hover:bg-[#DC2626]/5"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {pendingOutings.length > 5 && (
                <button onClick={() => navigate('/caretaker/leaves')} className="w-full text-center text-[#4F46E5] font-semibold text-[16px] hover:underline">
                  View all pending outings & leaves
                </button>
              )}
            </div>

            {/* Quick Gate / Board View */}
            <div className="admin-card p-6 space-y-4">
              <h2 className="text-[22px] font-semibold text-[#111827]">
                Outside Occupancy Board (Latest)
              </h2>
              <div className="divide-y divide-[#E5E7EB]">
                {activeOutings.filter(o => o.status === 'Exited').length === 0 ? (
                  <div className="py-8 text-center text-[#6B7280] text-[16px]">
                    <Activity className="mx-auto h-8 w-8 text-[#6B7280] mb-2" />
                    All students are inside.
                  </div>
                ) : (
                  activeOutings.filter(o => o.status === 'Exited').slice(0, 5).map((o) => (
                    <div key={o._id} className="py-4 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-[#111827] text-[16px]">{o.student?.name}</p>
                        <p className="text-mono text-[14px] text-[#6B7280]">{o.student?.student_id}</p>
                        <p className="text-[15px] text-[#6B7280] mt-0.5">Left: {new Date(o.actual_exit_time).toLocaleTimeString()}</p>
                      </div>
                      <button
                        onClick={() => handleMarkReturn(o._id)}
                        className="btn-primary bg-[#16A34A] hover:bg-[#15803D]"
                      >
                        Mark Return
                      </button>
                    </div>
                  ))
                )}
              </div>
              {activeOutings.filter(o => o.status === 'Exited').length > 5 && (
                <button onClick={() => navigate('/caretaker/outside')} className="w-full text-center text-[#4F46E5] font-semibold text-[16px] hover:underline">
                  View full Outside Occupancy board
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          SUB-VIEW: STUDENT SEARCH & PROFILE
      ══════════════════════════════════════════════════════════════ */}
      {activeView === 'search' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="admin-card p-6">
            <h2 className="text-[22px] font-semibold text-[#111827] mb-4">Search Student Database</h2>
            <div className="relative">
              <Search className="absolute top-3.5 left-4 h-5 w-5 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Search by Student ID (e.g. N220533) or Name..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => searchQuery.length >= 1 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full border border-[#E5E7EB] bg-white rounded py-3.5 pl-12 pr-4 text-[16px] text-[#111827] placeholder-[#6B7280] outline-none focus:border-[#4F46E5]"
              />

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 z-50 border border-[#E5E7EB] bg-white p-2 shadow-lg divide-y divide-[#E5E7EB]">
                  {suggestions.map((s) => (
                    <div
                      key={s._id}
                      onMouseDown={() => handleSelectStudent(s._id)}
                      className="flex items-center justify-between p-3 hover:bg-[#F8F9FC] cursor-pointer"
                    >
                      <div>
                        <span className="text-[16px] font-bold text-[#111827] block">{s.name}</span>
                        <span className="text-mono text-[13px] text-[#6B7280] uppercase">
                          {s.student_id} · {s.branch} · Room {s.room}
                        </span>
                      </div>
                      {getStatusBadge(s.status)}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {searchError && <p className="mt-3 text-[#DC2626] font-semibold">{searchError}</p>}
          </div>

          {loadingStudent ? (
            <div className="admin-card p-12 text-center text-[#6B7280]">
              <RefreshCw className="mx-auto h-8 w-8 animate-spin mb-2" />
              Loading student profile data...
            </div>
          ) : selectedStudent ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Card */}
              <div className="admin-card p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-[#F8F9FC] border border-[#E5E7EB] rounded flex items-center justify-center text-[#6B7280]">
                    <User className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-[22px] font-bold text-[#111827]">{selectedStudent.name}</h3>
                    <p className="text-mono text-[15px] text-[#6B7280]">{selectedStudent.student_id}</p>
                  </div>
                </div>

                <div className="space-y-3 border-t border-[#E5E7EB] pt-4 text-[15px]">
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Hostel Room</span>
                    <span className="font-semibold">{selectedStudent.hostel} · Room {selectedStudent.room || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Current Status</span>
                    {getStatusBadge(selectedStudent.status)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Branch & Year</span>
                    <span className="font-semibold">{selectedStudent.branch} · {selectedStudent.year} Year</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Remaining Outings</span>
                    <span className="font-semibold text-[#16A34A]">{selectedStudent.remaining_outings}</span>
                  </div>
                </div>

                {selectedStudent.status === 'Inside' && (
                  <button
                    onClick={() => {
                      selectStudentForGrant(selectedStudent);
                      navigate('/caretaker/grant');
                    }}
                    className="btn-primary w-full"
                  >
                    Grant Outing Pass
                  </button>
                )}
              </div>

              {/* Logs / Passes History */}
              <div className="admin-card p-6 lg:col-span-2 space-y-6">
                <h3 className="text-[18px] font-semibold text-[#111827]">Recent Outings & Leaves Log</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[15px]">
                    <thead>
                      <tr className="border-b border-[#E5E7EB] text-[#6B7280]">
                        <th className="py-2">Type</th>
                        <th className="py-2">Purpose / Location</th>
                        <th className="py-2">Out Time / Dates</th>
                        <th className="py-2">Status</th>
                        <th className="py-2 text-right">Quick Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {studentOutings.slice(0, 5).map((o) => (
                        <tr key={o._id}>
                          <td className="py-3 font-semibold">Outing</td>
                          <td className="py-3">
                            <span className="block font-bold">{o.purpose}</span>
                            <span className="text-[13px] text-[#6B7280]">{o.destination}</span>
                          </td>
                          <td className="py-3">{fmtDateTime(o.createdAt)}</td>
                          <td className="py-3">{getStatusBadge(o.status)}</td>
                          <td className="py-3 text-right">
                            <div className="flex gap-2 justify-end">
                              {o.status === 'Approved' && (
                                <>
                                  <button onClick={() => handleMarkExit(o._id)} className="btn-primary py-1 px-2.5 text-[13px] bg-[#16A34A] hover:bg-[#15803D]">Exit</button>
                                  <button onClick={() => handleCancelOuting(o._id)} className="btn-secondary py-1 px-2.5 text-[13px] text-[#DC2626]">Cancel</button>
                                </>
                              )}
                              {o.status === 'Exited' && (
                                <button onClick={() => handleMarkReturn(o._id)} className="btn-primary py-1 px-2.5 text-[13px] bg-[#4F46E5] hover:bg-[#4338CA]">Return</button>
                              )}
                              {!['Approved', 'Exited'].includes(o.status) && <span className="text-[#6B7280] text-[13px]">—</span>}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {studentLeaves.slice(0, 5).map((lv) => (
                        <tr key={lv._id}>
                          <td className="py-3 font-semibold">Leave</td>
                          <td className="py-3">{lv.reason}</td>
                          <td className="py-3">{fmtDate(lv.start_date)} → {fmtDate(lv.end_date)}</td>
                          <td className="py-3">{getStatusBadge(lv.status)}</td>
                          <td className="py-3 text-right">—</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="admin-card p-12 text-center text-[#6B7280]">
              Please search and select a student to load details.
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          SUB-VIEW: GRANT OUTING
      ══════════════════════════════════════════════════════════════ */}
      {activeView === 'grant' && (
        <div className="space-y-6 animate-fadeIn max-w-2xl mx-auto">
          <div className="admin-card p-6">
            <h2 className="text-[22px] font-semibold text-[#111827] mb-4">Grant Outing Pass</h2>
            
            {!grantSelectedStudent ? (
              <div className="space-y-4">
                <label className="block text-[15px] font-semibold text-[#6B7280]">Search student to grant pass</label>
                <div className="relative">
                  <Search className="absolute top-3.5 left-4 h-5 w-5 text-[#6B7280]" />
                  <input
                    type="text"
                    placeholder="Search by ID or Name..."
                    value={grantSearchQuery}
                    onChange={(e) => { setGrantSearchQuery(e.target.value); setShowGrantSuggestions(true); }}
                    className="w-full border border-[#E5E7EB] bg-white rounded py-3.5 pl-12 pr-4 text-[16px]"
                  />
                  {showGrantSuggestions && grantSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 mt-2 z-50 border border-[#E5E7EB] bg-white p-2 shadow-lg divide-y divide-[#E5E7EB]">
                      {grantSuggestions.map((s) => (
                        <div
                          key={s._id}
                          onMouseDown={() => selectStudentForGrant(s)}
                          className="p-3 hover:bg-[#F8F9FC] cursor-pointer flex justify-between items-center"
                        >
                          <div>
                            <span className="text-[16px] font-bold block">{s.name}</span>
                            <span className="text-mono text-[13px] text-[#6B7280]">{s.student_id} · Room {s.room}</span>
                          </div>
                          {getStatusBadge(s.status)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleGrantOutingSubmit} className="space-y-5">
                <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
                  <div>
                    <span className="text-[15px] text-[#6B7280]">Granting pass to:</span>
                    <p className="text-[18px] font-bold text-[#111827]">{grantSelectedStudent.name}</p>
                    <p className="text-mono text-[14px] text-[#6B7280]">{grantSelectedStudent.student_id}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGrantSelectedStudent(null)}
                    className="text-[15px] text-[#DC2626] font-semibold hover:underline"
                  >
                    Change Student
                  </button>
                </div>

                {formError && (
                  <div className="flex items-center gap-2 p-3 bg-[#DC2626]/10 border border-[#DC2626]/20 text-[#DC2626] text-[15px]">
                    <AlertCircle className="h-5 w-5" />
                    <span>{formError}</span>
                  </div>
                )}
                {formSuccess && (
                  <div className="p-3 bg-[#16A34A]/10 border border-[#16A34A]/20 text-[#16A34A] text-[15px] font-semibold">
                    {formSuccess}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[15px] font-semibold text-[#111827]">Purpose of Outing</label>
                    <input
                      type="text"
                      required
                      value={outingForm.purpose}
                      onChange={e => setOutingForm({ ...outingForm, purpose: e.target.value })}
                      className="border border-[#E5E7EB] rounded p-2.5 text-[16px]"
                      placeholder="e.g. Hospital visit, shopping"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[15px] font-semibold text-[#111827]">Destination</label>
                    <input
                      type="text"
                      required
                      value={outingForm.destination}
                      onChange={e => setOutingForm({ ...outingForm, destination: e.target.value })}
                      className="border border-[#E5E7EB] rounded p-2.5 text-[16px]"
                      placeholder="e.g. Sector 12 Market"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[15px] font-semibold text-[#111827]">Out Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={outingForm.out_time}
                      onChange={e => setOutingForm({ ...outingForm, out_time: e.target.value })}
                      className="border border-[#E5E7EB] rounded p-2.5 text-[16px]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[15px] font-semibold text-[#111827]">Return By</label>
                    <input
                      type="datetime-local"
                      required
                      value={outingForm.expected_return}
                      onChange={e => setOutingForm({ ...outingForm, expected_return: e.target.value })}
                      className="border border-[#E5E7EB] rounded p-2.5 text-[16px]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[15px] font-semibold text-[#111827]">Remarks (Optional)</label>
                  <textarea
                    value={outingForm.remarks}
                    onChange={e => setOutingForm({ ...outingForm, remarks: e.target.value })}
                    className="border border-[#E5E7EB] rounded p-2.5 text-[16px] h-20 resize-none"
                    placeholder="Enter parent verification notes if any..."
                  />
                </div>

                <div className="flex justify-end gap-4 border-t border-[#E5E7EB] pt-4">
                  <button
                    type="button"
                    onClick={() => setGrantSelectedStudent(null)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn-primary">
                    {submitting ? 'Issuing...' : 'Grant & Issue Pass'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          SUB-VIEW: LEAVE REQUESTS
      ══════════════════════════════════════════════════════════════ */}
      {activeView === 'leaves' && (
        <div className="admin-card p-6 animate-fadeIn">
          <h2 className="text-[22px] font-semibold text-[#111827] mb-6">Leave Requests Queue</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[15px]">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-[#6B7280]">
                  <th className="py-3">Student</th>
                  <th className="py-3">Reason</th>
                  <th className="py-3">Start Date</th>
                  <th className="py-3">End Date</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {pendingLeaves.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#6B7280]">
                      No pending overnight leave requests.
                    </td>
                  </tr>
                ) : (
                  pendingLeaves.map((lv) => (
                    <tr key={lv._id}>
                      <td className="py-4">
                        <span className="block font-bold text-[#111827]">{lv.student?.name}</span>
                        <span className="text-mono text-[13px] text-[#6B7280]">{lv.student?.student_id}</span>
                      </td>
                      <td className="py-4 italic">"{lv.reason}"</td>
                      <td className="py-4">{fmtDate(lv.start_date)}</td>
                      <td className="py-4">{fmtDate(lv.end_date)}</td>
                      <td className="py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => openLeaveActionModal(lv, 'approve')}
                            className="btn-primary py-1.5 px-3 text-[14px]"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => openLeaveActionModal(lv, 'reject')}
                            className="btn-secondary text-[#DC2626] border-[#DC2626]/20 py-1.5 px-3 text-[14px] hover:bg-[#DC2626]/5"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          SUB-VIEW: STUDENTS OUTSIDE
      ══════════════════════════════════════════════════════════════ */}
      {activeView === 'outside' && (
        <div className="admin-card p-6 animate-fadeIn">
          <h2 className="text-[22px] font-semibold text-[#111827] mb-6">Outside Occupancy Board</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[15px]">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-[#6B7280]">
                  <th className="py-3">Student</th>
                  <th className="py-3">Hostel Details</th>
                  <th className="py-3">Purpose</th>
                  <th className="py-3">Exit Time</th>
                  <th className="py-3">Expected Return</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {activeOutings.filter(o => o.status === 'Exited').length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#6B7280]">
                      No students are currently outside the campus.
                    </td>
                  </tr>
                ) : (
                  activeOutings.filter(o => o.status === 'Exited').map((o) => (
                    <tr key={o._id}>
                      <td className="py-4">
                        <span className="block font-bold text-[#111827]">{o.student?.name}</span>
                        <span className="text-mono text-[13px] text-[#6B7280]">{o.student?.student_id}</span>
                      </td>
                      <td className="py-4">{o.student?.hostel} · Rm {o.student?.room}</td>
                      <td className="py-4">{o.purpose} → {o.destination}</td>
                      <td className="py-4">{fmtDateTime(o.actual_exit_time)}</td>
                      <td className="py-4 font-semibold text-[#DC2626]">{fmtDateTime(o.expected_return)}</td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => handleMarkReturn(o._id)}
                          className="btn-primary bg-[#16A34A] hover:bg-[#15803D]"
                        >
                          Mark Returned
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          SUB-VIEWS: OUTING HISTORY / LEAVE HISTORY
      ══════════════════════════════════════════════════════════════ */}
      {(activeView === 'outing-history' || activeView === 'leave-history') && (
        <div className="admin-card p-6 animate-fadeIn">
          <h2 className="text-[22px] font-semibold text-[#111827] mb-6 capitalize">
            {activeView.replace('-', ' ')}
          </h2>
          
          {loadingHistory ? (
            <div className="py-12 text-center text-[#6B7280]">
              <RefreshCw className="mx-auto h-8 w-8 animate-spin mb-2" />
              Loading history archives...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[15px]">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-[#6B7280]">
                    <th className="py-3">Student ID</th>
                    <th className="py-3">Name</th>
                    <th className="py-3">Location / Detail</th>
                    <th className="py-3">Dates / Times</th>
                    <th className="py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {activeView === 'outing-history' ? (
                    outingHistory.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-[#6B7280]">No history logs found.</td>
                      </tr>
                    ) : (
                      outingHistory.map((o) => (
                        <tr key={o._id}>
                          <td className="py-4 text-mono font-semibold">{o.student?.student_id || '—'}</td>
                          <td className="py-4 font-bold">{o.student?.name || '—'}</td>
                          <td className="py-4">
                            <span className="block font-semibold">{o.purpose}</span>
                            <span className="text-[13px] text-[#6B7280]">{o.destination}</span>
                          </td>
                          <td className="py-4 text-[13px]">
                            Out: {fmtDateTime(o.actual_exit_time || o.createdAt)}<br />
                            In: {fmtDateTime(o.actual_return_time)}
                          </td>
                          <td className="py-4 text-right">{getStatusBadge(o.status)}</td>
                        </tr>
                      ))
                    )
                  ) : (
                    leaveHistory.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-[#6B7280]">No history logs found.</td>
                      </tr>
                    ) : (
                      leaveHistory.map((lv) => (
                        <tr key={lv._id}>
                          <td className="py-4 text-mono font-semibold">{lv.student?.student_id || '—'}</td>
                          <td className="py-4 font-bold">{lv.student?.name || '—'}</td>
                          <td className="py-4 italic">"{lv.reason}"</td>
                          <td className="py-4">{fmtDate(lv.start_date)} → {fmtDate(lv.end_date)}</td>
                          <td className="py-4 text-right">{getStatusBadge(lv.status)}</td>
                        </tr>
                      ))
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          SUB-VIEW: REPORTS GENERATION
      ══════════════════════════════════════════════════════════════ */}
      {activeView === 'reports' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
          {/* Filters Form */}
          <div className="admin-card p-6 space-y-5">
            <h3 className="text-[18px] font-semibold text-[#111827]">Report Filter Controls</h3>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[15px] text-[#6B7280]">Data Subject</label>
              <select
                value={reportType}
                onChange={e => setReportType(e.target.value as 'outings' | 'leaves')}
                className="border border-[#E5E7EB] bg-white rounded p-2 text-[15px]"
              >
                <option value="outings">Outing Passes Logs</option>
                <option value="leaves">Leave Requests Logs</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[15px] text-[#6B7280]">Status</label>
              <select
                value={reportStatus}
                onChange={e => setReportStatus(e.target.value)}
                className="border border-[#E5E7EB] bg-white rounded p-2 text-[15px]"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved / Exited</option>
                <option value="Returned">Returned</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[15px] text-[#6B7280]">Branch</label>
                <input
                  type="text"
                  placeholder="e.g. CSE"
                  value={reportBranch}
                  onChange={e => setReportBranch(e.target.value)}
                  className="border border-[#E5E7EB] bg-white rounded p-2 text-[15px]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[15px] text-[#6B7280]">Year</label>
                <input
                  type="text"
                  placeholder="e.g. 3"
                  value={reportYear}
                  onChange={e => setReportYear(e.target.value)}
                  className="border border-[#E5E7EB] bg-white rounded p-2 text-[15px]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[15px] text-[#6B7280]">From Date</label>
              <input
                type="date"
                value={reportStartDate}
                onChange={e => setReportStartDate(e.target.value)}
                className="border border-[#E5E7EB] bg-white rounded p-2 text-[15px]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[15px] text-[#6B7280]">To Date</label>
              <input
                type="date"
                value={reportEndDate}
                onChange={e => setReportEndDate(e.target.value)}
                className="border border-[#E5E7EB] bg-white rounded p-2 text-[15px]"
              />
            </div>

            <div className="flex gap-3 border-t border-[#E5E7EB] pt-4">
              <button
                onClick={() => handleDownload('pdf')}
                className="flex-1 btn-secondary text-[15px] flex items-center justify-center gap-1.5"
              >
                <FileText className="h-4 w-4" /> Download PDF
              </button>
              <button
                onClick={() => handleDownload('excel')}
                className="flex-1 btn-primary text-[15px] flex items-center justify-center gap-1.5"
              >
                <FileSpreadsheet className="h-4 w-4" /> Export Excel
              </button>
            </div>
          </div>

          {/* Table Preview */}
          <div className="admin-card p-6 lg:col-span-2 space-y-4">
            <h3 className="text-[18px] font-semibold text-[#111827]">Live Report Preview</h3>
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-[15px]">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-[#6B7280]">
                    <th className="py-2">Student</th>
                    <th className="py-2">Details</th>
                    <th className="py-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {loadingPreview ? (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-[#6B7280]">Loading preview...</td>
                    </tr>
                  ) : previewData.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-[#6B7280]">No records match the current filters.</td>
                    </tr>
                  ) : (
                    previewData.slice(0, 15).map((row) => (
                      <tr key={row._id}>
                        <td className="py-3">
                          <span className="block font-bold text-[#111827]">{row.student?.name || '—'}</span>
                          <span className="text-mono text-[13px] text-[#6B7280]">{row.student?.student_id || '—'}</span>
                        </td>
                        <td className="py-3 text-[14px]">
                          {reportType === 'outings' ? (
                            <span>{row.purpose} → {row.destination}</span>
                          ) : (
                            <span>Leave: {row.reason} ({fmtDate(row.start_date)} → {fmtDate(row.end_date)})</span>
                          )}
                        </td>
                        <td className="py-3 text-right">{getStatusBadge(row.status)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          SUB-VIEW: SETTINGS
      ══════════════════════════════════════════════════════════════ */}
      {activeView === 'settings' && (
        <div className="admin-card p-6 animate-fadeIn max-w-2xl mx-auto space-y-6">
          <h2 className="text-[22px] font-semibold text-[#111827]">Hostel Administration Settings</h2>
          
          {formSuccess && (
            <div className="p-3 bg-[#16A34A]/10 border border-[#16A34A]/20 text-[#16A34A] text-[15px] font-semibold">
              {formSuccess}
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-5 text-[15px]">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-[#111827]">Curfew Cutoff Time (HH:MM)</label>
              <input
                type="time"
                value={settingsForm.curfewTime}
                onChange={e => setSettingsForm({ ...settingsForm, curfewTime: e.target.value })}
                className="border border-[#E5E7EB] rounded p-2.5 text-[16px]"
              />
              <span className="text-[13px] text-[#6B7280]">Outing returns marked after this time will flag late status alerts.</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-[#111827]">Max Allowed Outing Passes Per Student (Monthly)</label>
              <input
                type="number"
                value={settingsForm.maxMonthlyOutings}
                onChange={e => setSettingsForm({ ...settingsForm, maxMonthlyOutings: e.target.value })}
                className="border border-[#E5E7EB] rounded p-2.5 text-[16px]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-[#111827]">Late Status Warden Alert Delay (Minutes)</label>
              <input
                type="number"
                value={settingsForm.alertWardenDelay}
                onChange={e => setSettingsForm({ ...settingsForm, alertWardenDelay: e.target.value })}
                className="border border-[#E5E7EB] rounded p-2.5 text-[16px]"
              />
              <span className="text-[13px] text-[#6B7280]">Minutes after curfew/expected time to trigger auto sms/push alert.</span>
            </div>

            <div className="flex items-center gap-3 py-2">
              <input
                type="checkbox"
                id="autoEmergency"
                checked={settingsForm.autoApproveEmergency}
                onChange={e => setSettingsForm({ ...settingsForm, autoApproveEmergency: e.target.checked })}
                className="h-5 w-5 rounded border-[#E5E7EB]"
              />
              <label htmlFor="autoEmergency" className="font-semibold text-[#111827]">
                Auto-approve Emergency Outing Passes (Medical tags)
              </label>
            </div>

            <div className="border-t border-[#E5E7EB] pt-5 flex justify-end">
              <button type="submit" className="btn-primary">
                Save System Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODALS: ACTIONS
      ══════════════════════════════════════════════════════════════ */}
      
      {/* Pending Outing Approve/Reject Modal */}
      <Modal
        isOpen={isOutingActionOpen}
        onClose={() => { setIsOutingActionOpen(false); setSelectedPendingOuting(null); }}
        title={selectedPendingOuting ? `Approve / Reject Outing: ${selectedPendingOuting.student?.name}` : ''}
      >
        {selectedPendingOuting && (
          <form onSubmit={handleOutingActionSubmit} className="space-y-4">
            {formError && <div className="p-3 bg-[#DC2626]/10 text-[#DC2626] text-[15px]">{formError}</div>}
            {formSuccess && <div className="p-3 bg-[#16A34A]/10 text-[#16A34A] text-[15px] font-semibold">{formSuccess}</div>}

            <div className="bg-[#F8F9FC] border border-[#E5E7EB] rounded p-4 text-[15px] space-y-1">
              <p className="font-bold text-[#111827]">{selectedPendingOuting.purpose}</p>
              <p className="text-[#6B7280]">{selectedPendingOuting.destination}</p>
              <p className="text-[13px] text-[#6B7280] pt-1">Applied: {fmtDateTime(selectedPendingOuting.createdAt)}</p>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[15px] font-semibold text-[#111827]">
                {outingActionType === 'approve' ? 'Approval Remarks (Optional)' : 'Rejection Reason (Required)'}
              </label>
              <input
                type="text"
                required={outingActionType === 'reject'}
                value={outingRemarks}
                onChange={e => setOutingRemarks(e.target.value)}
                className="border border-[#E5E7EB] rounded p-2.5 text-[15px]"
                placeholder={outingActionType === 'approve' ? 'e.g. Approved' : 'e.g. Exam tomorrow'}
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-[#E5E7EB] pt-4">
              <button type="button" onClick={() => setIsOutingActionOpen(false)} className="btn-secondary">Cancel</button>
              <button
                type="submit"
                disabled={submitting}
                className={`btn-primary ${outingActionType === 'reject' ? 'bg-[#DC2626] hover:bg-[#B91C1C]' : ''}`}
              >
                {submitting ? 'Processing...' : outingActionType === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Leave Approve/Reject Modal */}
      <Modal
        isOpen={isLeaveActionOpen}
        onClose={() => { setIsLeaveActionOpen(false); setSelectedLeave(null); }}
        title={selectedLeave ? `Approve / Reject Leave: ${selectedLeave.student?.name}` : ''}
      >
        {selectedLeave && (
          <form onSubmit={handleLeaveActionSubmit} className="space-y-4">
            {formError && <div className="p-3 bg-[#DC2626]/10 text-[#DC2626] text-[15px]">{formError}</div>}
            {formSuccess && <div className="p-3 bg-[#16A34A]/10 text-[#16A34A] text-[15px] font-semibold">{formSuccess}</div>}

            <div className="bg-[#F8F9FC] border border-[#E5E7EB] rounded p-4 text-[15px] space-y-1">
              <p className="italic text-[#111827]">"{selectedLeave.reason}"</p>
              <p className="text-[13px] text-[#6B7280] pt-1">Dates: {fmtDate(selectedLeave.start_date)} to {fmtDate(selectedLeave.end_date)}</p>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[15px] font-semibold text-[#111827]">Decision Remarks</label>
              <input
                type="text"
                required
                value={leaveRemarks}
                onChange={e => setLeaveRemarks(e.target.value)}
                className="border border-[#E5E7EB] rounded p-2.5 text-[15px]"
                placeholder="Remarks notes for history logs..."
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-[#E5E7EB] pt-4">
              <button type="button" onClick={() => setIsLeaveActionOpen(false)} className="btn-secondary">Cancel</button>
              <button
                type="submit"
                disabled={submitting}
                className={`btn-primary ${leaveActionType === 'reject' ? 'bg-[#DC2626] hover:bg-[#B91C1C]' : ''}`}
              >
                {submitting ? 'Processing...' : leaveActionType === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default CaretakerDashboard;
