import React, { useEffect, useState, useCallback } from 'react';
import API from '../services/api';
import { EmergencyRequestTable } from '../components/caretaker/EmergencyRequestTable';
import { RequestDrawer } from '../components/caretaker/RequestDrawer';
import { Pagination } from '../components/caretaker/Pagination';
import { RejectionDialog } from '../components/caretaker/RejectionDialog';
import { Loader2, RefreshCw, AlertCircle, FileWarning, ArrowLeft, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { emergencyCategories } from '../components/dashboard/EmergencyCategorySelector';
import { useAuth } from '../contexts/AuthContext';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { AlertDialog } from '../components/ui/AlertDialog';

export const CaretakerPendingEmergencyPage: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [totalPending, setTotalPending] = useState<number>(0);
  const [approvedToday, setApprovedToday] = useState<number>(0);
  const [rejectedToday, setRejectedToday] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<string>('newest');
  const [statusFilter, setStatusFilter] = useState<string>('Pending');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Side Drawer State
  const [selectedOutingId, setSelectedOutingId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Dialog States
  const [rejectionDialogData, setRejectionDialogData] = useState<any>(null);
  const [isRejectionOpen, setIsRejectionOpen] = useState<boolean>(false);
  
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Alert dialog state
  const [alertConfig, setAlertConfig] = useState<{isOpen: boolean, type: 'success' | 'error' | 'info', title: string, message: string}>({
    isOpen: false, type: 'info', title: '', message: ''
  });

  const showAlert = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setAlertConfig({ isOpen: true, type, title, message });
  };

  const fetchEmergencyRequests = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setRefreshing(true);
      setError('');

      try {
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.append('search', searchQuery.trim());
        if (sortOrder) params.append('sort', sortOrder);
        if (statusFilter) params.append('status', statusFilter);
        if (categoryFilter) params.append('category', categoryFilter);
        params.append('page', page.toString());
        params.append('limit', '10');

        const res = await API.get(`/caretaker/emergency-requests?${params.toString()}`);
        setRequests(res.data.requests);
        setTotalPending(res.data.statistics.pendingCount);
        setApprovedToday(res.data.statistics.approvedToday);
        setRejectedToday(res.data.statistics.rejectedToday);
        setTotalPages(res.data.pagination.pages);
      } catch (err: any) {
        console.error('Failed to fetch emergency requests:', err);
        setError(err.response?.data?.message || 'Failed to fetch requests');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [searchQuery, sortOrder, statusFilter, categoryFilter, page]
  );

  useEffect(() => {
    fetchEmergencyRequests();
  }, [fetchEmergencyRequests]);

  useAutoRefresh(fetchEmergencyRequests, 30000);


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
      fetchEmergencyRequests(true);
    } catch (err: any) {
      showAlert('error', 'Approval Failed', err.response?.data?.message || 'Failed to approve request');
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
      setIsDrawerOpen(false);
      setRejectionDialogData(null);
      fetchEmergencyRequests(true);
    } catch (err: any) {
      showAlert('error', 'Rejection Failed', err.response?.data?.message || 'Failed to reject request');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 animate-fadeIn">
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
      <div className="hidden md:block space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/caretaker" className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FEF2F2] text-[#991B1B] hover:bg-[#FEE2E2] rounded-lg font-bold text-[14px] transition-colors -ml-2 border border-[#FCA5A5] shadow-sm">
              <ArrowLeft size={18} strokeWidth={2.5} />
              Back
            </Link>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
              <FileWarning size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Emergency Requests</h1>
            </div>
          </div>
          <button
            onClick={() => fetchEmergencyRequests(true)}
            disabled={loading || refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-bold text-sm shadow-sm disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 border border-red-200 p-6 rounded-xl shadow-sm">
             <h3 className="text-sm font-bold text-red-800 uppercase tracking-wider mb-2">Pending Emergency</h3>
             <div className="text-3xl font-black text-red-950">{totalPending}</div>
          </div>
          <div className="bg-green-50 border border-green-200 p-6 rounded-xl shadow-sm">
             <h3 className="text-sm font-bold text-green-800 uppercase tracking-wider mb-2">Approved Today</h3>
             <div className="text-3xl font-black text-green-950">{approvedToday}</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 p-6 rounded-xl shadow-sm">
             <h3 className="text-sm font-bold text-orange-800 uppercase tracking-wider mb-2">Rejected Today</h3>
             <div className="text-3xl font-black text-orange-950">{rejectedToday}</div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3 font-bold border border-red-200 shadow-sm">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
            >
              <option value="All">All Categories</option>
              {emergencyCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="Oldest First">Oldest First</option>
            </select>
          </div>
        </div>

        {loading && !refreshing ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 space-y-4">
            <Loader2 className="animate-spin text-red-500" size={32} />
            <p className="font-medium text-sm">Loading emergency requests...</p>
          </div>
        ) : (
          <>
            <EmergencyRequestTable 
              requests={requests}
              onViewDetails={handleOpenDrawer}
              onApproveClick={handleDirectApprove}
              onRejectClick={(req) => { setRejectionDialogData(req); setIsRejectionOpen(true); }}
              currentUserHostel={user?.hostel}
              currentUserRole={user?.role?.toLowerCase()}
            />

            {requests.length > 0 && (
              <Pagination 
                currentPage={page} 
                totalPages={totalPages} 
                onPageChange={setPage} 
              />
            )}
          </>
        )}
      </div>

      {/* =========================================================================
          MOBILE VIEW (Mockup Layout)
         ========================================================================= */}
      <div className="block md:hidden space-y-4 pb-20">
        {/* Mobile Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-['Lexend'] text-[20px] font-bold text-[#1E293B] tracking-[-0.3px] m-0">Emergency Req</h1>
            <p className="text-[11.5px] text-[#6B7280] font-medium m-0">
              <span className="inline-block bg-[#FEE2E2] text-[#991B1B] text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-[#FECACA] mr-1">{totalPending}</span>
              urgent requests
            </p>
          </div>
          <button
            onClick={() => fetchEmergencyRequests(true)}
            disabled={refreshing || loading}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-[#7C2030] bg-white border border-[#E6E8EC] px-3 py-1.5 rounded-lg hover:bg-[#F9FAFB] transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} strokeWidth={2} className={refreshing || loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Mobile Search */}
        <div className="relative bg-white border border-[#E6E8EC] rounded-[12px] px-3 py-2.5 flex items-center gap-2">
          <FileWarning size={15} className="text-[#9CA3AF] flex-shrink-0" />
          <input
            type="text"
            placeholder="Search student name or ID..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="flex-1 pr-8 text-[13px] font-medium text-[#1E293B] placeholder-[#9CA3AF] outline-none bg-transparent"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#4B5563] focus:outline-none transition-colors p-1"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-[12px]">{error}</div>
        )}

        {/* Request Cards */}
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1,2,3].map(i => <div key={i} className="h-[110px] bg-white border border-[#E6E8EC] rounded-[14px]" />)}
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white border border-[#E6E8EC] rounded-[14px] p-10 text-center space-y-2">
            <FileWarning className="mx-auto h-10 w-10 text-[#D1D5DB]" />
            <p className="text-[13px] font-bold text-[#1E293B]">No emergency requests</p>
            <p className="text-[11px] text-[#6B7280]">All good right now.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-white border border-[#E6E8EC] rounded-[14px] p-4 space-y-3"
              >
                {/* Student info row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-['Lexend'] text-[13.5px] font-bold text-[#1E293B]">{req.studentName || req.student?.name || 'Student'}</div>
                    <div className="text-[11px] text-[#6B7280] font-medium mt-0.5">{req.studentId || req.student?.studentId || ''}</div>
                  </div>
                  <span className="inline-block bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA] text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                    Emergency
                  </span>
                </div>
                {/* Details */}
                <div className="text-[11.5px] text-[#4B5563] space-y-0.5">
                  {req.category && <div><span className="font-semibold">Type:</span> {req.category}</div>}
                  {req.destination && <div><span className="font-semibold">Dest:</span> {req.destination}</div>}
                  {req.reason && <div><span className="font-semibold">Reason:</span> {req.reason}</div>}
                </div>
                {/* Action buttons */}
                <div className="flex gap-2 pt-1 border-t border-[#F3F4F6]">
                  <button
                    onClick={() => handleDirectApprove(req)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-[#E7F6EC] text-[#1E8A4C] border border-[#A7F3D0] text-[12px] font-bold py-2 rounded-[10px] hover:bg-[#D1FAE5] transition-colors"
                  >
                    <span>✓</span> Approve
                  </button>
                  <button
                    onClick={() => { setRejectionDialogData(req); setIsRejectionOpen(true); }}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA] text-[12px] font-bold py-2 rounded-[10px] hover:bg-[#FED7D7] transition-colors"
                  >
                    <span>✗</span> Reject
                  </button>
                  <button
                    onClick={() => handleOpenDrawer(req.id)}
                    className="px-3 bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB] text-[12px] font-bold rounded-[10px] hover:bg-[#E5E7EB] transition-colors"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mobile Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-4 py-2 bg-white border border-[#E6E8EC] rounded-lg text-[12px] font-semibold text-[#4B5563] disabled:opacity-40"
            >← Prev</button>
            <span className="text-[12px] font-medium text-[#6B7280]">{page} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-4 py-2 bg-white border border-[#E6E8EC] rounded-lg text-[12px] font-semibold text-[#4B5563] disabled:opacity-40"
            >Next →</button>
          </div>
        )}
      </div>

      {/* Details Drawer */}
      <RequestDrawer 
        outingId={selectedOutingId}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onApproveClick={(req) => handleDirectApprove(req)}
        onRejectClick={(req) => { setRejectionDialogData(req); setIsRejectionOpen(true); }}
        currentUserHostel={user?.hostel}
        currentUserRole={user?.role?.toLowerCase()}
      />

      {/* Rejection Dialog */}
      <RejectionDialog 
        isOpen={isRejectionOpen}
        onClose={() => setIsRejectionOpen(false)}
        onConfirm={handleRejectConfirm}
        studentName={rejectionDialogData?.studentName}
        loading={actionLoading}
      />
    </div>
  );
};
