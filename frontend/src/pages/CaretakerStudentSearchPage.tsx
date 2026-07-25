import React, { useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import { Search, Loader2, AlertCircle, SlidersHorizontal, X, Users, RefreshCw } from 'lucide-react';
import { StudentSearchBar } from '../components/caretaker/search/StudentSearchBar';
import { StudentCard } from '../components/caretaker/search/StudentCard';
import type { StudentSearchResult } from '../components/caretaker/search/StudentCard';
import { StudentProfileDrawer } from '../components/caretaker/search/StudentProfileDrawer';
import { Pagination } from '../components/caretaker/Pagination';

export const CaretakerStudentSearchPage: React.FC = () => {
  const [students, setStudents] = useState<StudentSearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Pagination
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [branchFilter, setBranchFilter] = useState<string>('All');
  const [yearFilter, setYearFilter] = useState<string>('All');
  const [hostelFilter, setHostelFilter] = useState<string>('All');
  const [activeOutingOnly, setActiveOutingOnly] = useState<boolean>(false);
  
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Drawer
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (branchFilter !== 'All') params.append('branch', branchFilter);
      if (yearFilter !== 'All') params.append('year', yearFilter);
      if (hostelFilter !== 'All') params.append('hostel', hostelFilter);
      if (activeOutingOnly) params.append('activeOutingOnly', 'true');
      
      params.append('page', page.toString());
      params.append('limit', '12');

      const res = await API.get(`/caretaker/student-search?${params.toString()}`);
      
      setStudents(res.data.students);
      setTotalPages(res.data.pagination.pages);
      setTotalCount(res.data.pagination.total);
    } catch (err: any) {
      console.error('Search failed:', err);
      setError(err.response?.data?.message || 'Failed to search students');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, branchFilter, yearFilter, hostelFilter, activeOutingOnly, page]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleClearFilters = () => {
    setBranchFilter('All');
    setYearFilter('All');
    setHostelFilter('All');
    setActiveOutingOnly(false);
    setPage(1);
  };

  const openProfile = (id: string) => {
    setSelectedStudentId(id);
    setIsDrawerOpen(true);
  };

  const closeProfile = () => {
    setIsDrawerOpen(false);
    setSelectedStudentId(null);
  };

  const hasActiveFilters = branchFilter !== 'All' || yearFilter !== 'All' || hostelFilter !== 'All' || activeOutingOnly;
  const activeFilterCount = [branchFilter !== 'All', yearFilter !== 'All', hostelFilter !== 'All', activeOutingOnly].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--color-primary)] bg-opacity-10 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-[var(--color-primary)]" />
            </div>
            Student Search
          </h1>
          <p className="text-[14px] text-gray-500 font-medium mt-1 ml-[52px]">
            Search and view student information, outing status, and recent activity.
          </p>
        </div>
        <button
          onClick={fetchStudents}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Search + Filter Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex-1 min-w-0">
            <StudentSearchBar onSearch={handleSearch} />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all border flex-shrink-0 ${
              showFilters || hasActiveFilters
                ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-md'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal size={16} />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-white bg-opacity-30 text-xs font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Branch */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Branch</label>
                <select
                  value={branchFilter}
                  onChange={(e) => { setBranchFilter(e.target.value); setPage(1); }}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-white shadow-sm"
                >
                  <option value="All">All Branches</option>
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="CE">CE</option>
                  <option value="ME">ME</option>
                  <option value="MME">MME</option>
                  <option value="CHE">CHE</option>
                </select>
              </div>

              {/* Year */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Academic Year</label>
                <select
                  value={yearFilter}
                  onChange={(e) => { setYearFilter(e.target.value); setPage(1); }}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-white shadow-sm"
                >
                  <option value="All">All Years</option>
                  <option value="PUC-1">PUC-1</option>
                  <option value="PUC-2">PUC-2</option>
                  <option value="E1">E1</option>
                  <option value="E2">E2</option>
                  <option value="E3">E3</option>
                  <option value="E4">E4</option>
                </select>
              </div>

              {/* Hostel */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Hostel Block</label>
                <select
                  value={hostelFilter}
                  onChange={(e) => { setHostelFilter(e.target.value); setPage(1); }}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-white shadow-sm"
                >
                  <option value="All">All Hostels</option>
                  <option value="Block A">Block A</option>
                  <option value="Block B">Block B</option>
                  <option value="Block C">Block C</option>
                </select>
              </div>

              {/* Active Outing Toggle */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Quick Filter</label>
                <button
                  onClick={() => { setActiveOutingOnly(!activeOutingOnly); setPage(1); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border font-bold text-sm transition-all ${
                    activeOutingOnly
                      ? 'bg-orange-50 border-orange-300 text-orange-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>Active Outings Only</span>
                  <div className={`w-9 h-5 rounded-full relative transition-colors flex-shrink-0 ${activeOutingOnly ? 'bg-orange-500' : 'bg-gray-300'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform shadow ${activeOutingOnly ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </div>
                </button>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex justify-end mt-3 pt-3 border-t border-gray-200">
                <button
                  onClick={handleClearFilters}
                  className="flex items-center gap-1.5 text-[13px] font-bold text-gray-500 hover:text-[var(--color-primary)] transition-colors"
                >
                  <X size={14} />
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3 font-bold border border-red-200 shadow-sm">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Results Section */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary)] bg-opacity-10 flex items-center justify-center">
            <Loader2 className="animate-spin text-[var(--color-primary)]" size={28} />
          </div>
          <p className="font-semibold text-gray-500 text-sm">Searching students...</p>
        </div>
      ) : students.length > 0 ? (
        <div className="space-y-5">
          {/* Results count + active chip display */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[14px] font-bold text-gray-500">
              Found{' '}
              <span className="text-gray-900 text-[16px]">{totalCount.toLocaleString()}</span>{' '}
              student{totalCount !== 1 ? 's' : ''}
              {searchQuery && (
                <> for "<span className="text-[var(--color-primary)]">{searchQuery}</span>"</>
              )}
            </span>
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2">
                {branchFilter !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold">
                    Branch: {branchFilter}
                    <button onClick={() => { setBranchFilter('All'); setPage(1); }}><X size={11} /></button>
                  </span>
                )}
                {yearFilter !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-bold">
                    Year: {yearFilter}
                    <button onClick={() => { setYearFilter('All'); setPage(1); }}><X size={11} /></button>
                  </span>
                )}
                {hostelFilter !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
                    Hostel: {hostelFilter}
                    <button onClick={() => { setHostelFilter('All'); setPage(1); }}><X size={11} /></button>
                  </span>
                )}
                {activeOutingOnly && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded-full text-xs font-bold">
                    Active Outings
                    <button onClick={() => { setActiveOutingOnly(false); setPage(1); }}><X size={11} /></button>
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {students.map(student => (
              <StudentCard
                key={student.id}
                student={student}
                onViewProfile={openProfile}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-gray-300" />
          </div>
          <h3 className="text-[17px] font-bold text-gray-700 mb-2">No students found</h3>
          <p className="text-gray-400 text-sm max-w-sm mx-auto">
            Try adjusting your search criteria, removing filters, or making sure the student ID is correct.
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="mt-6 px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Drawer */}
      <StudentProfileDrawer
        studentId={selectedStudentId}
        isOpen={isDrawerOpen}
        onClose={closeProfile}
      />
    </div>
  );
};
