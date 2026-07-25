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

  const [processingId, setProcessingId] = useState<string | null>(null);

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
          )}
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
