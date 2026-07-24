import React from 'react';
import { Search, X, Filter, Calendar, MapPin, ArrowUpDown } from 'lucide-react';

interface CaretakerFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortOrder: string;
  onSortChange: (sort: string) => void;
  leavingDate: string;
  onDateChange: (date: string) => void;
  destination: string;
  onDestinationChange: (dest: string) => void;
  onClearFilters: () => void;
}

export const CaretakerFilters: React.FC<CaretakerFiltersProps> = ({
  searchQuery,
  onSearchChange,
  sortOrder,
  onSortChange,
  leavingDate,
  onDateChange,
  destination,
  onDestinationChange,
  onClearFilters,
}) => {
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    sortOrder !== 'newest' ||
    leavingDate !== '' ||
    destination.trim() !== '';

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-sm space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
        {/* Search Bar */}
        <div className="lg:col-span-4 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search student name or ID..."
            className="w-full pl-9 pr-3 py-2 bg-[#F9FAFB] border border-[#D1D5DB] rounded-lg text-[14px] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#800000] focus:bg-white transition-all"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="lg:col-span-2 relative">
          <div className="relative">
            <select
              value={sortOrder}
              onChange={(e) => onSortChange(e.target.value)}
              className="w-full pl-3 pr-8 py-2 bg-[#F9FAFB] border border-[#D1D5DB] rounded-lg text-[14px] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#800000] focus:bg-white appearance-none transition-all cursor-pointer font-medium"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
            <ArrowUpDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
          </div>
        </div>

        {/* Leaving Date Filter */}
        <div className="lg:col-span-3 relative">
          <div className="relative">
            <input
              type="date"
              value={leavingDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full px-3 py-2 bg-[#F9FAFB] border border-[#D1D5DB] rounded-lg text-[14px] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#800000] focus:bg-white transition-all cursor-pointer"
            />
          </div>
        </div>

        {/* Destination Filter */}
        <div className="lg:col-span-3 relative">
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              value={destination}
              onChange={(e) => onDestinationChange(e.target.value)}
              placeholder="Filter by destination..."
              className="w-full pl-9 pr-3 py-2 bg-[#F9FAFB] border border-[#D1D5DB] rounded-lg text-[14px] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#800000] focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-2 border-t border-[#F3F4F6]">
          <span className="text-[12px] text-[#6B7280] font-medium">Active filters applied</span>
          <button
            onClick={onClearFilters}
            className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#800000] hover:text-[#5c0000] transition-colors cursor-pointer"
          >
            <X size={14} />
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};
