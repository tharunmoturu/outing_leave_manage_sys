import React, { useEffect, useState, useCallback } from 'react';
import API from '../services/api';
import { CaretakerFilters } from '../components/caretaker/CaretakerFilters';
import { RequestCard, type PendingNormalRequestItem } from '../components/caretaker/RequestCard';
import { RequestDrawer } from '../components/caretaker/RequestDrawer';
import { Pagination } from '../components/caretaker/Pagination';
import { RejectionDialog } from '../components/caretaker/RejectionDialog';
import { AlertDialog } from '../components/ui/AlertDialog';
import { Inbox, RefreshCw, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const PendingNormalPage: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<PendingNormalRequestItem[]>([]);
  const [totalPending, setTotalPending] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<string>('newest');
  const [leavingDate, setLeavingDate] = useState<string>('');
  const [destination, setDestination] = useState<string>('');

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

  const fetchPendingRequests = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setRefreshing(true);
      setError('');

      try {
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.append('q', searchQuery.trim());
        if (sortOrder) params.append('sort', sortOrder);
        if (leavingDate) params.append('leavingDate', leavingDate);
        if (destination.trim()) params.append('destination', destination.trim());
        params.append('page', page.toString());
        params.append('limit', '10');

        const res = await API.get(`/caretaker/pending-normal?${params.toString()}`);
        setRequests(res.data.requests);
        setTotalPending(res.data.totalPending);
        setTotalPages(res.data.totalPages);
      } catch (err: any) {
        console.error('Failed to fetch pending normal requests:', err);
        setError(err.response?.data?.message || 'Failed to fetch requests');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [searchQuery, sortOrder, leavingDate, destination, page]
  );

  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSortOrder('newest');
    setLeavingDate('');
    setDestination('');
    setPage(1);
  };

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
      setIsDrawerOpen(false); // Close drawer if open
      fetchPendingRequests(true);
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
      setRejectionDialogData(null);
      setIsDrawerOpen(false); // Close drawer if open
      fetchPendingRequests(true);
    } catch (err: any) {
      showAlert('error', 'Rejection Failed', err.response?.data?.message || 'Failed to reject request');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="animate-fadeIn">
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
      <div className="hidden md:block space-y-6 max-w-7xl mx-auto pb-10">
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
          <div>
            <div className="flex items-center gap-3">
              <Link to="/caretaker" className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FEF2F2] text-[#991B1B] hover:bg-[#FEE2E2] rounded-lg font-bold text-[14px] transition-colors -ml-2 border border-[#FCA5A5] shadow-sm">
                <ArrowLeft size={18} strokeWidth={2.5} />
                Back
              </Link>
              <h1 className="text-[28px] font-bold text-[#111827] tracking-tight">
                Pending Normal Outing Requests
              </h1>
              <span className="bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D] text-[13px] font-extrabold px-3 py-1 rounded-full">
                Total Pending: {totalPending}
              </span>
            </div>
          </div>
          <button
            onClick={() => fetchPendingRequests(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 bg-white border border-[#D1D5DB] hover:bg-[#F9FAFB] text-[#374151] text-[14px] font-semibold px-4 py-2 rounded-lg shadow-sm transition-all cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw size={16} className={`${refreshing || loading ? 'animate-spin text-[#800000]' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-[14px]">{error}</div>
        )}

        <CaretakerFilters
          searchQuery={searchQuery}
          onSearchChange={(q) => { setSearchQuery(q); setPage(1); }}
          sortOrder={sortOrder}
          onSortChange={(s) => { setSortOrder(s); setPage(1); }}
          leavingDate={leavingDate}
          onDateChange={(d) => { setLeavingDate(d); setPage(1); }}
          destination={destination}
          onDestinationChange={(dest) => { setDestination(dest); setPage(1); }}
          onClearFilters={handleClearFilters}
        />

        {loading ? (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 shadow-sm space-y-4 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (<div key={i} className="h-12 bg-gray-100 rounded"></div>))}
            </div>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-12 text-center space-y-3">
            <Inbox className="mx-auto h-12 w-12 text-[#9CA3AF]" />
            <h3 className="text-[18px] font-bold text-[#111827]">No pending normal outing requests</h3>
            <p className="text-[14px] text-[#6B7280]">There are currently no normal outing requests awaiting review matching your search criteria.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[12px] font-bold text-[#4B5563] uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Quota</th>
                  <th className="py-3.5 px-4">Reason & Destination</th>
                  <th className="py-3.5 px-4">Leaving / Reporting</th>
                  <th className="py-3.5 px-4">Submitted</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {requests.map((req) => (
                  <RequestCard
                    key={req.id}
                    request={req}
                    onViewDetails={handleOpenDrawer}
                    onApproveClick={handleDirectApprove}
                    onRejectClick={(r) => { setRejectionDialogData(r); setIsRejectionOpen(true); }}
                    currentUserHostel={user?.hostel}
                    currentUserRole={user?.role?.toLowerCase()}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
      </div>

      {/* =========================================================================
          MOBILE VIEW (Mockup Layout)
         ========================================================================= */}
      <div className="block md:hidden space-y-4 pb-20">
        {/* Mobile Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-['Lexend'] text-[20px] font-bold text-[#1E293B] tracking-[-0.3px] m-0">Pending Requests</h1>
            <p className="text-[11.5px] text-[#6B7280] font-medium m-0">
              <span className="inline-block bg-[#FEF3C7] text-[#92400E] text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-[#FCD34D] mr-1">{totalPending}</span>
              awaiting review
            </p>
          </div>
          <button
            onClick={() => fetchPendingRequests(true)}
            disabled={refreshing || loading}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-[#7C2030] bg-white border border-[#E6E8EC] px-3 py-1.5 rounded-lg hover:bg-[#F9FAFB] transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} strokeWidth={2} className={refreshing || loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Mobile Search */}
        <div className="bg-white border border-[#E6E8EC] rounded-[12px] px-3 py-2.5 flex items-center gap-2">
          <Inbox size={15} className="text-[#9CA3AF] flex-shrink-0" />
          <input
            type="text"
            placeholder="Search student name or ID..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="flex-1 text-[13px] font-medium text-[#1E293B] placeholder-[#9CA3AF] outline-none bg-transparent"
          />
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
            <Inbox className="mx-auto h-10 w-10 text-[#D1D5DB]" />
            <p className="text-[13px] font-bold text-[#1E293B]">No pending requests</p>
            <p className="text-[11px] text-[#6B7280]">All caught up!</p>
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
                    <div className="font-['Lexend'] text-[13.5px] font-bold text-[#1E293B]">{req.studentName || 'Student'}</div>
                    <div className="text-[11px] text-[#6B7280] font-medium mt-0.5">{req.studentId || ''}</div>
                  </div>
                  <span className="inline-block bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D] text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                    Pending
                  </span>
                </div>
                {/* Details */}
                <div className="text-[11.5px] text-[#4B5563] space-y-0.5">
                  {req.destination && <div><span className="font-semibold">Dest:</span> {req.destination}</div>}
                  {req.reason && <div><span className="font-semibold">Reason:</span> {req.reason}</div>}
                  {(req.leavingDate || req.leavingTime) && <div><span className="font-semibold">Leaving:</span> {req.leavingDate} {req.leavingTime}</div>}
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

      {/* ── View Details Side Drawer ── */}
      <RequestDrawer 
        outingId={selectedOutingId} 
        isOpen={isDrawerOpen} 
        onClose={handleCloseDrawer} 
        onApproveClick={handleDirectApprove}
        onRejectClick={(req) => { setRejectionDialogData(req); setIsRejectionOpen(true); }}
        currentUserHostel={user?.hostel}
        currentUserRole={user?.role?.toLowerCase()}
      />

      {/* ── Dialogs ── */}
      <RejectionDialog
        isOpen={isRejectionOpen}
        onClose={() => { setIsRejectionOpen(false); setRejectionDialogData(null); }}
        onConfirm={handleRejectConfirm}
        loading={actionLoading}
        studentName={rejectionDialogData?.studentName}
      />
    </div>
  );
};
