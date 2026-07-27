import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import MetricCard from '../../components/MetricCard';
import { Users, DoorOpen, AlertCircle, RefreshCw, Search, Check, X, Eye } from 'lucide-react';
import { AlertDialog } from '../../components/ui/AlertDialog';
import { RequestDrawer } from '../../components/caretaker/RequestDrawer';
import { RejectionDialog } from '../../components/caretaker/RejectionDialog';

export const AdminStudentManagement: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [activeTab, setActiveTab] = useState<'normal' | 'emergency'>('normal');
  const [outings, setOutings] = useState<any[]>([]);
  const [loadingOutings, setLoadingOutings] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [selectedOutingId, setSelectedOutingId] = useState<string | null>(null);
  
  // Rejection dialog state
  const [rejectionDialogData, setRejectionDialogData] = useState<{id: string, name: string} | null>(null);
  const [isRejectionOpen, setIsRejectionOpen] = useState<boolean>(false);
  
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Alert dialog state
  const [alertConfig, setAlertConfig] = useState<{isOpen: boolean, type: 'success' | 'error' | 'info', title: string, message: string}>({
    isOpen: false, type: 'info', title: '', message: ''
  });

  const showAlert = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setAlertConfig({ isOpen: true, type, title, message });
  };

  const fetchData = async () => {
    setLoadingStats(true);
    setLoadingOutings(true);
    try {
      const [statsRes, pendingRes] = await Promise.all([
        API.get('/dashboard/admin/student-management'),
        API.get('/outings/pending') // Only fetch pending requests as per requirement
      ]);
      
      setMetrics(statsRes.data.metrics);
      
      const sortedPending = pendingRes.data.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOutings(sortedPending);
    } catch (err) {
      console.error('Failed to load student management data', err);
    } finally {
      setLoadingStats(false);
      setLoadingOutings(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDrawer = (outingId: string) => {
    setSelectedOutingId(outingId);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedOutingId(null);
  };

  const handleDirectApprove = async (req: any) => {
    setActionLoading(true);
    try {
      await API.put(`/caretaker/outings/${req.id}/approve`);
      setIsDrawerOpen(false);
      fetchData();
      showAlert('success', 'Approved', 'Outing approved successfully');
    } catch (err: any) {
      console.error(`Failed to approve outing`, err);
      showAlert('error', 'Approval Failed', err.response?.data?.message || `Failed to approve outing`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!rejectionDialogData) return;
    setActionLoading(true);
    try {
      await API.put(`/caretaker/outings/${rejectionDialogData.id}/reject`, { reason });
      setIsRejectionOpen(false);
      setRejectionDialogData(null);
      setIsDrawerOpen(false);
      fetchData();
      showAlert('success', 'Rejected', 'Outing rejected successfully');
    } catch (err: any) {
      console.error(`Failed to reject outing`, err);
      showAlert('error', 'Rejection Failed', err.response?.data?.message || `Failed to reject outing`);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredOutings = outings.filter(o => 
    o.status === 'Pending' && // Strict filter for Pending only
    (activeTab === 'normal' ? (o.outingType || 'Normal') === 'Normal' : o.outingType === 'Emergency') &&
    ((o.student_name || o.student?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
     (o.student?.studentId || '').toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-fade-in relative max-w-6xl mx-auto">
      <AlertDialog 
        isOpen={alertConfig.isOpen}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
      />
      {/* =========================================================================
          DESKTOP VIEW (Original Web Layout)
         ========================================================================= */}
      <div className="hidden md:block space-y-8">
        <div className="section-header">
          <div>
            <h1 className="text-title-large">Student Management</h1>
          </div>
          <button onClick={fetchData} className="btn-secondary">
            <RefreshCw size={18} strokeWidth={1.75} />
            <span>Refresh</span>
          </button>
        </div>

        {loadingStats ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 animate-pulse">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />)}
          </div>
        ) : metrics && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <MetricCard title="Total Students" value={metrics.totalStudents} icon={<Users className="h-5 w-5" />} color="indigo" />
            <MetricCard title="Inside Campus" value={metrics.studentsInside} icon={<DoorOpen className="h-5 w-5" />} color="emerald" />
            <MetricCard title="Outside Campus" value={metrics.studentsOutside} icon={<DoorOpen className="h-5 w-5" />} color="rose" />
            <MetricCard title="Pending Requests" value={metrics.pendingOutingsCount} icon={<AlertCircle className="h-5 w-5" />} color="amber" />
          </div>
        )}

        {/* Tabs with permanent background colors */}
        <div className="flex gap-6 mb-6">
          <button 
            onClick={() => setActiveTab('normal')}
            className={`flex-1 p-5 rounded-2xl text-left transition-all relative overflow-hidden shadow-sm hover:shadow-md ${
              activeTab === 'normal' 
              ? 'ring-2 ring-indigo-500 ring-offset-2' 
              : 'hover:-translate-y-1'
            }`}
          >
            {/* Permanent background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-blue-100 opacity-100 z-0"></div>
            <div className="relative z-10">
              <div className="font-bold text-xl text-indigo-900 mb-1">Normal Outings</div>
              <div className="text-sm font-medium text-indigo-700">Standard passes for regular days</div>
            </div>
          </button>

          <button 
            onClick={() => setActiveTab('emergency')}
            className={`flex-1 p-5 rounded-2xl text-left transition-all relative overflow-hidden shadow-sm hover:shadow-md ${
              activeTab === 'emergency' 
              ? 'ring-2 ring-rose-500 ring-offset-2' 
              : 'hover:-translate-y-1'
            }`}
          >
            {/* Permanent background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50 to-red-100 opacity-100 z-0"></div>
            <div className="relative z-10">
              <div className="font-bold text-xl text-rose-900 mb-1">Emergency Outings</div>
              <div className="text-sm font-medium text-rose-700">Urgent or special case passes</div>
            </div>
          </button>
        </div>

        <div className="admin-card-flat !p-0 overflow-hidden shadow-sm border border-[var(--color-border-gray)]">
          <div className="p-5 border-b border-[var(--color-border-gray)] flex items-center justify-between bg-white">
            <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Pending {activeTab === 'normal' ? 'Normal' : 'Emergency'} Requests</h2>
            <div className="relative w-72">
              <Search className="absolute top-2.5 left-3 text-[var(--color-text-muted)]" size={16} />
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input text-sm pl-9 py-2 w-full rounded-lg bg-[var(--color-bg-main)] border border-[var(--color-border-gray)] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto bg-white">
            {loadingOutings ? (
               <div className="p-8 text-center text-[var(--color-text-muted)]">Loading requests...</div>
            ) : filteredOutings.length === 0 ? (
              <div className="empty-state">
                <span className="empty-state-text">No pending {activeTab} outing requests.</span>
                <span className="empty-state-subtext">You're all caught up!</span>
              </div>
            ) : (
              <table className="table-enterprise">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Student Name</th>
                    <th>Destination & Purpose</th>
                    <th>Requested Time</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOutings.map(req => (
                    <tr key={req._id}>
                      <td>
                        <span className="td-id text-base font-bold text-[var(--color-primary)]">
                          {req.student?.studentId ? req.student.studentId.toUpperCase() : 'N/A'}
                        </span>
                      </td>
                      <td>
                        <div className="flex flex-col">
                          <span className="td-name font-semibold">{req.student_name}</span>
                          <span className="td-time">{req.class_name} | {req.hostel_room}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col">
                          <span className="td-name">{req.destination}</span>
                          <span className="td-time">{req.purpose}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col gap-1 items-start">
                          <span className="td-time">{req.leaving_time} - {req.reporting_time}</span>
                          <span className="badge badge-pending">Pending</span>
                        </div>
                      </td>
                       <td className="text-right">
                          <div className="flex items-center justify-end gap-2">
                           <button onClick={() => handleDirectApprove({ id: req._id })} className="p-2.5 text-white bg-green-500 hover:bg-green-600 rounded-lg transition-all shadow-sm cursor-pointer" title="Approve"><Check size={18} /></button>
                           <button onClick={() => { setRejectionDialogData({ id: req._id, name: req.student?.name || req.student_name }); setIsRejectionOpen(true); }} className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all shadow-sm cursor-pointer" title="Reject"><X size={18} /></button>
                           <button onClick={() => handleOpenDrawer(req._id)} className="p-2.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all shadow-sm cursor-pointer" title="View Details"><Eye size={18} /></button>
                          </div>
                       </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          MOBILE VIEW (Mockup Layout)
         ========================================================================= */}
      <div className="block md:hidden space-y-4">
        {/* Subheader Header & Refresh */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <h1 className="font-['Lexend'] text-[20px] font-bold text-[#1E293B] tracking-[-0.3px] m-0">Student Mgmt</h1>
            <p className="text-[11.5px] text-[#6B7280] font-medium m-0">Overview of students & outings</p>
          </div>
          <button 
            onClick={fetchData} 
            className="flex items-center gap-1.5 text-[11px] font-semibold text-[#7C2030] bg-white border border-[#E6E8EC] px-3 py-1.5 rounded-lg hover:bg-[#F9FAFB] transition-colors"
          >
            <RefreshCw size={13} strokeWidth={2} />
            <span>Refresh</span>
          </button>
        </div>

      {/* Horizontal Scrollable Stat Cards (Matches Mockup .stat-scroll) */}
      {loadingStats ? (
        <div className="flex gap-2.5 overflow-x-auto pb-3 mb-2 animate-pulse">
          {[1, 2, 3, 4].map(i => <div key={i} className="flex-none min-w-[118px] h-[80px] bg-slate-200 rounded-2xl" />)}
        </div>
      ) : metrics && (
        <div className="flex gap-2.5 overflow-x-auto pb-3 mb-2 no-scrollbar">
          {/* Total */}
          <div className="flex-none min-w-[118px] bg-white border border-[#E6E8EC] rounded-[14px] p-3">
            <div className="w-7 h-7 rounded-[9px] bg-[#F1E9FB] text-[#7A3FC4] flex items-center justify-center mb-2">
              <Users size={15} strokeWidth={2} />
            </div>
            <div className="text-[9.5px] font-semibold uppercase tracking-[0.5px] text-[#6B7280]">Total</div>
            <div className="font-['Lexend'] text-[20px] font-bold text-[#1E293B] mt-0.5 tracking-[-0.3px]">{metrics.totalStudents}</div>
          </div>
          {/* Inside */}
          <div className="flex-none min-w-[118px] bg-white border border-[#E6E8EC] rounded-[14px] p-3">
            <div className="w-7 h-7 rounded-[9px] bg-[#E7F6EC] text-[#1E8A4C] flex items-center justify-center mb-2">
              <DoorOpen size={15} strokeWidth={2} />
            </div>
            <div className="text-[9.5px] font-semibold uppercase tracking-[0.5px] text-[#6B7280]">Inside</div>
            <div className="font-['Lexend'] text-[20px] font-bold text-[#1E293B] mt-0.5 tracking-[-0.3px]">{metrics.studentsInside}</div>
          </div>
          {/* Outside */}
          <div className="flex-none min-w-[118px] bg-white border border-[#E6E8EC] rounded-[14px] p-3">
            <div className="w-7 h-7 rounded-[9px] bg-[#FCE9EA] text-[#C23B3B] flex items-center justify-center mb-2">
              <DoorOpen size={15} strokeWidth={2} />
            </div>
            <div className="text-[9.5px] font-semibold uppercase tracking-[0.5px] text-[#6B7280]">Outside</div>
            <div className="font-['Lexend'] text-[20px] font-bold text-[#1E293B] mt-0.5 tracking-[-0.3px]">{metrics.studentsOutside}</div>
          </div>
          {/* Pending */}
          <div className="flex-none min-w-[118px] bg-white border border-[#E6E8EC] rounded-[14px] p-3">
            <div className="w-7 h-7 rounded-[9px] bg-[#FDF3E3] text-[#B4790C] flex items-center justify-center mb-2">
              <AlertCircle size={15} strokeWidth={2} />
            </div>
            <div className="text-[9.5px] font-semibold uppercase tracking-[0.5px] text-[#6B7280]">Pending</div>
            <div className="font-['Lexend'] text-[20px] font-bold text-[#1E293B] mt-0.5 tracking-[-0.3px]">{metrics.pendingOutingsCount}</div>
          </div>
        </div>
      )}

      {/* Category Tiles (Matches Mockup .tile-row) */}
      <div className="flex flex-col gap-2.5 mb-4 sm:flex-row">
        <div 
          onClick={() => setActiveTab('normal')}
          className={`flex-1 rounded-[14px] p-3.5 flex flex-col gap-0.5 cursor-pointer transition-all ${
            activeTab === 'normal'
            ? 'bg-gradient-to-br from-[#EEF3FE] to-[#E3ECFE] border border-[#2A4FCB] shadow-sm'
            : 'bg-gradient-to-br from-[#EEF3FE] to-[#E3ECFE] border border-[#D7E2FB] opacity-80 hover:opacity-100'
          }`}
        >
          <div className="font-['Lexend'] text-[14px] font-bold text-[#2A4FCB] tracking-[-0.1px]">Normal Outings</div>
          <div className="text-[10.5px] text-[#6B7280]">Standard passes for regular days</div>
        </div>

        <div 
          onClick={() => setActiveTab('emergency')}
          className={`flex-1 rounded-[14px] p-3.5 flex flex-col gap-0.5 cursor-pointer transition-all ${
            activeTab === 'emergency'
            ? 'bg-gradient-to-br from-[#FDEFEF] to-[#FCE7E8] border border-[#B5303F] shadow-sm'
            : 'bg-gradient-to-br from-[#FDEFEF] to-[#FCE7E8] border border-[#F7D6D8] opacity-80 hover:opacity-100'
          }`}
        >
          <div className="font-['Lexend'] text-[14px] font-bold text-[#B5303F] tracking-[-0.1px]">Emergency Outings</div>
          <div className="text-[10.5px] text-[#6B7280]">Urgent or special case passes</div>
        </div>
      </div>

      {/* Section Card (Matches Mockup .section-card) */}
      <div className="bg-white border border-[#E6E8EC] rounded-[16px] p-3.5 sm:p-5 shadow-xs mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-['Lexend'] text-[14.5px] font-bold text-[#1E293B] tracking-[-0.1px] m-0">
            Pending {activeTab === 'normal' ? 'Normal' : 'Emergency'} Requests
          </h2>
        </div>

        {/* Search Pill (Matches Mockup .search-pill) */}
        <div className="flex items-center gap-1.5 bg-[#F4F5F7] border border-[#E6E8EC] rounded-[9px] px-2.5 py-1.5 mb-3 text-[11px] text-[#6B7280]">
          <Search size={13} className="text-[#6B7280] shrink-0" />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-[11px] text-[#1E293B] placeholder-[#9CA3AF]"
          />
        </div>

        <div className="bg-white">
          {loadingOutings ? (
             <div className="p-8 text-center text-[#6B7280] text-xs">Loading requests...</div>
          ) : filteredOutings.length === 0 ? (
            <div className="py-8 text-center text-[#6B7280]">
              <span className="block font-medium text-sm text-[#1E293B]">No pending {activeTab} outing requests.</span>
              <span className="text-xs text-[#9CA3AF]">You're all caught up!</span>
            </div>
          ) : (
            <>
              {/* Mobile View: Request Cards (Matches Mockup .req-card) */}
              <div className="block md:hidden space-y-2.5">
                {filteredOutings.map(req => (
                  <div key={req._id} className="border border-[#E6E8EC] rounded-[12px] p-3 bg-[#FCFCFD]">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-['Lexend'] text-[12.5px] font-semibold text-[#1E293B] tracking-[-0.1px]">
                          {req.student?.name || req.student_name || 'Unknown'}
                        </div>
                        <div className="text-[9.5px] text-[#6B7280] mt-0.5 font-medium">
                          {req.student?.studentId || 'No ID'}
                        </div>
                      </div>
                      <div className="text-right text-[11px] font-bold text-[#1E293B]">
                        {req.leaving_time}
                        <span className="block text-[9.5px] font-medium text-[#6B7280]">
                          {req.submitted_date ? new Date(req.submitted_date).toLocaleDateString('en-GB') : new Date(req.createdAt).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-[#6B7280] mb-2.5 leading-relaxed">
                      <b className="text-[#1E293B] font-semibold">Destination:</b> {req.destination || 'Not specified'} &nbsp;·&nbsp; <b className="text-[#1E293B] font-semibold">Reason:</b> {req.purpose || 'No reason provided'}
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleDirectApprove({ id: req._id })} 
                        className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-[9px] bg-[#E7F6EC] text-[#1E8A4C] font-bold text-[13px] hover:bg-[#D4F1DE] transition-colors"
                      >
                        <Check size={14} /> Approve
                      </button>
                      <button 
                        onClick={() => { setRejectionDialogData({ id: req._id, name: req.student?.name || req.student_name }); setIsRejectionOpen(true); }} 
                        className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-[9px] bg-[#FCE9EA] text-[#C23B3B] font-bold text-[13px] hover:bg-[#F9D6D8] transition-colors"
                      >
                        <X size={14} /> Reject
                      </button>
                      <button 
                        onClick={() => handleOpenDrawer(req._id)} 
                        className="w-[44px] h-8 rounded-[9px] bg-[#EDEFFB] text-[#4A4FD1] flex items-center justify-center hover:bg-[#DEE3FA] transition-colors shrink-0"
                        title="View details"
                      >
                        <Eye size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View: Table layout */}
              <div className="hidden md:block overflow-x-auto">
                <table className="table-enterprise">
                  <thead>
                    <tr>
                      <th>Student Info</th>
                      <th>Destination & Reason</th>
                      <th>Date & Time</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOutings.map(req => (
                      <tr key={req._id}>
                        <td>
                          <div className="flex flex-col">
                            <span className="td-name font-semibold">{req.student?.name || req.student_name || 'Unknown'}</span>
                            <span className="td-time">{req.student?.studentId || 'No ID'}</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex flex-col">
                            <span className="td-name">{req.destination || 'Not specified'}</span>
                            <span className="td-time">{req.purpose || 'No reason provided'}</span>
                          </div>
                        </td>
                        <td>
                          <p className="text-gray-900 font-medium">
                            {req.submitted_date ? new Date(req.submitted_date).toLocaleDateString('en-GB') : new Date(req.createdAt).toLocaleDateString('en-GB')}
                          </p>
                          <p className="text-sm text-gray-500">{req.leaving_time}</p>
                        </td>
                        <td className="text-right">
                           <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleDirectApprove({ id: req._id })} className="p-2.5 text-[#059669] bg-[#ECFDF5] hover:bg-[#D1FAE5] rounded-lg transition-all shadow-sm" title="Approve">
                              <Check size={18} />
                            </button>
                            <button onClick={() => { setRejectionDialogData({ id: req._id, name: req.student?.name || req.student_name }); setIsRejectionOpen(true); }} className="p-2.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-all shadow-sm" title="Reject">
                              <X size={18} />
                            </button>
                            <button onClick={() => handleOpenDrawer(req._id)} className="p-2.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all shadow-sm" title="View Details">
                              <Eye size={18} />
                            </button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>

    <RequestDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        outingId={selectedOutingId}
        currentUserRole="admin"
        onApproveClick={handleDirectApprove}
        onRejectClick={(req: any) => {
          setRejectionDialogData({ id: req.id, name: req.studentName });
          setIsRejectionOpen(true);
        }}
      />

      <RejectionDialog
        isOpen={isRejectionOpen}
        onClose={() => {
          setIsRejectionOpen(false);
          setRejectionDialogData(null);
        }}
        onConfirm={handleRejectConfirm}
        studentName={rejectionDialogData?.name || ''}
        loading={actionLoading}
      />
    </div>
  );
};
