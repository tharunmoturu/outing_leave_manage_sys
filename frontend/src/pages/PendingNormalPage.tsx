import React, { useEffect, useState, useCallback } from 'react';
import API from '../services/api';
import { CaretakerFilters } from '../components/caretaker/CaretakerFilters';
import { RequestCard, type PendingNormalRequestItem } from '../components/caretaker/RequestCard';
import { RequestDrawer } from '../components/caretaker/RequestDrawer';
import { Pagination } from '../components/caretaker/Pagination';
import { RejectionDialog } from '../components/caretaker/RejectionDialog';
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
      alert(err.response?.data?.message || 'Failed to approve request');
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
      alert(err.response?.data?.message || 'Failed to reject request');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 animate-fadeIn">
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
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-[14px]">
          {error}
        </div>
      )}

      {/* ── Search & Filter Controls ── */}
      <CaretakerFilters
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setPage(1);
        }}
        sortOrder={sortOrder}
        onSortChange={(s) => {
          setSortOrder(s);
          setPage(1);
        }}
        leavingDate={leavingDate}
        onDateChange={(d) => {
          setLeavingDate(d);
          setPage(1);
        }}
        destination={destination}
        onDestinationChange={(dest) => {
          setDestination(dest);
          setPage(1);
        }}
        onClearFilters={handleClearFilters}
      />

      {/* ── Requests Table ── */}
      {loading ? (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 shadow-sm space-y-4 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-12 text-center space-y-3">
          <Inbox className="mx-auto h-12 w-12 text-[#9CA3AF]" />
          <h3 className="text-[18px] font-bold text-[#111827]">No pending normal outing requests</h3>
          <p className="text-[14px] text-[#6B7280]">
            There are currently no normal outing requests awaiting review matching your search criteria.
          </p>
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
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pagination ── */}
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />

      {/* ── View Details Side Drawer ── */}
      <RequestDrawer 
        outingId={selectedOutingId} 
        isOpen={isDrawerOpen} 
        onClose={handleCloseDrawer} 
        onApproveClick={handleDirectApprove}
        onRejectClick={(req) => { setRejectionDialogData(req); setIsRejectionOpen(true); }}
        currentUserHostel={user?.hostel}
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
