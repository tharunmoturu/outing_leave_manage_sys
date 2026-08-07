import React, { useEffect, useState, useCallback } from 'react';
import API from '../services/api';
import { HistoryStatistics } from '../components/history/HistoryStatistics';
import { HistoryFilters } from '../components/history/HistoryFilters';
import { HistoryTable } from '../components/history/HistoryTable';
import { HistoryDrawer } from '../components/history/HistoryDrawer';
import { Pagination } from '../components/caretaker/Pagination';
import { RefreshCw, Search, SlidersHorizontal, History, Calendar, Clock, ArrowLeft, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const CaretakerHistoryPage: React.FC = () => {
  const { user } = useAuth();
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
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [caretakerFilter, setCaretakerFilter] = useState('');

  // Drawer
  const [selectedOuting, setSelectedOuting] = useState<any>(null);
  
  // Mobile Filter Toggle
  const [showFilters, setShowFilters] = useState(false);

  const fetchHistory = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await API.get('/caretaker/history', {
        params: {
          page,
          limit: 10,
          search: searchQuery,
          status: statusFilter,
          type: typeFilter,
          sort: sortOrder,
          dateFrom,
          dateTo,
          caretaker: caretakerFilter
        }
      });
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch caretaker history:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, searchQuery, statusFilter, typeFilter, sortOrder, dateFrom, dateTo, caretakerFilter]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setTypeFilter('All');
    setSortOrder('Newest First');
    setDateFrom('');
    setDateTo('');
    setCaretakerFilter('');
    setPage(1);
  };

  const hasActiveFilters = statusFilter !== 'All' || typeFilter !== 'All' || dateFrom !== '' || dateTo !== '';

  return (
    <div className="animate-fadeIn">
      {/* =========================================================================
          DESKTOP VIEW (Original Web Layout)
         ========================================================================= */}
      <div className="hidden md:block space-y-6 max-w-7xl mx-auto pb-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link to={user?.role?.toLowerCase() === 'admin' ? '/admin/operations' : user?.role?.toLowerCase() === 'sanctionauthority' ? '/sanction/operations' : '/caretaker'} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FEF2F2] text-[#991B1B] hover:bg-[#FEE2E2] rounded-lg font-bold text-[14px] transition-colors -ml-2 border border-[#FCA5A5] shadow-sm">
                <ArrowLeft size={18} strokeWidth={2.5} />
                Back
              </Link>
              <h1 className="text-[28px] font-black text-[#111827] tracking-tight leading-none">
                Outing History
              </h1>
              <span className="px-2.5 py-1 bg-purple-100 text-purple-800 text-[11px] font-black uppercase tracking-wider rounded-full">
                Last 30 Days
              </span>
            </div>
            <p className="text-[14px] font-medium text-[#6B7280]">
              View student outing requests from the previous 30 days.
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
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
          onClear={handleClearFilters}
          isCaretaker={true}
          caretakerFilter={caretakerFilter}
          setCaretakerFilter={setCaretakerFilter}
        />

        {/* Table */}
        <HistoryTable
          history={data?.history || []}
          isLoading={loading}
          onViewDetails={setSelectedOuting}
          isCaretaker={true}
        />

        {/* Pagination */}
        {!loading && data && data.pagination.pages > 1 && (
          <Pagination
            currentPage={data.pagination.page}
            totalPages={data.pagination.pages}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* =========================================================================
          MOBILE VIEW (Mockup Layout)
         ========================================================================= */}
      <div className="block md:hidden space-y-4 pb-20">
        {/* Mobile Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-['Lexend'] text-[20px] font-bold text-[#1E293B] tracking-[-0.3px] m-0">History</h1>
            <p className="text-[11.5px] text-[#6B7280] font-medium m-0">
              <span className="inline-block bg-[#F3F4F6] text-[#4B5563] text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-[#E5E7EB] mr-1">{data?.statistics?.totalRequests || 0}</span>
              records found
            </p>
          </div>
          <button
            onClick={() => fetchHistory(true)}
            disabled={refreshing || loading}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-[#7C2030] bg-white border border-[#E6E8EC] px-3 py-1.5 rounded-lg hover:bg-[#F9FAFB] transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} strokeWidth={2} className={refreshing || loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Mobile Search & Filter */}
        <div className="bg-white border border-[#E6E8EC] rounded-[12px] px-3 py-2.5 flex items-center gap-2">
          <Search size={15} className="text-[#9CA3AF] flex-shrink-0" />
          <input
            type="text"
            placeholder="Search name, ID..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="flex-1 text-[13px] font-medium text-[#1E293B] placeholder-[#9CA3AF] outline-none bg-transparent pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#4B5563]"
            >
              <X size={16} />
            </button>
          )}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-[8px] transition-colors ${showFilters || hasActiveFilters ? 'bg-[#FCE9EA] text-[#7C2030]' : 'bg-[#F3F4F6] text-[#6B7280]'}`}
          >
            <SlidersHorizontal size={14} />
          </button>
        </div>

        {/* Mobile Filter Panel */}
        {showFilters && (
          <div className="bg-white border border-[#E6E8EC] rounded-[14px] p-3 space-y-3 shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className="w-full border border-[#E6E8EC] rounded-[8px] px-2 py-1.5 text-[12px] font-medium text-[#1E293B] outline-none bg-white"
                >
                  <option value="All">All Approved</option>
                  <option value="Approved">Approved</option>
                  <option value="Completed">Completed</option>
                  <option value="Returned">Returned</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                  className="w-full border border-[#E6E8EC] rounded-[8px] px-2 py-1.5 text-[12px] font-medium text-[#1E293B] outline-none bg-white"
                >
                  <option value="All">All</option>
                  <option value="Normal">Normal</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
            </div>
            
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="w-full py-2 bg-[#F3F4F6] text-[#4B5563] text-[11px] font-bold rounded-[8px] mt-2"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1,2,3].map(i => <div key={i} className="h-[100px] bg-white border border-[#E6E8EC] rounded-[14px]" />)}
          </div>
        ) : !data?.history || data.history.length === 0 ? (
          <div className="bg-white border border-[#E6E8EC] rounded-[14px] p-10 text-center space-y-2">
            <History className="mx-auto h-10 w-10 text-[#D1D5DB]" />
            <p className="text-[13px] font-bold text-[#1E293B]">No history found</p>
            <p className="text-[11px] text-[#6B7280]">Adjust your filters to see more.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.history.map((record) => {
              const statusColors: Record<string, { bg: string, text: string, border: string }> = {
                'Pending': { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
                'Approved': { bg: '#E7F6EC', text: '#1E8A4C', border: '#A7F3D0' },
                'Completed': { bg: '#E7F6EC', text: '#1E8A4C', border: '#A7F3D0' },
                'Rejected': { bg: '#FEE2E2', text: '#B91C1C', border: '#FECACA' },
                'Cancelled': { bg: '#F3F4F6', text: '#4B5563', border: '#E5E7EB' },
              };
              const colors = statusColors[record.status] || statusColors['Pending'];
              
              return (
                <div
                  key={record.id}
                  onClick={() => setSelectedOuting(record)}
                  className="bg-white border border-[#E6E8EC] rounded-[14px] p-3 flex flex-col gap-2 active:scale-[0.99] transition-transform cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-['Lexend'] text-[13.5px] font-bold text-[#1E293B]">
                        {record.studentName || record.student_name || record.student?.name || 'Student'}
                      </div>
                      <div className="text-[11px] text-[#6B7280] font-medium mt-0.5">
                        {record.studentId || record.student_id || record.student?.studentId || ''}
                        {(record.branch || record.year) ? ` • ${record.branch || ''} ${record.year || ''}` : ''}
                      </div>
                    </div>
                    <span 
                      className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0"
                      style={{ backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }}
                    >
                      {record.status}
                    </span>
                  </div>
                  <div className="text-[11.5px] text-[#4B5563] space-y-0.5">
                    <div className="flex items-center gap-1.5"><Calendar size={12} className="text-[#9CA3AF]"/> {record.createdAt ? new Date(record.createdAt).toLocaleDateString() : ''}</div>
                    <div className="flex items-start gap-1.5"><Clock size={12} className="text-[#9CA3AF] mt-0.5"/> <span>{record.destination} - {record.reason}</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Mobile Pagination */}
        {!loading && data && data.pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={data.pagination.page <= 1}
              className="px-4 py-2 bg-white border border-[#E6E8EC] rounded-lg text-[12px] font-semibold text-[#4B5563] disabled:opacity-40"
            >← Prev</button>
            <span className="text-[12px] font-medium text-[#6B7280]">{data.pagination.page} / {data.pagination.pages}</span>
            <button
              onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))}
              disabled={data.pagination.page >= data.pagination.pages}
              className="px-4 py-2 bg-white border border-[#E6E8EC] rounded-lg text-[12px] font-semibold text-[#4B5563] disabled:opacity-40"
            >Next →</button>
          </div>
        )}
      </div>

      {/* Drawer */}
      <HistoryDrawer
        outing={selectedOuting}
        isOpen={!!selectedOuting}
        onClose={() => setSelectedOuting(null)}
        isCaretaker={true}
      />

    </div>
  );
};
