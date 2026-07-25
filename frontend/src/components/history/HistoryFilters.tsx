import React from 'react';
import { Search, RefreshCw } from 'lucide-react';

interface HistoryFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  typeFilter: string;
  setTypeFilter: (val: string) => void;
  sortOrder: string;
  setSortOrder: (val: string) => void;
  dateFrom?: string;
  setDateFrom?: (val: string) => void;
  dateTo?: string;
  setDateTo?: (val: string) => void;
  onClear: () => void;
  isCaretaker?: boolean;
}

export const HistoryFilters: React.FC<HistoryFiltersProps> = ({
  searchQuery, setSearchQuery,
  statusFilter, setStatusFilter,
  typeFilter, setTypeFilter,
  sortOrder, setSortOrder,
  dateFrom, setDateFrom,
  dateTo, setDateTo,
  onClear,
  isCaretaker = false
}) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder={isCaretaker ? "Search by student name or ID..." : "Search by destination or reason..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-[14px]"
        />
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        {/* Status Filter */}
        <div className="flex-1 min-w-[150px]">
          <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-[14px]"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Type Filter */}
        <div className="flex-1 min-w-[150px]">
          <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1">Outing Type</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-[14px]"
          >
            <option value="All">All Types</option>
            <option value="Normal">Normal</option>
            <option value="Emergency">Emergency</option>
          </select>
        </div>

        {/* Sort Order */}
        <div className="flex-1 min-w-[150px]">
          <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1">Sort By</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-[14px]"
          >
            <option value="Newest First">Newest First</option>
            <option value="Oldest First">Oldest First</option>
          </select>
        </div>

        {/* Date Range (Caretaker Only) */}
        {isCaretaker && setDateFrom && setDateTo && (
          <>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1">From</label>
              <input
                type="date"
                value={dateFrom || ''}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-[14px]"
              />
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1">To</label>
              <input
                type="date"
                value={dateTo || ''}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-[14px]"
              />
            </div>
          </>
        )}

        {/* Clear Filters */}
        <button
          onClick={onClear}
          className="h-[38px] px-4 flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-[14px] transition-colors"
        >
          <RefreshCw size={16} />
          Clear
        </button>
      </div>
    </div>
  );
};
