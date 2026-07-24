import React, { useEffect, useState, useCallback } from 'react';
import API from '../services/api';
import { CaretakerFilters } from '../components/caretaker/CaretakerFilters';
import { EmergencyRequestTable } from '../components/caretaker/EmergencyRequestTable';
import { RequestDrawer } from '../components/caretaker/RequestDrawer';
import { Pagination } from '../components/caretaker/Pagination';
import { RejectionDialog } from '../components/caretaker/RejectionDialog';
import { Loader2, RefreshCw, AlertCircle, FileWarning } from 'lucide-react';
import { emergencyCategories } from '../components/dashboard/EmergencyCategorySelector';

export const CaretakerPendingEmergencyPage: React.FC = () => {
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

  const handleClearFilters = () => {
    setSearchQuery('');
    setSortOrder('newest');
    setStatusFilter('Pending');
    setCategoryFilter('All');
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
      setIsDrawerOpen(false);
      fetchEmergencyRequests(true);
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
      setIsDrawerOpen(false);
      setRejectionDialogData(null);
      fetchEmergencyRequests(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject request');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
            <FileWarning size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Emergency Requests</h1>
            <p className="text-sm text-gray-500 font-medium">Review urgent outing requests requiring immediate attention.</p>
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
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
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
          />

          {requests.length > 0 && (
            <Pagination 
              page={page} 
              totalPages={totalPages} 
              onPageChange={setPage} 
            />
          )}
        </>
      )}

      {/* Details Drawer */}
      <RequestDrawer 
        outingId={selectedOutingId}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onApproveClick={(req) => handleDirectApprove(req)}
        onRejectClick={(req) => { setRejectionDialogData(req); setIsRejectionOpen(true); }}
      />

      {/* Rejection Dialog */}
      <RejectionDialog 
        isOpen={isRejectionOpen}
        onClose={() => setIsRejectionOpen(false)}
        onConfirm={handleRejectConfirm}
        studentName={rejectionDialogData?.studentName}
        isSubmitting={actionLoading}
      />
    </div>
  );
};
