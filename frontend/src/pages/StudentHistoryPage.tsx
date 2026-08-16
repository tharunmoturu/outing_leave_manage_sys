import React, { useEffect, useState, useCallback } from 'react';
import API from '../services/api';
import { HistoryStatistics } from '../components/history/HistoryStatistics';
import { HistoryFilters } from '../components/history/HistoryFilters';
import { HistoryTable } from '../components/history/HistoryTable';
import { HistoryDrawer } from '../components/history/HistoryDrawer';
import { Pagination } from '../components/caretaker/Pagination';
import { RefreshCw } from 'lucide-react';

export const StudentHistoryPage: React.FC = () => {
  const [data, setData] = useState<{
    statistics: any;
    history: any[];
    pagination: { total: number; page: number; pages: number };
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('Newest First');

  // Drawer
  const [selectedOuting, setSelectedOuting] = useState<any>(null);

  const fetchHistory = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await API.get('/student/history', {
        params: {
          page,
          limit: 10,
          search: searchQuery,
          status: statusFilter,
          type: typeFilter,
          sort: sortOrder
        }
      });
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch student history:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, searchQuery, statusFilter, typeFilter, sortOrder]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setTypeFilter('All');
    setSortOrder('Newest First');
    setPage(1);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-[28px] font-black text-[#111827] tracking-tight leading-none">
              My Outing History
            </h1>
            <span className="px-2.5 py-1 bg-purple-100 text-purple-800 text-[11px] font-black uppercase tracking-wider rounded-full">
              Last 90 Days
            </span>
          </div>
          <p className="text-[14px] font-medium text-[#6B7280]">
            View your outing requests from the previous 90 days.
          </p>
        </div>
        <button
          onClick={() => fetchHistory(true)}
          disabled={refreshing || loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E7EB] text-[#4B5563] rounded-lg hover:bg-gray-50 hover:text-[#111827] transition-all font-bold text-[14px] shadow-sm disabled:opacity-50"
        >
          <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <HistoryStatistics 
        statistics={data?.statistics || { totalRequests: 0, approved: 0, rejected: 0, completed: 0 }} 
        isLoading={loading && !data} 
      />

      {/* Filters */}
      <HistoryFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        onClear={handleClearFilters}
      />

      {/* Table */}
      <HistoryTable
        history={data?.history || []}
        isLoading={loading}
        onViewDetails={setSelectedOuting}
      />

      {/* Pagination */}
      {!loading && data && data.pagination.pages > 1 && (
        <Pagination
          currentPage={data.pagination.page}
          totalPages={data.pagination.pages}
          onPageChange={setPage}
        />
      )}

      {/* Drawer */}
      <HistoryDrawer
        outing={selectedOuting}
        isOpen={!!selectedOuting}
        onClose={() => setSelectedOuting(null)}
      />

    </div>
  );
};
